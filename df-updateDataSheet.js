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
  Logger.log("BEGINNING UPDATE")

  let allSheetData = constructSheetData();
  loadAreaIDs(allSheetData); //Force a full recalculation

  //checkForErrors()?  Ex. no contact data

  let missionData = pullFormData(allSheetData);

  if (missionData.length == 0) {
    Logger.log("UPDATE COMPLETED - NO NEW FORM RESPONSES FOUND")
    return;
  }

  if (isContactDataOld(allSheetData)) importContacts(allSheetData);

  let contacts = getContactData(allSheetData);

  let leaders = getLeadershipAreaData(contacts);

  missionData = mergeIntoMissionData(missionData, contacts, "contact data");
  missionData = mergeIntoMissionData(missionData, leaders, "leadership data");


  pushToDataSheetV2(allSheetData, missionData);

  markDuplicates(allSheetData);

  pushErrorMessages();  //Unimplemented

  Logger.log("UPDATE COMPLETED")
}







function markDuplicates(allSheetData) {
  console.warn(`TODO: markDuplicates() v2 not yet implemented`)
}

/**
  * Flags duplicate responses in the Data sheet.
  */
function markDuplicates_old(allSheetData) { //                                  TODO: Don't pull the whole sheet?
  Logger.log("Marking duplicate responses. Pulling data...")
  Logger.log("TODO: Don't pull the whole sheet?")

  let sd = allSheetData.data;
  let sheet = sd.getSheet();
  let vals = sheet.getDataRange().getValues();

  let mostRecentResponse = {};   //Previously checked responses. Uses rIDs as keys, and contains row numbers for marking and timestamps for comparison
  let duplicates = [];  //Row indices that contain duplicates
  let skippedRows = []; //Row indices that are blank

  let maxRow = vals.length - 1;   //Used for bounds on the edit range
  let minRow;



  let firstPass = true; //Used to make the loop run twice (in case it's not sorted by timestamp)

  for (let row = maxRow; row > 0; row--) {

    let log = `Checking if row index ${row} is a duplicate...`

    //Skip empty rows
    if (vals[row][sd.getIndex('areaName')] == "") {   //5586
      log += '\nSkipping row';
      skippedRows.push(row);

      if (DBCONFIG.LOG_DUPLICATES) Logger.log(log);
      continue;
    }


    minRow = row; //Update topmost row

    let areaName = vals[row][sd.getIndex('areaName')];
    let areaID = getAreaID(allSheetData, areaName);
    let kiDate = vals[row][sd.getIndex('kiDate')];
    let tstamp = vals[row][sd.getIndex('formTimestamp')]

    let rID = areaID + " | " + kiDate;   //Defined such that duplicate responses should have identical response IDs

    log += `\nResponse ID: '${rID}'`

    if (typeof mostRecentResponse[rID] == 'undefined') { //If this is the first ocurrence, add to mostRecentResponse and skip
      mostRecentResponse[rID] = { "tstamp": tstamp, "row": row };

      log += `\nFirst ocurrence, continuing.`
      if (DBCONFIG.LOG_DUPLICATES) Logger.log(log);
      continue;
    }

    let prev = mostRecentResponse[rID];  //Previous ocurrence
    log += `\nFound previous ocurrence on row index ${prev.row}, comparing...`

    //Handle comparing historical records (which don't have timestamps)
    if (typeof prev.tstamp == "string") {

      if (typeof tstamp == "string")
        log += `\nBoth ocurrences are historical records, can't determine which to keep. Keeping the current one and marking previous as a duplicate`
      else
        log += `\nPrev ocurrence is a historical record. Keeping the current one and marking previous as a duplicate`

      duplicates.push(prev.row);
      mostRecentResponse[rID] = { "tstamp": tstamp, "row": row };
    }
    else if (typeof tstamp == "string") {
      log += `Current ocurrence is a historical record, but the previous one is not. Keeping the previous and marking the current as a duplicate`
      duplicates.push(row);
    }
    else  //Handle non-historical responses
    {
      //If this is more recent than the previous ocurrence
      if (tstamp.getTime() > prev.tstamp.getTime()) {
        log += `\nThe current response is more recent, replacing and marking the old as duplicate.`

        duplicates.push(prev.row);
        mostRecentResponse[rID] = { "tstamp": tstamp, "row": row };
      }
      else {
        log += `\nThe previous response is more recent, marking the current as duplicate.`
        duplicates.push(row);
      }
    }

    if (DBCONFIG.LOG_DUPLICATES) Logger.log(log);
  }


  Logger.log(`Finished pulling duplicate data. Pushing to sheet...`)


  let out = [];

  for (let row = minRow; row <= maxRow; row++) {
    let isDuplicate = duplicates.includes(row);
    let isSkipped = skippedRows.includes(row);
    out[row - minRow] = [];
    out[row - minRow][0] = isDuplicate ? true :
      isSkipped ? "" : false;
  }

  sheet.getRange(minRow + 1, sd.getIndex('isDuplicate') + 1, out.length, 1).setValues(out);


  Logger.log(`Finished marking duplicate responses.`)

}











