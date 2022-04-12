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
    let allSheetData = constructSheetData()
    let filesystems = loadFilesystems_(allSheetData);

    for (let fs in filesystems) {
        // creates a object to += counts on, so that values already assigned a particular shard won't be as likely to get shifted to a different shard.
        
        let shardCounter: {} = {
            "1":0
        }
        for (let i = 1; i < NUMBER_OF_SHARDS; i++){
            shardCounter[i.toString()] = 0
        }
        /* loop 1:
            1. create count for how many things are assigned to particular shards
            2. If shard assignment is out of bounds, remove assignment so that it can be reassigned 

            NUMBER_OF_SHARDS shall be 1-indexed- anything 
        */
        for (let entry in filesystems[fs].sheetData) {
            // let Testentry: fsEntry = entry
            console.log(entry.folderBaseName, entry.seedId, typeof entry.seedId)
            if (entry.seedId <= 0 || entry.seedId == "" || entry.seedId == undefined) {
                entry.seedId = 0

            } else {
                shardCounter[entry.seedId.toString] += 1
            }
        }
        // this should work, I think.
        
        
        /* Loop 2:
            1. Assigns shard numbers to things that don't have valid shard id's
                Attempts to do so evenly by assigning to the shard with the lowest count on it
        */
        
        for (let entry in filesystems[fs].sheetData) {
            if (entry.seedId <= 0 || entry.seedId > NUMBER_OF_SHARDS) {
                let shardString = getKeyWithSmallestValue(shardCounter) 
                shardCounter[shardString] += 1
                entry.seedId = shardString
            }
        }
        // send data to display:
        //filesystems[filesystem].fsData.setData(filesystems[filesystem].sheetData);
        filesystems[fs].fsData.setData(filesystems[fs].sheetData)
    }


}

function getKeyWithSmallestValue(shardCounter) {
    let returnKey = "1"

    for (let key of shardCounter) {
        if (shardCounter[key] < shardCounter[returnKey]) {
            returnKey = key
        }
    }
    return returnKey
}