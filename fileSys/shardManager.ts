// Goal:  Figure out how to split the reportCreator report generators into multiple functions so that I can make the effective update time much smaller.

// interface fsEntry {
//     folderName: string,
//     parentFolder: string,
//     folderId: string,
//     sheetID1: string,
//     sheetID2: string,
//     areaID: string,
//     folderBaseName: string,
//     seedId: string,
// }

interface shardCountObj {
    [index:string]:number
}

/**
 * @description Recalculates shard groupings for zone, district, and area filesystem entries, which we then use to break up the report updater stuff to go significantly faster than we could before.
 * @global
 */
function updateShards() {
    clearAllSheetDataCache()
    const NUMBER_OF_SHARDS = CONFIG.fileSystem.shardManager.number_of_shards
    const MAX_ALLOWABLE_SPREAD = CONFIG.fileSystem.shardManager.max_spread
    const allSheetData = constructSheetDataV3(["zoneFilesys","distFilesys","areaFilesys"])
    const filesystems = loadFilesystems_(allSheetData);

    for (const fs in filesystems) {
        // let outData = []
        // creates a object to += counts on, so that values already assigned a particular shard won't be as likely to get shifted to a different shard.
        

        const shardCounter: shardCountObj = {
            "1":0
        }
        for (let i = 1; i <= NUMBER_OF_SHARDS; i++){
            shardCounter[i.toString()] = 0
        }
        /* loop 1:
            1. create count for how many things are assigned to particular shards
            2. If shard assignment is out of bounds, reassign
            NUMBER_OF_SHARDS shall be 1-indexed- anything 
        */
        // I hate it when that happens
        for (const entry in filesystems[fs].sheetData) {
            // let Testentry: fsEntry = entry

            // If there's not a seed / shard assigned to a particular entry, figure out
            // which grouping has the smallest population and add to that

            const entryData = filesystems[fs].sheetData[entry]
            // console.log(entryData.folderBaseName, entryData.seedId, typeof entryData.seedId)
            if (entryData.seedId <= 0 || entryData.seedId == "" || entryData.seedId == undefined || parseInt(entryData.seedId) > NUMBER_OF_SHARDS) {
                const shardKey = getKeyWithSmallestValue_(shardCounter)
                entryData.seedId = shardKey
                shardCounter[shardKey] += 1
            } else {
                shardCounter[entryData.seedId.toString()] += 1
            }
            filesystems[fs].sheetData[entry] = entryData
        }
        
        // this should work, I think.
        
        
        /* Loop 2:
            If there's a big spread on shard numbers, then go and reassign some over.
            The way this is done should keep as many as possible on their original/current shard assignments
            to minimize the chance that a report continuously gets dropped through the cracks.
        */
        for (const entry in filesystems[fs].sheetData) {
            const entryData = filesystems[fs].sheetData[entry]

            if (isSpreadBig_(shardCounter, MAX_ALLOWABLE_SPREAD) == false) {
                break
            }
            const smallestShard = getKeyWithSmallestValue_(shardCounter)
            if (entryData.seedId.toString() != smallestShard) {
                const currentSeed = entryData.seedId.toString()
                shardCounter[currentSeed] -= 1
                entryData.seedId = smallestShard;
                shardCounter[smallestShard] += 1
            }
            filesystems[fs].sheetData[entry] = entryData
            
            
        }

        
        // }

        console.log(shardCounter)
        // send data to display:
        filesystems[fs].fsData.setData(filesystems[fs].sheetData)
    }


}

/**
 * @description internal function that calculates whether or not to reassign something or not.
 * @param {*} shardCounter
 * @param {*} MAX_ALLOWABLE_SPREAD
 * @return {*} 
 */
function isSpreadBig_(shardCounter:shardCountObj,MAX_ALLOWABLE_SPREAD:number): boolean {
    let minVal = 0;
    let maxVal = 0;
    for (const key in shardCounter) {
        const shardCount = shardCounter[key];
        if (shardCount < minVal) minVal = shardCount;
        if (shardCount > maxVal) maxVal = shardCount;
    }
    if ((maxVal - minVal) > MAX_ALLOWABLE_SPREAD/* || (minVal >2 && numberOfZeros >=1)*/) {
        return true
    } else {
        return false
    }
}

/**
 * @description Finds shard with the smallest number of entries.  Defaults to 1
 * @param {*} shardCounter
 * @return {*} 
 */
function getKeyWithSmallestValue_(shardCounter: shardCountObj): string {
    let returnKey = "1"

    for (const key in shardCounter) {
        if (shardCounter[key] < shardCounter[returnKey]) {
            returnKey = key
        }
    }
    return returnKey
}