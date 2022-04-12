// Goal:  Figure out how to split the reportCreator report generators into multiple functions so that I can make the effective update time much smaller.


function updateShards() {
    let NUMBER_OF_SHARDS = 4
    let allSheetData = constructSheetData()
    let filesystems = loadFilesystems_(allSheetData);

    for (let fs in filesystems) {
        // creates a object to += counts on, so that values already assigned a particular shard won't be as likely to get shifted to a different shard.
        
        let shardCounter: {} = {
            "0": 0,
        }
        for (let i = 0; i < NUMBER_OF_SHARDS; i++){
            shardCounter[i.toString()] = 0
        }
        /* loop 1:
            1. create count for how many things are assigned to particular shards
            2. If shard assignment is out of bounds, remove assignment so that it can be reassigned 

            NUMBER_OF_SHARDS shall be 1-indexed- anything 
        */
        for (let entry in filesystems[fs].sheetData) {
            console.log(entry.folderBaseName, entry.seedId, typeOf entry.seedId)
            if (entry.seedId <= 0 || entry.seedId == "" || entry.seedId == undefined) {
                entry.seedId = 0

            } else {
                shardCounter[entry.seedId.toString] += 1
            }
        }
        // this should work, I think.
        console.log(shardCounter)
    }


}