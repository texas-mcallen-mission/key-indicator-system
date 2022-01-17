/*
        updateHelper.gs
        Secondary functions for functions defined in updateDataSheet.gs

        getAreaID()
        loadAreaIDs()
        markDuplicates()
*/

/**
 * Returns the areaID string for the given area name.
 */
 function getAreaID(allSheetData, areaName) {
    if (typeof areaIDs == 'undefined') {
      loadAreaIDs(allSheetData);
    }
  
    if (areaIDs[areaName])
      return areaIDs[areaName];
  
    Logger.log(`Couldn't find areaID for area ${areaName}. Reloading areaIDs and retrying...`);
    loadAreaIDs(allSheetData);
  
    if (areaIDs[areaName])
      return areaIDs[areaName];
  
    throw(`Unable to get areaID - reloaded areaIDs but still couldn't find area ${areaName}`)
  }
  
  
  
  // /**
  //  * Reloads areaIDs, including from historical data.
  //  * WIP
  //  */
  // function loadAreaIDs(allSheetData) {
  //   loadAreaIDs(allSheetData, false);
  // }
  
  
  
  /**
   * Reloads areaIDs.
   * WIP
   */
  function loadAreaIDs(allSheetData) {
    areaIDs = {};
  
    Logger.log("Loading areaIDs...")
  
    let pullOldData = true;
  
    if (pullOldData) {
      let dSheetData = allSheetData.data;
      let dataVals = dSheetData.getSheet().getDataRange().getValues();
  
      for (let r=1; r<dataVals.length; r++) { //Indexes start from 0, skipping header row
        let areaName = dataVals[r][dSheetData.getIndex("areaName")];
        if (areaName=="") {
          continue;
        }
  
        let areaID = dataVals[r][dSheetData.getIndex("areaID")];
  
        //Debugging
        if (typeof areaIDs[areaName] != "undefined" && areaIDs[areaName] != areaID) {
          Logger.log(`Area '${areaName}' has areaID '${areaIDs[areaName]}', but on row ${r+1} has areaID '${areaID}'`)
        }
  
        if (!areaIDs[areaName])
          areaIDs[areaName] = areaID;
  
  
        //Debugging
      }
    }
  
  
  
    let cSheetData = allSheetData.contact;
    let contactVals = cSheetData.getSheet().getDataRange().getValues();
  
    for (let r=1; r<contactVals.length; r++) {
      let areaName = contactVals[r][cSheetData.getIndex("areaName")];
      let areaEmail = contactVals[r][cSheetData.getIndex("areaEmail")];
      if (!areaIDs[areaName])
        areaIDs[areaName] = emailToID(areaEmail);
    }
  
    Logger.log(`Finished loading areaIDs.`)
  
  
  
    function emailToID(email) {
      return "A" + email.split("@")[0];
    }
  
  }
  
  
  
  
  
  
  
  function runLoadAreaIDs() {
    let allSheetData = constructSheetData();
  
    loadAreaIDs(allSheetData);
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  