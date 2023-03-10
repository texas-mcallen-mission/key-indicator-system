/**
 * @abstract We work with a lottt of sheets, so we built
 *  on top of sheetCore to make building lots of sheets faster / easier.
 */

/**
 * constructSheetDataV3: creates an allSheetData type object, returns only the ones you need or it return all of them.
 *
 * @param {string[] | void} target
 * @return {*}  {manySheetDatas}
 * @global
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
    cacheSheetDataEntries_(allSheetData)
    return allSheetData;
}

const sdCacheString = "SHEETCACHE_"

/**
 * @description stores sheetData entries in the AppsScript cache for faster performance.
 * @param {manySheetDatas} anySheetData
 */
function cacheSheetDataEntries_(anySheetData: manySheetDatas,timeoutInMinutes=15) {
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


/**
 * @description removes sheetData entries in ``sheetDataConfig`` from cache if they exist.
 * @global
 */
function deleteSheetDatasFromCache() {
    const cache = CacheService.getScriptCache()
    const keys = Object.keys(sheetDataConfig)
    const cacheKeys = []
    for (const key of keys) {
        cacheKeys.push(sdCacheString + key)
    }
    console.log("Removed",cacheKeys,"from cache")
    cache.removeAll(keys)
}





function testCachingV2() {
    /**
     * @description basic timing function thingy for debugging / testing this.
     * @param {Date} time
     * @return {*}  {number}
     */
    function timeFunction_(time: Date): number {
        const endTime = new Date();
        return endTime.getTime() - time.getTime();
    }
    deleteSheetDatasFromCache();
    // clearAllSheetDataCache()
    // using constructSheetData now caches on the backend
    // the first call will cache it
    const startTime = new Date();
    const allSheetData: manySheetDatas = constructSheetDataV3();
    const noCacheTime = timeFunction_(startTime);
    console.log(String(noCacheTime));
    const start2 = new Date();

    const allSheetData2 = constructSheetDataV3();
    const cachedTime = timeFunction_(start2);

    console.log("uncached duration, ms:", noCacheTime, "cached duration, ms:", cachedTime);
}