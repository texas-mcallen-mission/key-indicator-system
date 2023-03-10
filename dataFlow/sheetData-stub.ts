//  * Get all defined instances of SheetData.
//  *
//  * SheetData is basically a better version of Sheet. It provides greater access to the data in a sheet than the Sheet class does, given certain assumptions about the format of that Sheet. Functions in the Sheet class usually organize data by row, then by column index number; most SheetData functions organize data by row, then by column header string (or hardcoded key string). This preserves structure when reordering columns or moving data between Sheets as long as corresponding columns have identical headers.
//  * @see SheetData
//  * @readonly
//  * @enum {SheetData}
//  * @param {Boolean} force - If true, skips checking the cache and forces a recalculation. Default value is false.
//  */

// function constructSheetData(force = false) {
//     if (CONFIG.dataFlow.allSheetData_cacheEnabled && !force) {

//         const allSheetData : manySheetDatas = getAllSheetDataFromCache();
//         if (allSheetData != null) return allSheetData;
//     }
//     const allSheetData: manySheetDatas = constructSheetDataV3(["data","form"]);
//     const preKey = allSheetData.data.getKeys();
//     // syncDataFlowCols_(allSheetData.form, allSheetData.data);
//     console.warn("HEYO Syncing keys *should* be happening...")
//     allSheetData.data.addKeys(allSheetData.form)
//     const postKey = allSheetData.data.getKeys();
//     console.log(preKey);
//     console.log(postKey);
//     return allSheetData;
// }

function testConstructor() {
    const test : manySheetDatas = constructSheetDataV3();
}

function clearAllSheetDataCache() {
    const cache = CacheService.getDocumentCache();
    // former ignore
    cache.remove("allSheetData");
}

function timeFunction_(time: Date): number{
    const endTime = new Date()
    return endTime.getTime()-time.getTime()
}

function testCachingV2() {
    clearAllSheetDataCache()
    // using constructSheetData now caches on the backend
    // the first call will cache it
    const startTime = new Date()
    let allSheetData: manySheetDatas = constructSheetDataV3();
    const noCacheTime = timeFunction_(startTime)

    const start2 = new Date()
    
    allSheetData = constructSheetDataV3()
    const cachedTime = timeFunction_(start2)

    console.log("uncached duration, ms:",noCacheTime,"cached duration, ms:",cachedTime)
}