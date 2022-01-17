/*
        updateDataSheet.gs
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
    if (DEBUG) Logger.log(`[DEBUG] Running in Debug Mode. Welcome, Spreadsheet Master`)
  
    let allSheetData = constructSheetData();
  
    //checkForErrors()?  Ex. no contact data
  
    let missionData = pullFormData(allSheetData);
  
    if (missionData.length==0) {
      Logger.log("UPDATE COMPLETED - NO NEW FORM RESPONSES FOUND")
      return;
    }
  
    if (isContactDataOld(allSheetData)) importContacts(allSheetData);
  
    let contacts = getContactData(allSheetData);
  
    let leaders = getLeadershipAreaData(contacts);
  
    missionData = mergeAreaDataIntoMissionData(missionData, contacts, "contact AreaData");
    missionData = mergeAreaDataIntoMissionData(missionData, leaders, "leadership AreaData");
  
  
    pushToDataSheet(allSheetData, missionData);
  
    markDuplicates(allSheetData);
  
    pushErrorMessages();  //Unimplemented
  
    Logger.log("UPDATE COMPLETED")
  }
  
  
  
  
  
  
  
  
  
  /**
   * Flags duplicate responses in the Data sheet.
   * WIP
   */
  function markDuplicates(allSheetData) { //                                  TODO: Don't pull the whole sheet?
    Logger.log("Marking duplicate responses. Pulling data...")
    Logger.log("TODO: Don't pull the whole sheet?")
  
    let sd = allSheetData.data;
    let sheet = sd.getSheet();
    let vals = sheet.getDataRange().getValues();
  
    let mostRecentResponse = {};   //Previously checked responses. Uses rIDs as keys, and contains row numbers for marking and timestamps for comparison
    let duplicates = [];  //Row indices that contain duplicates
    let skippedRows = []; //Row indices that are blank
  
    let maxRow = vals.length-1;   //Used for bounds on the edit range
    let minRow;
  
  
  
    let firstPass = true; //Used to make the loop run twice (in case it's not sorted by timestamp)
  
    for (let row = maxRow; row>0; row--) {
  
      let log = `Checking if row index ${row} is a duplicate...`
  
      //Skip empty rows
      if (vals[row][sd.getIndex('areaName')] == "") {   //5586
        log += '\nSkipping row';
        skippedRows.push(row);
  
        if (DEBUG && LOG_DUPLICATES) Logger.log(log);
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
        mostRecentResponse[rID] = {"tstamp": tstamp, "row": row};
  
        log += `\nFirst ocurrence, continuing.`
        if (DEBUG && LOG_DUPLICATES) Logger.log(log);
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
        mostRecentResponse[rID] = {"tstamp": tstamp, "row": row};
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
          mostRecentResponse[rID] = {"tstamp": tstamp, "row": row};
        }
        else {
          log += `\nThe previous response is more recent, marking the current as duplicate.`
          duplicates.push(row);
        }
      }
  
      if (DEBUG && LOG_DUPLICATES) Logger.log(log);
    }
  
  
    Logger.log(`Finished pulling duplicate data. Pushing to sheet...`)
  
  
    let out = [];
  
    for (let row = minRow; row <= maxRow; row++) {
      let isDuplicate = duplicates.includes(row);
      let isSkipped = skippedRows.includes(row);
      out[row-minRow] = [];
      out[row-minRow][0] = isDuplicate ? true :
                           isSkipped ? "" : false;
    }
  
    sheet.getRange(minRow+1, sd.getIndex('isDuplicate')+1,   out.length, 1).setValues(out);
  
    
    Logger.log(`Finished marking duplicate responses.`)
  
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  /**
   * Pulls data from the Form Response sheet and pushes it into the missionData variable.
   * Hard-codes column order for cols A-L, and pulls later cols automatically, using row 1 vals as keys.
   */
  function pullFormData(allSheetData) {
    Logger.log("Pulling Form Data...")
  
    let missionData = [];
  
  
    let fSheetData = allSheetData.form;
    let formSheet = fSheetData.getSheet();
  
    let formData = formSheet.getDataRange().getValues();
  
  
    Logger.log(`[TODO] Note: limit pullFormData from pulling the whole sheet...?`)
  
  
    for (let r = 1; r < formData.length; r++) {
  
      let responsePulled =  formData[r][fSheetData.getIndex("responsePulled")]
      let areaName =        formData[r][fSheetData.getIndex("areaName")]
      if (responsePulled == true)  //Skip this response if it has already been pulled into the Data sheet
        continue;
      if (areaName == "")  //Skip blank rows
        continue;
      
  
      if (DEBUG && LOG_RESPONSE_PULLED) Logger.log(`Pulling response for area: '${areaName}'`);
  
  
      //Hard coded properties
      let isDuplicate =     formData[r][fSheetData.getIndex("isDuplicate")]
      let formTimestamp =   formData[r][fSheetData.getIndex("formTimestamp")]
      let submissionEmail = formData[r][fSheetData.getIndex("submissionEmail")]
      let kiDate =          formData[r][fSheetData.getIndex("kiDate")]
  
      let np =  formData[r][fSheetData.getIndex("np")]
      let sa =  formData[r][fSheetData.getIndex("sa")]
      let bd =  formData[r][fSheetData.getIndex("bd")]
      let bc =  formData[r][fSheetData.getIndex("bc")]
      let rca = formData[r][fSheetData.getIndex("rca")]
      let rc =  formData[r][fSheetData.getIndex("rc")]
      let cki = formData[r][fSheetData.getIndex("cki")]
  
      let formNotes = formData[r][fSheetData.getIndex("formNotes")];
  
      let areaObj = {
  
        areaData:
        {
          "areaName" : areaName,
          "np" :  np,
          "sa" :  sa,
          "bd" :  bd,
          "bc" :  bc,
          "rc" :  rc,
          "rca" : rca,
          "cki" : cki,
          "kiDate" :    kiDate,
          "formNotes" : formNotes
        },
  
        metadata:
        {
          "isDuplicate" : isDuplicate,
          "formTimestamp" : formTimestamp,
          "submissionEmail" : submissionEmail,
          "areaID" : getAreaID(allSheetData, areaName),
          "pulledFormData" : true
        }
  
  
      };
  
      //Automatically populated properties (ex. baptism sources)
  
      for (let col = 14; col < formData[0].length; col++) {
        let key = formData[0][col];
        let property = formData[r][col];
  
        if (key != "")
          areaObj.areaData[key] = property;
      }
  
  
      missionData.push(areaObj);
  
    }
  
  
    //Mark responses as having been pulled
    if (DEBUG && SKIP_MARKING_PULLED) {
      Logger.log(`[DEBUG] Skipping marking Form Responses as having been pulled into the data sheet: SKIP_MARKING_PULLED is set to true`)
    } else {
      let markerRange = formSheet.getRange("B2:B" + formSheet.getLastRow());
      formSheet.getRange("B2").setValue(true);
      formSheet.getRange("B2").autoFill(markerRange, SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
    }
  
    Logger.log("Finished pulling Form Data.")
    return missionData;
  }
  
  
  
  
  
  
  
  
  
  /**
   * Pulls data from the Contact Data sheet and returns a formatted object containing it.
   * Uses the format described in Reference.gs
   */
  function getContactData(allSheetData) {
  
    Logger.log("Getting data from Contact Data sheet...")
  
    //Pull Contact data (defines column order of Contact sheet)
  
  
  
    let contacts = {};
  
    let cSheetData = allSheetData.contact;
    let contactSheet = cSheetData.getSheet();
    let contactData = contactSheet.getDataRange().getValues();
  
  
  
  
    //Data straight from the Contact Data sheet
    for (let r=1; r<contactData.length; r++) {
  
      let areaData = {};
      let metadata = {};
  
  
      metadata.hasContactData = true
      metadata.dateContactGenerated = contactData[r][cSheetData.getIndex("dateContactGenerated")]
  
  
      areaData.areaEmail = contactData[r][cSheetData.getIndex("areaEmail")]
      areaData.areaName =  contactData[r][cSheetData.getIndex("areaName")]
  
      areaData.name1 =      contactData[r][cSheetData.getIndex("name1")]
      areaData.position1 =  contactData[r][cSheetData.getIndex("position1")]
      areaData.isTrainer1 = contactData[r][cSheetData.getIndex("isTrainer1")]
  
      areaData.name2 =      contactData[r][cSheetData.getIndex("name2")]
      areaData.position2 =  contactData[r][cSheetData.getIndex("position2")]
      areaData.isTrainer2 = contactData[r][cSheetData.getIndex("isTrainer2")]
  
      areaData.name3 =      contactData[r][cSheetData.getIndex("name3")]
      areaData.position3 =  contactData[r][cSheetData.getIndex("position3")]
      areaData.isTrainer3 = contactData[r][cSheetData.getIndex("isTrainer3")]
  
      areaData.district = contactData[r][cSheetData.getIndex("district")]
      areaData.zone =     contactData[r][cSheetData.getIndex("zone")]
  
      areaData.unitString =       contactData[r][cSheetData.getIndex("unitString")]
      areaData.hasMultipleUnits = contactData[r][cSheetData.getIndex("hasMultipleUnits")]
      areaData.languageString =   contactData[r][cSheetData.getIndex("languageString")]
  
      areaData.isSeniorCouple = contactData[r][cSheetData.getIndex("isSeniorCouple")]
      areaData.isSisterArea =   contactData[r][cSheetData.getIndex("isSisterArea")]
        
      areaData.hasVehicle =   contactData[r][cSheetData.getIndex("hasVehicle")]
      areaData.vehicleMiles = contactData[r][cSheetData.getIndex("vehicleMiles")]
      areaData.vinLast8 =     contactData[r][cSheetData.getIndex("vinLast8")]
  
      areaData.aptAddress = contactData[r][cSheetData.getIndex("aptAddress")]
  
      metadata.areaID =    getAreaID(allSheetData, areaData.areaName)
  
      contacts[metadata.areaID] = {areaData: areaData, metadata: metadata};
    }
  
    
  
    Logger.log("Finished pulling contact data.")
    return contacts;
  }
  
  
  
  
  
  
  
  /**
   * Merges data from an additional data source (contact data, config data, etc) into missionData, assuming the formatting Reference.gs describes.
   * Used to pull contact and leader data into missionData.
   * Takes a reference to missionData, a reference to the datasource, and an ID string for that datasource.
   */
  function mergeAreaDataIntoMissionData(missionData, source, sourceID) {
    Logger.log(`Beginning to merge source '${sourceID}' into missionData`)
  
    let newMissionData = [];
  
    for (let i=0; i<missionData.length; i++) {
      let missionAreaObj = missionData[i];
      let areaID = missionAreaObj.metadata.areaID;
      let areaName = missionAreaObj.areaData.areaName;
      let sourceAreaObj = source[areaID];
  
      if (LOG_MERGE_DATA) (`Merging areaID '${areaID}'`)
  
      if (typeof sourceAreaObj == 'undefined')
        throw `Found a form response for area '${areaName}', but couldn't find that area in ${sourceID}! Area ID: ${areaID}`;     //68790819, Beeville B       6974450
  
      let newAreaObj = {
        areaData: {
          ...missionAreaObj.areaData,
          ...sourceAreaObj.areaData
        },
        metadata: {
          ...missionAreaObj.metadata,
          ...sourceAreaObj.metadata
        }
      };
  
      newMissionData.push(newAreaObj);
  
    }
  
    Logger.log(`Finished merging source '${sourceID}'`)
  
      // let sourceAreaData = source[areaID];
  
      // for (let key in sourceAreaData) {
      //   keyLog += key + ", "
  
      //   //If areaData doesn't already have this property, add it.
      //   if (!areaData[key]) {     
      //     areaData[key] = sourceAreaData[key];
      //   }
        
      //   //If it does already have this property, but if the value is different, throw error
      //   else if (areaData[key] != sourceAreaData[key]) {
      //      logDataCollisionError(sourceID, areaData.areaName, areaID, key, sourceAreaData[key], areaData[key]);
      //   }
  
      // }
      // if (DEBUG && LOG_MERGE_DATA) {
      //   Logger.log( keyLog!="" ? ("Property keys: " + keyLog)
      //               : `Couldn't find contact data for area '${areaData.areaName}' when merging`);
      // }
  
  
  
  
  
    // //Logs a data collision error with the given arguments
    // function logDataCollisionError(sourceID, areaName, areaID, key, sourceAreaDataOfKey, areaDataOfKey) {
    //   Logger.log(`Data collision while merging from source '${sourceID}' into area '${areaName}' (areaID '${areaID}'). Source value for key '${key}' is '${sourceAreaDataOfKey}' while existing value is '${areaDataOfKey}'. Keeping existing value`);
    // }
  
  
    return newMissionData;
  
  }
  
  
  
  
  
  
  
  
  /**
   * Inserts responses from missionData into the Data sheet.
   */
  function pushToDataSheet(allSheetData, missionData) {
    Logger.log("Pushing data to Data sheet...")
  
    let out = [];
  
    let dSheetData = allSheetData.data;
    let dataSheet = dSheetData.getSheet();
  
    for (let area of missionData) {
      let areaData = area.areaData;
      let metadata = area.metadata;
      let row = [];
  
      metadata.log = "WIP - log is unimplemented"
      metadata.hasContactData = true
  
  
  
      for (let key in areaData) {
        let index = dSheetData.getIndex(key);
        if (typeof index == 'undefined')
          throw `Column index not found in Data sheet for areaData key '${key}'`;
  
        if (row[index])
          Logger.log(`Potential data collision for areaData key '${key}'`);
        else
          row[index] = areaData[key];
      }
  
  
  
  
  
      for (let key in metadata) {
        let index = dSheetData.getIndex(key);
        if (typeof index == 'undefined')
          continue;
  
        if (row[index])
          Logger.log(`Potential data collision for metadata key '${key}'`);
        else
          row[index] = metadata[key];
      }
  
  
      out.push(row);
    }
  
    dataSheet.insertRowsAfter(1, out.length);
  
  
    let range = dataSheet.getRange(2,1, out.length, out[0].length);
  
    out.reverse();
  
    range.setValues(out);
  
  
    Logger.log(`Finished pushing to Data sheet.`)
  
  }
  
  
  
  
  
  /**
   * Unimplemented
   */
  function pushErrorMessages() {
    Logger.log("[TODO] Pushing error messages unimplemented")
  }
  
  
  
  
  
  
  
  
  
  
  
  