/**
  * Pulls data from the Form Response sheet and adds areaIDs, marking responses as having been pulled.
  */
function pullFormData(allSheetData) {
  Logger.log("Pulling Form Data...")

  let fSheetData = allSheetData.form;
  let responses = fSheetData.getData();
  let missionData = [];

  Logger.log(`[TODO] Limit pullFormData from pulling the whole sheet - sheetData.getRecentData(maxRows) or something similar? Specify max and min rows?`)


  for (let response of responses) {
    if (response.responsePulled == true || response.areaName == "")
      continue;

    if (DBCONFIG.LOG_RESPONSE_PULLED) Logger.log(`Pulling response for area: '${response.areaName}'`);

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
  if (DBCONFIG.SKIP_MARKING_PULLED) {
    Logger.log(`[DEBUG] Skipping marking Form Responses as having been pulled into the data sheet: SKIP_MARKING_PULLED is set to true`)
  }
  else {
    let formSheet = fSheetData.getSheet();
    let markerRange = formSheet.getRange("B2:B" + formSheet.getLastRow());
    formSheet.getRange("B2").setValue(true);
    formSheet.getRange("B2").autoFill(markerRange, SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  }

  Logger.log("Finished pulling Form Data.")
  return missionData;
}









/**
  * Pulls data from the Contact Data sheet and adds areaIDs.
  */
function getContactData(allSheetData) {

  Logger.log("Getting data from Contact Data sheet...")

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

  Logger.log("Finished pulling contact data.")

  return contacts;


  function warnDataCollision(area, id, otherArea) {
    // Logger.log(`Potential data collision while pulling data from contacts: tried to add area '${area}' with id '${id}', but that id already has data for area '${otherArea}'`)
    console.warn(`Potential data collision while pulling data from contacts: tried to add area '${area}' with id '${id}', but that id already has data for area '${otherArea}'`)
  }
}



/**
  * Merges data from an additional data source (contact data, config data, etc) into missionData, assuming the formatting Reference.gs describes.
  * Used to pull contact and leader data into missionData.
  * Takes a reference to missionData, a reference to the datasource, and an ID string for that datasource.
  */
function mergeIntoMissionData(missionData, sourceData, sourceID) {
  Logger.log(`Beginning to merge source '${sourceID}' into missionData`)

  let newMissionData = [];
  let mdKeys = Object.keys(missionData[0]);
  let sdKeys = Object.keys(sourceData[missionData[0].areaID]);
  let keys = new Set(mdKeys.concat(sdKeys)); //Set of all keys from both objects (a Set removes duplicates automatically)


  for (let missionAreaData of missionData) {
    let areaID = missionAreaData.areaID;
    let areaName = missionAreaData.areaName;
    let sourceAreaData = sourceData[missionAreaData.areaID];

    if (DBCONFIG.LOG_MERGE_DATA) (`Merging area ${areaName} (${areaID}) from source ${sourceID}`);

    if (typeof sourceAreaData == 'undefined') //Error if can't find corresponding areaID
      throw `Found a form response for area '${areaName}' (id '${areaID}'), but couldn't find that area in source '${sourceID}'`;


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

    if (typeof newAreaData.log == 'undefined') newAreaData.log = {};
    if (typeof newAreaData.log.merges == 'undefined') newAreaData.log.merges = {};
    newAreaData.log.merges[sourceID] = mergeLog;

    newMissionData.push(newAreaData);
  }

  Logger.log(`Finished merging source '${sourceID}'`)

  return newMissionData;



  function logNeither(key, areaID, areaName, sourceID) {
    Logger.log(`Warning: couldn't find key ${key} for area ${areaID} (${areaName}) in either mission data or source ${source}!`)
  }

  function logDataCollision(key, areaID, areaName, sourceID, sourceAreaDataOfKey, missionAreaDataOfKey) {
    Logger.log(`Warning: possible data collision on key '${key}' for area '${areaName}' (id '${areaName}'). Source '${sourceID}' has value '${sourceAreaDataOfKey}' while missionData has value '${missionAreaDataOfKey}'`);
  }

}










/**
  * Inserts responses from missionData into the Data sheet.
  */
function pushToDataSheetV2(allSheetData, missionData) {
  Logger.log("Pushing data to Data sheet...")

  let out = [];

  let dSheetData = allSheetData.data;
  let dataSheet = dSheetData.getSheet();


  for (let areaData of missionData) {
    let row = [];

    if (!areaData.log) areaData.log = "";
    areaData.log = "[V2] WIP - log is unimplemented"

    for (let key of dSheetData.getKeys()) {
      if (typeof areaData[key] == 'undefined') {
        Logger.log(`No data for key ${key} in data for area ${areaData.areaName} (areaID ${areaData.areaID}) when pushing to Data sheet. Pushing an empty string instead`);
        row.push("");
        continue;
      }


    }
  }



  for (let area of missionData) {
    let row = [];

    area.log = "WIP - log is unimplemented"
    area.hasContactData = true

    for (let key in area) {
      let index = dSheetData.getIndex(key);
      if (typeof index == 'undefined')
        throw `Column index not found in Data sheet for key '${key}'`;

      if (row[index])
        Logger.log(`Potential data collision for key '${key}'`);
      else
        row[index] = area[key];
    }

    out.push(row);
  }


  dataSheet.insertRowsAfter(1, out.length);
  let range = dataSheet.getRange(2, 1, out.length, out[0].length);

  out.reverse();
  range.setValues(out);


  Logger.log(`Finished pushing to Data sheet.`)


}









// /**
//   * Inserts responses from missionData into the Data sheet.
//   */
// function pushToDataSheet(allSheetData, missionData) {
//   Logger.log("Pushing data to Data sheet...")

//   let out = [];

//   let dSheetData = allSheetData.data;
//   let dataSheet = dSheetData.getSheet();

//   for (let area of missionData) {
//     let row = [];

//     area.log = "WIP - log is unimplemented"
//     area.hasContactData = true



//     for (let key in area) {
//       let index = dSheetData.getIndex(key);
//       if (typeof index == 'undefined')
//         throw `Column index not found in Data sheet for key '${key}'`;

//       if (row[index])
//         Logger.log(`Potential data collision for key '${key}'`);
//       else
//         row[index] = area[key];
//     }


//   }


//   dataSheet.insertRowsAfter(1, out.length);


//   let range = dataSheet.getRange(2, 1, out.length, out[0].length);

//   out.reverse();

//   range.setValues(out);


//   Logger.log(`Finished pushing to Data sheet.`)

// }





/**
  * Unimplemented
  */
function pushErrorMessages() {
  Logger.log("[TODO] Pushing error messages unimplemented")
}





