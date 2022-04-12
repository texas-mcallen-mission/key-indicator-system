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

function updateShards() {
    let NUMBER_OF_SHARDS = 4
    let MAX_ALLOWABLE_SPREAD = 2
    let allSheetData = constructSheetData()
    let filesystems = loadFilesystems_(allSheetData);

    for (let fs in filesystems) {
        // let outData = []
        // creates a object to += counts on, so that values already assigned a particular shard won't be as likely to get shifted to a different shard.
        
        let shardCounter: {} = {
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
        for (let entry in filesystems[fs].sheetData) {
            // let Testentry: fsEntry = entry
            let entryData = filesystems[fs].sheetData[entry]
            // console.log(entryData.folderBaseName, entryData.seedId, typeof entryData.seedId)
            if (entryData.seedId <= 0 || entryData.seedId == "" || entryData.seedId == undefined || parseInt(entryData.seedId) > NUMBER_OF_SHARDS) {
                let shardKey = getKeyWithSmallestValue(shardCounter)
                entryData.seedId = shardKey
                shardCounter[shardKey] += 1
            } else {
                shardCounter[entryData.seedId.toString] += 1
            }
            filesystems[fs].sheetData[entry] = entryData
        }
        // this should work, I think.
        
        
        /* Loop 2:
            If there's a big spread on shard numbers, then go and reassign some somehow, maybe?
        */
        for (let entry in filesystems[fs].sheetData) {
            let entryData = filesystems[fs].sheetData[entry]

            if (isSpreadBig_(shardCounter, MAX_ALLOWABLE_SPREAD) == false) {
                break
            }
            let smallestShard = getKeyWithSmallestValue(shardCounter)
            if (entryData.seedId.toString != smallestShard) entryData.seedId = smallestShard
            
            filesystems[fs].sheetData[entry] = entryData
            
            
        }

        
        // }

        console.log(shardCounter)
        // send data to display:
        //filesystems[filesystem].fsData.setData(filesystems[filesystem].sheetData);
        filesystems[fs].fsData.setData(filesystems[fs].sheetData)
    }


}

function isSpreadBig_(shardCounter,MAX_ALLOWABLE_SPREAD) {
    let minVal = 0;
    let maxVal = 0;
    for (let key of shardCounter) {
        let shardCount = shardCounter[key];
        if (shardCount < minVal) minVal = shardCount;
        if (shardCount > maxVal) maxVal = shardCount;
    }
    if ((maxVal - minVal) > MAX_ALLOWABLE_SPREAD) {
        return true
    } else {
        return false
    }
}
function getKeyWithSmallestValue(shardCounter) {
    let returnKey = "1"

    for (let key in shardCounter) {
        if (shardCounter[key] < shardCounter[returnKey]) {
            returnKey = key
        }
    }
    return returnKey
}