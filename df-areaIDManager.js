//@ts-check
/*
        areaIDManager
        Functions calculating, storing, and retrieving areaIDs

        getAreaID()
        loadAreaIDs()
*/

let AREA_IDS_CACHE_KEY = 'turtles and unicorns';

function testAreaIDs() {
  let id = getAreaID('my area name');
  Logger.log(id);
}



function getAreaID(allSheetData, areaName) {
  let cache = CacheService.getDocumentCache();
  let areaIDs_JSONString = cache.get(AREA_IDS_CACHE_KEY);

  let areaIDs = areaIDs_JSONString == null
    ? loadAreaIDs(allSheetData)
    : JSON.parse(areaIDs_JSONString);

  if (typeof areaIDs[areaName] == 'undefined')
    throw new ReferenceError(`Unable to get areaID - couldn't find area '${areaName}'`);

  return areaIDs[areaName];
}



/**
 * @param {{ contact: SheetData; }} allSheetData
 */
function loadAreaIDs(allSheetData) {

  console.log(`Loading areaIDs`)
  console.time('Time loading areaIDs')

  // let allSheetData = constructSheetData();
  let cSheetData = allSheetData.contact;
  let data = cSheetData.getData();
  let areaIDs = {};

  let cache = CacheService.getDocumentCache();
  cache.remove(AREA_IDS_CACHE_KEY);

  for (let contactData of data) {
    //@ts-ignore
    let areaName = contactData.areaName;
    //@ts-ignore
    let areaEmail = contactData.areaEmail;
    let areaID = emailToID(areaEmail);
    areaIDs[areaName] = areaID;
  }

  let areaIDs_JSONString = JSON.stringify(areaIDs);
  cache.put(AREA_IDS_CACHE_KEY, areaIDs_JSONString);

  console.timeEnd('Time loading areaIDs');
  return areaIDs;


  /**
   * @param {string} email
   */
  function emailToID(email) {
    return "A" + email.split("@")[0];
  }
}




function runLoadAreaIDs() {
  let allSheetData = constructSheetData();
  loadAreaIDs(allSheetData);
}
