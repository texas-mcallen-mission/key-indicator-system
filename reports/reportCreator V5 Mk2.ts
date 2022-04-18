// Report Creator V5

/*

    TODO 0 LOADER

    TODO 1.A    Load KI Data
    TODO 1.B    Load FS Data

    TODO 2      Pick Scope & Shard
                    Define: Scope, sets update time

    TODO 3      Discard Unwanted fs,KIData
    TODO 3.1    Do Major Data Operations
                    Passthrough: Scope, update time
                    Remove Duplicates, destroy PII we don't want to have, calculate combined names

    
    TODO 4      Group Data
                    key: fsEntry's
                    split kiData into multiple little kiData's- END OF kiDataClass
                    Iterates by fsEntry
                    PassThrough: Scope, update time

    TODO 5      Update Single Report
                    needs: sheetID, scope, kiData (NOT THE CLASS, THE DATA)
                    returns sheetData, in case we want to do something afterwards???

*/

function testSingleReportUpdater() {
    
    let localSheetData = constructSheetDataV2(sheetDataConfig.local)

    let kiData = new kiDataClass(localSheetData.getData()).calculateCombinedName().sumFacebookReferrals().keepMatchingByKey("areaName",["Zapata C"]).end

    console.log(kiData.length)
    let report = updateSingleReportV5(CONFIG.dataFlow.sheetTargets.headerTest, kiData, "Area")
    console.log(report.rsd.tabName)
}

/**
 * @description updates the data on a single report.  Requires the sheetID to be verified to not crash.
 *
 *  @param {string} sheetID
 *  @param {any[]} kiData
 *  @param {filesystemEntry["fsScope"]} scope
 *  @return {*}  {SheetData}
 */
function updateSingleReportV5(sheetID: string, kiData: any[], scope: filesystemEntry["fsScope"]):SheetData {

    let REPORT_COLUMN_CONFIG: columnConfig = {
        areaName: 0,
        areaID: 1,
        zone: 2,
        district: 3,
        combinedNames: 4,
        np: 5,
        sa: 6,
        bd: 7,
        bc: 8,
        serviceHrs: 9,
        rca: 10,
        rc: 11,
        cki: 12,
        "fb-role": 13,
        "fb-ref-sum": 14,
    }
    let reportInfo: sheetDataEntry = {
        tabName : "LOCAL-REPORT-ENTRY-TEST",
        headerRow: 2,
        includeSoftcodedColumns: false,
        initialColumnOrder: REPORT_COLUMN_CONFIG,
        sheetId: sheetID,
        allowWrite:true
    }

    let rawReportSheetData = new RawSheetData(reportInfo.tabName,reportInfo.headerRow,reportInfo.initialColumnOrder,reportInfo.includeSoftcodedColumns,reportInfo.sheetId,reportInfo.allowWrite)
    let targetReport = new SheetData(rawReportSheetData)

    targetReport.setData(kiData)
    // and then a bit of code to do stuff like update the config page or something like that with the update time.
    // but that passthrough bit is currently unimplemented on sheetData.
    return targetReport
}