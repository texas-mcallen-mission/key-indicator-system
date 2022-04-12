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

    let shardedZone = loadShards_(filesystems.zone.fsData);
    // console.log(shardedZone)

    let kiData = allSheetData.data.getData()

    let dedupedkiData = removeDuplicatesFromData_(kiData)
    
    for (let shard in shardedZone) {
        let shardedAreaIdList = getAllAreaIdsInShard_(filesystems.zone.fsData)
        let data = getKiDataForShard(dedupedkiData, shardedAreaIdList)
        console.log(shard)
        console.log(data)
    }


}

function removeDuplicatesFromData_(kiData) {
    let output = []
    for (let entry of kiData) {
        // let entryData = kiData[entry]
        if(!entry.isDuplicate) output.push(entry)
    }
    return output
}
function getKiDataForShard(kiData, areaIds) {
    let output = []
    for (let entry of kiData) {
        if(areaIds.includes(entry.areaID)) output.push(entry)
    }
    return output
}

function getAllAreaIdsInShard_(fsSheetData) {
    let output = []
    for (let entry in fsSheetData) {
        let areaIdBlob = fsSheetData[entry].areaID
        areaIdBlob = areaIdBlob.replace(/\s/g, '') // removes potential whitespaces
        let areaIds = areaIdBlob.split(",")
        output.push(...areaIds)
    }
    return output
}
function loadShards_(fsSheetData) {
    let output = {}

    // step 1: initialize output
    for (let i = 1; i <= INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards; i++){
        output[i.toString()] = []
    }
    for (let entry in fsSheetData) {
        let entryData = fsSheetData[entry]
        output[entryData.seedId.toString()].push(entryData)
    }

    return output
}

