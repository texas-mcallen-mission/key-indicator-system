//@ts-check
/*
        areaIDManager
        Functions calculating, storing, and retrieving areaIDs

        getAreaID()
        loadAreaIDs()
*/

// TODO: UPDATE THIS THING TO USE TYPESCRIPT


/**
 * Returns the areaID string of the given area.
 * @param {*} allSheetData 
 * @param {string} areaName 
 * @returns {string} The areaID string.
 */
function getAreaID(allSheetData, areaName) {
    // this is because 
    // eslint-disable-next-line no-undef
    const cache = CacheService.getDocumentCache();
    const areaIDs_JSONString = cache.get(CONFIG.dataFlow.areaId_cacheKey);

    const areaIDs = areaIDs_JSONString == null
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
    const cSheetData = allSheetData.contact;
    const data = cSheetData.getData();
    const areaIDs = {};

    const cache = CacheService.getDocumentCache();
    cache.remove(CONFIG.dataFlow.areaId_cacheKey);

    for (const contactData of data) {

        const areaName = contactData.areaName;
        const areaEmail = contactData.areaEmail;
        const areaID = emailToID(areaEmail);
        areaIDs[areaName] = areaID;
    }

    const areaIDs_JSONString = JSON.stringify(areaIDs);

    cache.put(CONFIG.dataFlow.areaId_cacheKey,
        areaIDs_JSONString,
        CONFIG.dataFlow.areaId_cacheExpirationLimit);

    console.timeEnd('Time loading areaIDs');
    return areaIDs;


    /**
     * @param {string} email
     */
    function emailToID(email) {
        return "A" + email.split("@")[0];
    }
}




/*global constructSheetData*/
function runLoadAreaIDs() {
    const allSheetData = constructSheetData();
    loadAreaIDs(allSheetData);
}
