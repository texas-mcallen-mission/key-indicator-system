/*
        updateDataSheet
        Functions controlling data flow into the Data sheet.
        Pulls from the Form Responses, Contact Data, and (currently unimplemented) Config sheets

        updateDataSheet()
        pullFormData()
        getContactData()
        getLeaderData()
        mergeIntoMissionData()
        pushToMainSheet()
        pushErrorMessages()
*/



/**
  * Updates the Data sheet.
  */
function updateDataSheet() {
    console.log("BEGINNING UPDATE");


    // build the sheet data- we need contact data for mission org information
    const allSheetData: manySheetDatas = constructSheetDataV3(["contact", "form","data"]);
    
    const cDataSheet: SheetData = allSheetData.contact;
    const fDataSheet: SheetData = allSheetData.form;


    // sync dataflow columns, to allow new questions to automatically get pushed through to the data
    console.log("Syncing Columns From Form Responses To Data")
    allSheetData.data.addKeys(fDataSheet)

    // patching to use better marking method
    const iterantKey = fDataSheet.iterantKey

    if (CONFIG.dataFlow.forceAreaIdReloadOnUpdateDataSheet) {
        loadAreaIDs(cDataSheet);
    } //Force a full recalculation

    //checkForErrors()?  Ex. no contact data
    
    let missionData = pullFormData(fDataSheet, cDataSheet);

    if (missionData.length == 0) {
        console.log("UPDATE COMPLETED - NO NEW FORM RESPONSES FOUND");
        return;
    }

    // const numberOfEntries = missionData.length
    // former ignore
    // makeSheet();
    refreshContacts(allSheetData);

    const contacts = getContactData(cDataSheet);

    const leaders = getLeadershipAreaData(contacts);

    missionData = mergeIntoMissionData(missionData, contacts, "contact data");
    missionData = mergeIntoMissionData(missionData, leaders, "leadership data");

    // FIRST, ADD THE DATA TO THE SHEETS
    allSheetData.data.appendData(missionData);
    
    // THEN MARK THE STUFF AS HAVING BEEN PULLED

    // make the partial modify set
    const markPulledSet:kiDataEntry[] = []
    for (const entry of missionData) {
        const markerData: kiDataEntry = { responsePulled: true }
        // this associates every row entry from the data with the partial modify subset
        markerData[iterantKey] = entry[iterantKey]
        markPulledSet.push(markerData)
    }

    if (CONFIG.dataFlow.skipMarkingPulled) {
        console.warn("[DEBUG] Skipping marking responses as pulled");
    } else {
        // then push that set to the form response sheet
        allSheetData.form.updateRows(markPulledSet)
        // compared to the old version, this is a *lot* easier to read.
        // const column = allSheetData.form.getIndex("responsePulled")
        // const minRow = allSheetData.form.rsd.headerRow + 1
        // allSheetData.form.rsd.sheet.getRange(minRow, column,numberOfEntries,1)
    }

    if (CONFIG.dataFlow.skipMarkingPulled) {
        Logger.log("[DEBUG] Skipping marking Form Responses as having been pulled into the data sheet: dataFlow.skipMarkingPulled is set to true");
        return        
    } else {
        markDuplicatesV2(allSheetData.data);
    }

    pushErrorMessages();  //Unimplemented

    console.log("UPDATE COMPLETED");
}












/**
  * Pulls data from the Form Response sheet and adds areaIDs. Hard-codes column order for the initial columns, and pulls later columns automatically, using the values in the header row as keys.
  */
function pullFormData(fSheetData:SheetData, cSheetData:SheetData) {
    console.log("Pulling Form Data...");
    // Bugfix: the following was previously inside of the last if/else loop.

    const formSheet = fSheetData.getSheet();
    const markerRange = formSheet.getRange("B2:B" + formSheet.getLastRow());
    const responses = fSheetData.getData();
    const missionData = [];


    console.log("[TODO] Limit pullFormData from pulling the whole sheet - sheetData.getRecentData(maxRows) or something similar? Specify max and min rows?");


    for (const response of responses) {
        if (response.responsePulled == true || response.areaName == "")
            continue;

        if (CONFIG.dataFlow.log_responsePulled) console.log("Pulling response for area: '" + response.areaName + "'");

        response.areaID = getAreaID(cSheetData, response.areaName);

        response.log =
        {
            'areaID': response.areaID,
            'areaName': response.areaName,
            'processDate': (new Date()).toDateString(),
            'formDataPulled': true,
            'formDataPulledTime': (new Date()).toTimeString(),
            'formTimestamp': response.formTimestamp,
        };

        missionData.push(response);
    }



    Logger.log("Finished pulling Form Data.");

    return missionData;
}









/**
  * Pulls data from the Contact Data sheet and adds areaIDs.
  * Honestly more of a loadContactData because it just pulls from Sheets.
  */
