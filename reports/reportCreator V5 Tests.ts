// Report Creator V5 Testing / Sandbox


/*
    The goals Here:
        build a reportCreator thing that can be adapted to both updating in shards *or* updating a single zone/district/area entry (in the case of a mid-week update)
        Shards:
            Ideal cycle time is sub-15-minutes to update *all* reports in a level

        Single zone/district/area:
            Cycle time should be fairly small here anywho
            Goal is to figure out how to only update 1 zone/district/area at a time

*/

let scopes = INTERNAL_CONFIG.fileSystem.reportLevel


function testLoadingShards() {
    let allSheetData = constructSheetData()

    let filesystems = loadFilesystems_(allSheetData)

    let shardedZone = loadShards(filesystems.zone.fsData);
    console.log(shardedZone)
}
function loadShards(fsData) {
    let output = {}

    // step 1: initialize output
    for (let i = 0; i <= INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards; i++){
        output[i.toString()] = []
    }
    for (let entry of fsData) {
        output[entry.seedId.toString].push(entry)
    }

    return output
}