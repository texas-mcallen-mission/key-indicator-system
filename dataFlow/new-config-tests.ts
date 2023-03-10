// this is a test to see if I can let constructSheetDataV3() coexist with remotes and keep cache working

/*
    local:
    form
    data
    contact
    debug


    remote:
    serviceRep
    tmmReport
    fbReferrals
    remoteData (If I add it, lol)

*/

/*
    This is about as simple as I could make the config while covering all the bases.
    sheetDataEntry is the required things to make a sheetData class
    sheetDataHolder is the way to make a big object of entries.

    columnConfig is how I get the any:number object necessary for configuring column position keys in sheetData.


*/

function testStringify() { // maybe problems with constructSheetDataV3
    const test = JSON.stringify(sheetDataConfig);
    console.log(test);

    const test2 = JSON.stringify(sheetDataConfig);
    console.log(test2);
    const allSheetData: manySheetDatas = constructSheetDataV3(["remote"]);
    // let allSheetDataRemote = constructSheetDataV2(sheetDataConfig.remote);
    // I think I can turn this bad boi into a cached sheetData again if I try hard enough

    const testingSheet = SpreadsheetApp.getActiveSpreadsheet();

    const jsonTestSheet = testingSheet.getSheetByName("JSON-testing");

    if (jsonTestSheet != null) {
        const localRange = jsonTestSheet.getRange(1, 1);
        localRange.setValue(JSON.stringify(allSheetData));
        const remoteRange = jsonTestSheet.getRange(2, 1);
        remoteRange.setValue(JSON.stringify(allSheetData));
    }
}


// /**
//  * constructSheetDataV2: creates an allSheetData type object, which should *ideally* be able to run from cache on remote targets as well!
//  *
//  * @param {manySheetDataEntries} target
//  * @return {*}  {manySheetDatas}
//  */
// function constructSheetDataV2(target: manySheetDataEntries): manySheetDatas {
//     const allSheetData: manySheetDatas = {};
//     const keys: string[] = ["Constructed SheetData objects for:"];
//     for (const key in target) {
//         const entry: sheetDataEntry = target[key];
        
//         const rawSheetData = new RawSheetData(entry);
//         const sheetData = new SheetData(rawSheetData);
//         keys.push(key);
//         allSheetData[key] = sheetData;
//     }
//     // dunno if this will work or not yet, but we'll see!
//     // syncDataFlowCols_(allSheetData.form, allSheetData.data)

//     return allSheetData;
// }

/**
 * constructSheetDataV3: creates an allSheetData type object, which should *ideally* be able to run from cache on remote targets as well! returns only the ones you need or it return all of them.
 *
 * @param {string[] | void} target
 * @return {*}  {manySheetDatas}
 */
function constructSheetDataV3(target: string[] | void) : manySheetDatas {
    const allSheetData: manySheetDatas = {};
    let targetSheets:string[] = []
    if (!target) {
        targetSheets = Object.keys(sheetDataConfig)
    } else {
        targetSheets = [...target]
    }

    for (const entry of targetSheets) {
        const cacheData: void | SheetData = getSingleSheetDataFromCache_(entry)
        if (cacheData) {
            allSheetData[entry] = cacheData
        } else {
            allSheetData[entry] = new SheetData(new RawSheetData(sheetDataConfig[entry]))
        }
    }
    cacheSheetDataEntries(allSheetData)
    return allSheetData;
}

const sdCacheString = "SHEETCACHE_"

/**
 * @description stores sheetData entries in the AppsScript cache for faster performance.
 * @param {manySheetDatas} anySheetData
 */
function cacheSheetDataEntries(anySheetData: manySheetDatas,timeoutInMinutes=15) {
    const cache = CacheService.getScriptCache()
    const timeout = timeoutInMinutes * 60 
    // first: update cache for given entries
    for (const key in anySheetData) {
        const cacheKey = sdCacheString + key
        const cacheDataObj = anySheetData[key].getConfigForCache()
        if (!isSheetAlreadyCached_(cacheKey)) {
            const cacheData = JSON.stringify(cacheDataObj)
            cache.put(cacheKey,cacheData,timeout)
        } else {
            console.log("skipped caching to enforce caching timeout")
        }

    }

}

function isSheetAlreadyCached_(target: string): boolean{
    // let returnVal = false
    
    const cache = CacheService.getScriptCache()
    const cacheKey = sdCacheString + target
    const cacheData = cache.get(cacheKey)
    if (cacheData) {
        return true
    } else {
        return false
    }

}

/**
 * @description loads a sheetData entry from cache, if it exists, otherwise return void.
Returning void allows you to test 
 * @param {string} target
 * @return {*}  {(SheetData|void)}
 */
function getSingleSheetDataFromCache_(target: string):SheetData|void {
    const cache = CacheService.getScriptCache()
    const cacheKey = sdCacheString + target
    const cacheData = cache.get(cacheKey)
    if (cacheData) {
        const dataEntry: sheetDataEntry = JSON.parse(cacheData)
        return new SheetData(new RawSheetData(dataEntry))
    } else {
        console.warn("sheetDataCache cache miss!")
        return
    }
}

function deleteSheetDatasFromCache() {
    const cache = CacheService.getScriptCache()
    const keys = Object.keys(sheetDataConfig)
    const cacheKeys = []
    for (const key of keys) {
        cacheKeys.push(sdCacheString + key)
    }
    console.log("Removed",keys,"from cache")
    cache.removeAll(keys)
}