function getContactData(cSheetData: SheetData) {

    console.log("Getting data from Contact Data sheet...");

    //const cSheetData = allSheetData.contact;
    const contactData = cSheetData.getData();
    const contacts = {}; //contactData, keyed by areaID
    for (const contact of contactData) {
        contact.areaID = getAreaID(cSheetData, contact.areaName);
        if ((typeof contact.log) == 'undefined')
            contact.log = {};
        contact.log.addedContactData = true;
        contact.log.addedContactDataTime = (new Date()).toTimeString();

        if ((typeof contacts[contact.areaID]) != 'undefined')
            warnDataCollision(contact.areaName, contact.areaID, contacts[contact.areaID].areaName);

        contacts[contact.areaID] = contact;
    }

    console.log("Finished pulling contact data.");

    return contacts;


    function warnDataCollision(area, id, otherArea) {
        console.warn("Potential data collision while pulling data from contacts: tried to add area '" + area + "' with id '" + id + "', but that id already has data for area '" + otherArea + "'");
    }
}



/**
  * Merges data from an additional data source (contact data, config data, etc) into missionData, assuming the formatting Reference.gs describes.
  * Used to pull contact and leader data into missionData.
  * Takes a reference to missionData, a reference to the datasource, and an ID string for that datasource.
  */
function mergeIntoMissionData(missionData, sourceData, sourceID) {
    console.log("Beginning to merge source '" + sourceID + "' into missionData");

    const newMissionData = [];
    const mdKeys = Object.keys(missionData[0]);
    const sdKeys = Object.keys(sourceData[missionData[0].areaID]);
    const keys = new Set(mdKeys.concat(sdKeys)); //Set of all keys from both objects (a Set removes duplicates automatically)


    for (const missionAreaData of missionData) {
        const areaID = missionAreaData.areaID;
        const areaName = missionAreaData.areaName;
        const sourceAreaData = sourceData[missionAreaData.areaID];


        if (CONFIG.dataFlow.log_dataMerge) { Logger.log("Merging area '" + areaName + "' (id '" + areaID + "') from source " + sourceID); }


        if (typeof sourceAreaData == 'undefined') //Error if can't find corresponding areaID
            throw "Found a form response for area '" + areaName + "' (id '" + areaID + "'), but couldn't find that area in source '" + sourceID + "'";


        const newAreaData = {};
        const mergeLog =
        {
            'missingKeys': [],
            'collisions': {},
        };

        for (const key of keys) {

            const mHasKey = typeof missionAreaData[key] != 'undefined';
            const sHasKey = typeof sourceAreaData[key] != 'undefined';

            //Log warnings if neither object has this key (should be unreachable), or if both do and they disagree
            if (!mHasKey && !sHasKey) {
                logNeither(key, areaID, areaName);
                mergeLog.missingKeys.push(key);
            }
            else if (mHasKey && sHasKey && missionAreaData[key] != sourceAreaData[key]) {
                logDataCollision(key, areaID, areaName, sourceID, sourceAreaData[key], missionAreaData[key]);
                mergeLog.collisions[key] =
                {
                    'missionVal': missionAreaData[key],
                    'sourceVal': sourceAreaData[key]
                };

            }

            //Set new value
            //Neither: empty string; missionData only: missionData value; sourceData only (or both): source value
            newAreaData[key] = (!mHasKey && !sHasKey) ? "" : (mHasKey && !sHasKey) ? missionAreaData[key] : sourceAreaData[key];

        }
        // this is a super weird one, probably only solvable by either getting rid of the hard reference to 
        // @ts-ignore
        if (typeof newAreaData.log == 'undefined') newAreaData.log = {};
        // @ts-ignore
        if (typeof newAreaData.log.merges == 'undefined') newAreaData.log.merges = {};
        // @ts-ignore
        newAreaData.log.merges[sourceID] = mergeLog;

        newMissionData.push(newAreaData);
    }

    console.log("Finished merging source '" + sourceID + "'");

    return newMissionData;




    function logNeither(key, areaID, areaName, sourceID = ".") {

        console.warn("Warning: couldn't find key '" + key + "' for area '" + areaName + "' (id '" + areaID + "') in either mission data or source '" + sourceID + "'");
    }

    function logDataCollision(key, areaID, areaName, sourceID, sourceAreaDataOfKey, missionAreaDataOfKey) {
        console.log("Warning: possible data collision on key '" + key + "' for area '" + areaName + "' (id '" + areaID + "'). Source '" + sourceID + "' has value '" + sourceAreaDataOfKey + "' while missionData has value '" + missionAreaDataOfKey + "'");
    }

}


/**
  * Inserts responses from missionData into the Data sheet.
  */
function pushToDataSheetV2(allSheetData, missionData) {
    console.log("Pushing data to Data sheet...");

    const dSheetData = allSheetData.data;
    dSheetData.insertData(missionData);

    console.log("Finished pushing to Data sheet.");
}




/**
  * Unimplemented
  */
function pushErrorMessages() {
    console.info("TODO: implement pushErrorMessages()");
}
