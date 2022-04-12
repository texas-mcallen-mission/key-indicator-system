// Report Creator V5 Testing / Sandbox


/*
    The goals Here:
        build a reportCreator thing that can be adapted to both updating in shards *or* updating a single zone/district/area entry (in the case of a mid-week update)
        Shards:
            Ideal cycle time is sub-15-minutes to update *all* reports in a level

        Single zone/district/area:
            Cycle time should be fairly small here anywho
            Goal is to figure out how to only update 1 zone/district/area at a time

        I also need to split creating reports off of updating them- making sure that all the templates are there should be a fairly 

*/

let scopes = INTERNAL_CONFIG.fileSystem.reportLevel

function updateReportsInShard(shardData, shardFSdata, filesystem) {
    let reportScope = filesystem.fsScope
    let reportTemplateId = filesystem.reportTemplate

    

    

}

function updateSingleReport(reportId, data) {
    // time to go minify sheetData, I think
}



// function updateAnyLevelReport_(allSheetData, scope, dLog: dataLogger) {
//     let reportUpdateTimer = "Total time updating reports for scope " + scope + ":";
//     console.time(reportUpdateTimer);
//     let reportScope = scope;
//     let filesysSheetData;
//     let templateID: string = "";
//     switch (scope) {
//         case CONFIG.fileSystem.reportLevel.area:
//             filesysSheetData = allSheetData.areaFilesys;
//             templateID = CONFIG.reportCreator.docIDs.areaTemplate;
//             break;
//         case CONFIG.fileSystem.reportLevel.dist:
//             filesysSheetData = allSheetData.distFilesys;
//             templateID = CONFIG.reportCreator.docIDs.distTemplate;
//             break;
//         case CONFIG.fileSystem.reportLevel.zone:
//             filesysSheetData = allSheetData.zoneFilesys;
//             templateID = CONFIG.reportCreator.docIDs.zoneTemplate;
//             break;
//         // default:
//         //     throw "Invalid scope: '" + scope + "'";
//     }
//     let kiDataObj = allSheetData.data;
//     let kiDataHeaders = kiDataObj.getHeaders();
//     let dataKeys = kiDataObj.getKeys();
//     let data = removeDupesAndPII_(kiDataObj);
//     // I don't think I actually need contactData for this sub-system.  :)
//     // ONCE DRIVEHANDLER has been rewritten to 
//     dLog.startFunction("fullUpdateSingleLevel");
//     try {
//         fullUpdateSingleLevel(filesysSheetData, data, templateID, reportScope, kiDataHeaders, dataKeys, dLog);
//     } catch (error) {
//         dLog.addFailure("fullUpdateSingleLevel", error);
//     }
//     dLog.endFunction("fullUpdateSingleLevel");
//     let postRun = new Date;
//     console.timeEnd(reportUpdateTimer);
//     return true;
// }


function testLoadingShards() {
    // step 1: load the data
    let allSheetData = constructSheetData()

    let filesystems = loadFilesystems_(allSheetData)

    let shardedZone = loadShards_(filesystems.zone.sheetData);
    // console.log(shardedZone)

    let kiData = allSheetData.data.getData()

    let dedupedkiData = removeDuplicatesFromData_(kiData)
    
    for (let shard in shardedZone) {
        let shardedAreaIdList = getAllAreaIdsInShard_(filesystems.zone.sheetData,shard)
        let data = getKiDataForShard(dedupedkiData, shardedAreaIdList)
        console.log(shard,shardedAreaIdList,data.length)
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

function getAllAreaIdsInShard_(fsSheetData, shardId) {
    // returns a list of area id's that are included in the zones/districts/areas in a particular shard.
    let output = []
    for (let entry of fsSheetData) {
        // let entryData = fsSheetData[entry]
        if (entry.seedId.toString() == shardId.toString()) {
            let areaIdBlob = entry.areaID
            areaIdBlob = areaIdBlob.replace(/\s/g, '') // removes potential whitespaces
            let areaIds = areaIdBlob.split(",")
            output.push(...areaIds)
        }
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

