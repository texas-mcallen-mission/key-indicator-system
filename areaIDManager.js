/*
        areaIDManager
        Functions calculating, storing, and retrieving areaIDs

        getAreaID()
        loadAreaIDs()
*/



function testAreaIDs() {
  let id = getAreaIDV2('my area name');
  Logger.log(id);
}



function getAreaIDV2(areaName) {
  let cache = CacheService.getDocumentCache();
  let areaIDs_JSONString = cache.get('areaIDs');

  let areaIDs = areaIDs_JSONString==null ?
                   loadAreaIDsV2() :
                   JSON.parse(areaIDs_JSONString);

  if (typeof areaIDs[areaName] == 'undefined')
    throw new ReferenceError(`Unable to get areaID - couldn't find area '${areaName}'`);

  return areaIDs[areaName];
}



function loadAreaIDsV2() {

  let allSheetData = constructSheetData();
  let cSheetData = allSheetData.contact;
  let data = cSheetData.getData();
  let areaIDs = {};

  let cache = CacheService.getDocumentCache();
  cache.remove('allSheetData');

  for (let contact in data) {
    let areaName = contact.areaName;
    let areaEmail = contact.areaEmail;
    let areaID = emailToID(areaEmail);
    areaIDs[areaName] = areaID;
  }


  function emailToID(email) {
    return "A" + email.split("@")[0];
  }


  return areaIDs;
}




















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





/**
 * Reloads areaIDs.
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














