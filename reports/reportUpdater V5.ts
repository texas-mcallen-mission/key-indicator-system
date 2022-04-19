// Report Creator V5

/*

    TODO 0 LOADER:
    TODO 0      Load KI Data, create kiDataClass
    TODO 0      Load FS Data metasystem

    TODO 1 A)   Single-Level-of-reports: Straight-through to 2A or 2B
    TODO 1 B)   Single-Report-Line: (One Zone/District/Area Report Group): Scope down FSdata (Remove all that don't contain given area ID), run multiple instances of 2A) onwards

    
    TODO 2 A)   Pass Through FSData
    TODO 2 B)   Remove FSData not applicable to single shard

    Define: Scope, sets update time


    TODO 3      Discard Unwanted fs,KIData
    TODO 3.1    Do Major Data Operations
                    Passthrough: Scope, update time
                    Remove Duplicates, destroy PII we don't want to have, calculate combined names
                    This is separate from step 2, because from here on up should be the same irregardless of scope


    
    TODO 4      Group Data; Run Single Report Updater
                    key: fsEntry's
                    split kiData into multiple little kiData's- END OF kiDataClass
                    Iterates by fsEntry
                    PassThrough: Scope, update time
                    - IMPLEMENTED

    TODO 5      Update Single Report
                    needs: sheetID, scope, kiData (NOT THE CLASS, THE DATA)
                    returns sheetData, in case we want to do something afterwards???
                    - BARELY TESTED, but implemented

*/

/**
 * Step 1: Load FS, KI Data
 */


/**
 *  Step 2: Pick Scope, shard
 *  
 */

function pickScope(fsData: manyFilesystemDatas,) {
    let kiDataMod = _.cloneDeep(kiData)
    // I'm SOOOO thankful for Lodash, it's saved this project from even more technical weeds than it already has...



}





/**
 *  Step 3:  Do Major Data Operations
        This is the place where duplicates get removed, names get combined, etc.
        The reason this is classified as a step and not something that happens inside of a different one:
            - There's only one thing to update when you want to add / remove / change things in your reports.
        This does nothing to split up data by zone/district/area whatever: that is done in the next step via area ID's
        The one drawback: All Reports made via this system have to have the same data types made available to them
            - note: this is entirely different from scoping / removing entries (rows) based on zone/district/area- this is simply adding calculated and/or removing keys (columns) per entry.
            - this will, however, delete entries (rows) with methods like removeDuplicates()
 */

function testDoDataOperations() {
    // stand-alone test
    let kiData: manyKiDataEntries = [
        {
            areaName: "WORDS", areaID: "WORDS", zone: "WORDS", district: "WORDS",
            serviceHrs: "WORDS", rca: "WORDS", rc: "WORDS", "fb-role": "WORDS",
            isDuplicate: false, name1: "name1", position1: "BB", name2: "name2", position2: "BA", name3:
            "name3", position3: "AB",
        },
        {
            areaName: "WORDS", areaID: "WORDS", zone: "WORDS", district: "WORDS",
            serviceHrs: "WORDS", rca: "WORDS", rc: "WORDS", "fb-role": "WORDS",
            isDuplicate: true, name1: "name1", position1: "BB", name2: "name2", position2: "BA", name3:
                "name3", position3: "AB",
        },
        {
            areaName: "WORDS", areaID: "WORDS", zone: "WORDS", district: "WORDS",
            serviceHrs: "WORDS", rca: "WORDS", rc: "WORDS", "fb-role": "WORDS",
            isDuplicate: true, name1: "name1", position1: "BB", name2: "name2", position2: "BA", name3:
                "name3", position3: "AB",
        }
        
    ]
    let kiDataClassTester = new kiDataClass(kiData)
    let test = doDataOperations(kiDataClassTester)
    console.log(test)
    
}

function testDoDataOperationsLive() {
    // integration-style test
    let localSheetData = constructSheetDataV2(sheetDataConfig.local);
    let fsData: manyFilesystemDatas = localSheetData.distFilesys.getData();
    // let targetFSData: manyFilesystemDatas = { entry1: fsData[1], entry2: fsData[2] }
    let kiData = new kiDataClass(localSheetData.data.getData());

    let scope: filesystemEntry["fsScope"] = "Area";
    kiData = doDataOperations(kiData)
    groupDataAndSendReports_(fsData, kiData, scope);
}
/**
 * doDataOperations: returns a new kiDataClass instance that has any and all data operations necessary for reports to generate properly.
 *
 * @param {kiDataClass} kiData
 * @return {*}  {kiDataClass}
 */
function doDataOperations(kiData:kiDataClass):kiDataClass {
    let kiDataMod: kiDataClass = _.cloneDeep(kiData)
    
    kiDataMod.removeDuplicates().calculateCombinedName().calculateRR().sumFacebookReferrals()


    return kiDataMod
}




