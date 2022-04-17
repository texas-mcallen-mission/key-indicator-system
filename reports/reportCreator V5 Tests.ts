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

function updateAllReports() {
    
}


/**
 * responsible for sending data to display.
 * Before you feed things in here, you should be making sure that reports exist.  Otherwise, this will cause errors.
 * Requires a sheet ID, the KI Data, as a class, and returns the sheetData object it creates.
 * 
 * @param {*} reportId
 * @param {kiDataClass} data
 * @return {*}  {SheetData}
 */
function updateSingleReport(reportId, data:kiDataClass):SheetData {
    // time to go minify sheetData, I think
    // DOES NOT CARE WHAT YOU FEED IT!  This function is relatively dumb, and will gladly (and mostly blindly)
    const REPORT_DATA_TAB_NAME = "Data"
    const REPORT_DATA_LAYOUT:columnConfig = {
        areaName: 0,
        isDuplicate: 1,
        areaID: 2,
        kiDate: 3,
        np: 4,
        sa: 5,
        bd: 6,
        bc: 7,
        rca: 8,
        rc: 9,
        cki: 10,
        serviceHrs: 11,
        combinedNames: 12,
        districtLeader: 13,
        zoneLeader1: 14,
        zoneLeader2: 15,
        zoneLeader3: 16,
        stl1: 17,
        stl2: 18,
        stl3: 19,
    }
    const REPORT_DATA_HEADER_POSITION = 1
    // Because this is remote, make sure that if you set ``, allowWrite`` to true you have REALLY good control over who's writing to your reports
    let rawSheetData = new RawSheetData(REPORT_DATA_TAB_NAME, REPORT_DATA_HEADER_POSITION, REPORT_DATA_LAYOUT, false, reportId, true)
    let reportSheet = new SheetData(rawSheetData)

    reportSheet.setData(data.end)
    return reportSheet    
}

function updateGroupOfReports(filesysData, data: kiDataClass) {
    
}


function testLoadingShards() {
    // step 1: load the data
    let allSheetData = constructSheetDataV2(sheetDataConfig.local)

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
    
    console.log(splitKiData(kiData, "areaID"))

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

