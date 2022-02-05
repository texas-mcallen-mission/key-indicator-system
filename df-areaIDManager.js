//@ts-check
/*
        areaIDManager
        Functions calculating, storing, and retrieving areaIDs

        getAreaID()
        loadAreaIDs()
*/



/**
 * Returns the areaID string of the given area.
 * @param {*} allSheetData 
 * @param {string} areaName 
 * @returns {string} The areaID string.
 */
function getAreaID(allSheetData, areaName) {
    let cache = CacheService.getDocumentCache();
    let areaIDs_JSONString = cache.get(CONFIG.CACHE_AREA_IDS_KEY);

    let areaIDs = areaIDs_JSONString == null
        ? loadAreaIDs(allSheetData)
        : JSON.parse(areaIDs_JSONString);

    if (typeof areaIDs[areaName] == 'undefined')
        throw new ReferenceError("Unable to get areaID - couldn't find area " + areaName);

    return areaIDs[areaName];
}



/**
 * @param {*} allSheetData
 */
function loadAreaIDs(allSheetData) {

    console.log('Loading areaIDs');
    console.time('Time loading areaIDs');

    // let allSheetData = constructSheetData();
    let cSheetData = allSheetData.contact;
    let data = cSheetData.getData();
    let areaIDs = {};

    let cache = CacheService.getDocumentCache();
    cache.remove(CONFIG.CACHE_AREA_IDS_KEY);

    for (let contactData of data) {
        //@ts-ignore
        let areaName = contactData.areaName;
        //@ts-ignore
        let areaEmail = contactData.areaEmail;
        let areaID = emailToID(areaEmail);
        areaIDs[areaName] = areaID;
    }

    let areaIDs_JSONString = JSON.stringify(areaIDs);
    cache.put(CONFIG.CACHE_AREA_IDS_KEY, areaIDs_JSONString, CONFIG.CACHE_AREA_IDS_EXP_LIMIT); //TODO Add config option for exp time?

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