/**
 * STEP 4 TEST FUNCTIONS
 */


function testKeepMatchingByKey() {
    // standalone test, because this thing was having problems
    // _.deepClone(object) solved them, but these are good demos / sanity checks.
    let testKey = "areaID";
    let kiData = [
        { val1: "WHEEE", areaID: "AREA_NUMBER_1", testThingy: "AREA1-ENTRY-1" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_1", testThingy: "AREA1-ENTRY-2" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_2", testThingy: "AREA2-ENTRY-1" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_2", testThingy: "AREA2-ENTRY-2" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_3", testThingy: "AREA3-ENTRY-1" },
    ];
    let kiDataa = new kiDataClass(kiData);
    kiDataa.keepMatchingByKey("areaID", ["AREA_NUMBER_1", "AREA_NUMBER_2"]);
    console.log(kiDataa.end);
}

function testKeepMatchingByKey2() {
    // semi-integrated test- loads external data
    let localSheetData = constructSheetDataV2(sheetDataConfig.local);

    let testKey = "areaID";
    let kiData = localSheetData.data.getData();
    let kiDataa = new kiDataClass(kiData);
    kiDataa.keepMatchingByKey("areaID", ["A500364080", "A6974467"]);
    console.log(kiDataa.end);
}

function testGroupAndSendReports(): void {
    // integration test: loads external data, pushes it.
    let localSheetData = constructSheetDataV2(sheetDataConfig.local)
    let fsData:manyFilesystemDatas = localSheetData.distFilesys.getData()
    // let targetFSData: manyFilesystemDatas = { entry1: fsData[1], entry2: fsData[2] }
    let kiData = new kiDataClass(localSheetData.data.getData())

    let scope: filesystemEntry["fsScope"] = "Area"

    groupDataAndSendReports_(fsData, kiData, scope)
    
}


/**
 *  Takes takes multiple filesystemData entries, and sends the data to display.
 *  fully capable of being sharded, as it can take as many or as few entries as you want.
 *
 * @param {manyFilesystemDatas} fsData
 * @param {kiDataClass} kiData
 * @return {*}  {manyKiDataClasses}
 */
function groupDataAndSendReports_(fsData: manyFilesystemDatas, kiData: kiDataClass, scope: filesystemEntry["fsScope"]):manyKiDataClasses {
    let output: manyKiDataClasses = {}
    if (fsData.length == 0) {
        console.error("NO fsData to update!")
        let returnVal: manyKiDataClasses = {}
        return returnVal
    }
    for (let entry in fsData) {
        let entryData = fsData[entry]
        let kiDataCopy = _.cloneDeep(kiData)
        let areaIdList:string[] = entryData.areaID.split()
        kiDataCopy.keepMatchingByKey("areaID", areaIdList)
        let data = kiDataCopy.end
        console.info("fsData Key:", entry, entryData.folderBaseName, data[0])
        
        // output[entry] = kiDataCopy
        // TODO: Consider passing through the sheetID key, so that these core functions can be re-used to create more reports?
        if (typeof entryData.sheetID1 == null || typeof entryData.sheetID1 == undefined || !isFileAccessible_(entryData.sheetID1) ) {
            console.error("SHEET ID EITHER NULL OR NOT ACCESSIBLE FOR ENTRY",entryData.folderName)
            
        } else {
            updateSingleReportV5_(entryData.sheetID1, data,entryData.folderBaseName/* I could probably add a fileName entry thingy to this... */, scope)
            
        }
    }

    return output
}


/**
 * STEP 5 TEST FUNCTIONS
 */

/**
 *  test code for updateSingleReportV5, will put / overwrite a tab on your active spreadsheet.
 *  
 */
function testSingleReportUpdater():void {
    
    let localSheetData = constructSheetDataV2(sheetDataConfig.local)

    let kiData = new kiDataClass(localSheetData.data.getData()).calculateCombinedName().sumFacebookReferrals().keepMatchingByKey("district",["ZAPATA","Zapata"]).end

    console.log(kiData.length)
    let report = updateSingleReportV5_(CONFIG.dataFlow.sheetTargets.headerTest, kiData,"TESTBOI", "Area")
    console.log(report.rsd.tabName)
}



/**
 *  @description updates the data on a single report.  Currently requires the sheetID to be verified to not crash.
 *  
 * @param {string} sheetID
 * @param {(any[] | manyKiDataEntries)} kiData
 * @param {filesystemEntry["fsScope"]} scope // currently unused, but will need to exist for updating the config pages in the future.
 * @return {*}  {SheetData}
 */
function updateSingleReportV5_(sheetID: string, kiData: any[] | manyKiDataEntries, fileName:string,scope: filesystemEntry["fsScope"]):SheetData {

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
        isDuplicate:15
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