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


function testCachingV2() {
    let allSheetData : manySheetDatas = constructSheetDataV3();
    cacheAllSheetData(allSheetData);

    const allSheetData2 : manySheetDatas = getAllSheetDataFromCache();
    if (JSON.stringify(allSheetData) == JSON.stringify(allSheetData2)) {
        console.log("To and From Cache on local sheetData probably worked");
    }

}