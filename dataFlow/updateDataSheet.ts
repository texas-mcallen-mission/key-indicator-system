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
    Logger.log("BEGINNING UPDATE");

    let allSheetData: any = constructSheetData();
    if (CONFIG.dataFlow.forceAreaIdReloadOnUpdateDataSheet) { loadAreaIDs(allSheetData); } //Force a full recalculation

    //checkForErrors()?  Ex. no contact data

    let missionData = pullFormData(allSheetData);

    if (missionData.length == 0) {
        Logger.log("UPDATE COMPLETED - NO NEW FORM RESPONSES FOUND");
        return;
    }
    // former ignore
    refreshContacts(allSheetData);

    let contacts = getContactData(allSheetData);

    let leaders = getLeadershipAreaData(contacts);

    missionData = mergeIntoMissionData(missionData, contacts, "contact data");
    missionData = mergeIntoMissionData(missionData, leaders, "leadership data");


    allSheetData.data.insertData(missionData);

    markDuplicates(allSheetData);

    pushErrorMessages();  //Unimplemented

    Logger.log("UPDATE COMPLETED");
}












/**
  * Pulls data from the Form Response sheet and adds areaIDs. Hard-codes column order for the initial columns, and pulls later columns automatically, using the values in the header row as keys.
  */
function pullFormData(allSheetData) {
    Logger.log("Pulling Form Data...");

    let fSheetData = allSheetData.form;
    let responses = fSheetData.getData();
    let missionData = [];
    let rangeString = "B2:B" + responses.getLastRow()

    Logger.log("[TODO] Limit pullFormData from pulling the whole sheet - sheetData.getRecentData(maxRows) or something similar? Specify max and min rows?");


    for (let response of responses) {
        if (response.responsePulled == true || response.areaName == "")
            continue;

        if (CONFIG.dataFlow.log_responsePulled) Logger.log("Pulling response for area: '" + response.areaName + "'");

        response.areaID = getAreaID(allSheetData, response.areaName);

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


    //Mark responses as having been pulled
    console.info("TODO: Improve marking responses as pulled");
    if (CONFIG.dataFlow.skipMarkingPulled) {
        Logger.log("[DEBUG] Skipping marking Form Responses as having been pulled into the data sheet: dataFlow.skipMarkingPulled is set to true");
    }
    else {
        console.log("During Testing: PUT A BREAKPOINT HERE!")
        let formSheet = fSheetData.getSheet();
        let markerRange = formSheet.getRange(rangeString); // was originally checking the sheet again, and occasionally new responses would slip in here and cause problems
        formSheet.getRange("B2").setValue(true);
        formSheet.getRange("B2").autoFill(markerRange, SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
    }

    Logger.log("Finished pulling Form Data.");
    return missionData;
}









/**
  * Pulls data from the Contact Data sheet and adds areaIDs.
  */
function getContactData(allSheetData) {

    Logger.log("Getting data from Contact Data sheet...");

    let cSheetData = allSheetData.contact;
    let contactData = cSheetData.getData();
    let contacts = {}; //contactData, keyed by areaID
    for (let contact of contactData) {
        contact.areaID = getAreaID(allSheetData, contact.areaName);
        if ((typeof contact.log) == 'undefined')
            contact.log = {};
        contact.log.addedContactData = true;
        contact.log.addedContactDataTime = (new Date()).toTimeString();

        if ((typeof contacts[contact.areaID]) != 'undefined')
            warnDataCollision(contact.areaName, contact.areaID, contacts[contact.areaID].areaName);

        contacts[contact.areaID] = contact;
    }

    Logger.log("Finished pulling contact data.");

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
    Logger.log("Beginning to merge source '" + sourceID + "' into missionData");

    let newMissionData = [];
    let mdKeys = Object.keys(missionData[0]);
    let sdKeys = Object.keys(sourceData[missionData[0].areaID]);
    let keys = new Set(mdKeys.concat(sdKeys)); //Set of all keys from both objects (a Set removes duplicates automatically)


    for (let missionAreaData of missionData) {
        let areaID = missionAreaData.areaID;
        let areaName = missionAreaData.areaName;
        let sourceAreaData = sourceData[missionAreaData.areaID];

        if (CONFIG.dataFlow.log_dataMerge) Logger.log("Merging area '" + areaName + "' (id '" + areaID + "') from source " + sourceID);

        if (typeof sourceAreaData == 'undefined') //Error if can't find corresponding areaID
            throw "Found a form response for area '" + areaName + "' (id '" + areaID + "'), but couldn't find that area in source '" + sourceID + "'";


        let newAreaData = {};
        let mergeLog =
        {
            'missingKeys': [],
            'collisions': {},
        };

        for (let key of keys) {

            let mHasKey = typeof missionAreaData[key] != 'undefined';
            let sHasKey = typeof sourceAreaData[key] != 'undefined';

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

    Logger.log("Finished merging source '" + sourceID + "'");

    return newMissionData;



    function logNeither(key, areaID, areaName, sourceID:any = ".") {
        console.warn("Warning: couldn't find key '" + key + "' for area '" + areaName + "' (id '" + areaID + "') in either mission data or source '" + sourceID + "'");
    }

    function logDataCollision(key, areaID, areaName, sourceID, sourceAreaDataOfKey, missionAreaDataOfKey) {
        Logger.log("Warning: possible data collision on key '" + key + "' for area '" + areaName + "' (id '" + areaID + "'). Source '" + sourceID + "' has value '" + sourceAreaDataOfKey + "' while missionData has value '" + missionAreaDataOfKey + "'");
    }

}


/**
  * Inserts responses from missionData into the Data sheet.
  */
function pushToDataSheetV2(allSheetData, missionData) {
    Logger.log("Pushing data to Data sheet...");

    let dSheetData = allSheetData.data;
    dSheetData.insertData(missionData);

    Logger.log("Finished pushing to Data sheet.");
}




/**
  * Unimplemented
  */
function pushErrorMessages() {
    console.info("TODO: implement pushErrorMessages()");
}
