// Report Creator V5

/*

    TODO 0: Load Data: FSdataMetasystem, KI Data

    TODO: STEPS 0,1,2:
            - this is where we directly interact with the sheetData objects.

        This is the part that gets messy, to make it cleaner on the other end of the system.

        SINGLE-LEVEL UPDATER: Pick which fs to use- then do data operations, send ki data off to reports
        - Arguments: Scope, OPTIONAL- SHARD NUMBER ARGUMENT: Above, but also DISCARD fs Entries that don't match the shard value.
            - Responsible for sending data off to the various reports. 


        MULTI-LEVEL UPDATER: Call multiple single-Level Updaters, assign which FS to use.



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
 *  Abstractions for external things:
 *  META_RUNNER-enabled single-report-level updater, shard capable
 *  META_RUNNER-enabled Single-Area-Updater: Could be called by the data creator system if it's not a Sunday/Monday morning and something changes.
 *      Theoretically the single-area updater could be used to update ALL of them if you set something differently...
 */

function testUpdateSingleShard() {
    updateAreaReportsV5("3");
}

function testUpdateOneBranch() {
    updateOneBranch("A500412899")
}

function updateOneBranch(areaID:string) {
    let allData = loadData()
    multiLevelUpdateSingleAreaID_(allData.fsData, allData.kiData, areaID)
}

function updateAreaReportsV5(shard:null|string= null) {
    let allData = loadData()
    singleLevelUpdater_(allData.fsData, allData.kiData, "Area",shard)

}

function updateDistrictReportsV5(shard: null | string = null) {
    let allData = loadData()
    singleLevelUpdater_(allData.fsData, allData.kiData, "District",shard)
}

function updateZoneReportsV5(shard: null | string = null) {
    let allData = loadData()
    singleLevelUpdater_(allData.fsData, allData.kiData, "Zone",shard)
}



/**
 *  Loads KI Data
 *  essentially abstracts loading the FS and stuff so that I can make it nice and neat.
 *
 * @return {{ fsData: manyFilesystemEntries; kiData: kiDataClass; }}
 */
function loadData(): { fsData: manyFilesystemEntries; kiData: kiDataClass; } {
    let localSheetData:manySheetDatas = constructSheetDataV2(sheetDataConfig.local)
    let fsDataEntries: manyFilesystemEntries = loadFilesystems_(localSheetData)
    
    let kiData = new kiDataClass(localSheetData.data.getData())

    return { fsData: fsDataEntries, kiData: kiData }

}



/** Multi-Level Updater: Does some weird stuff 
 * 
*/

/**
 *  Removes FS entries that don't have a given area in them.  Runs on a single level at a time.  Integral to multiLevelUpdateSingleAreaID
 *
 * @param {manyFilesystemDatas} fsData
 * @param {string} areaID
 * @return {*} 
 */
function removeFSEntriesWithoutAreaId_(fsData: manyFilesystemDatas, areaID: string) {
    let output: manyFilesystemDatas = {};
    let shardKey = "seedId";
    for (let entry in fsData) {
        let entryData = fsData[entry];
        let areaIDs = entryData.areaID.split(",")
        for(let areaID of areaIDs) areaID.trim()
        if (areaID.includes(areaID)) {
            output[entry] = (entryData);
        }
    }
    return output;
}

/**
 *  Runs all updates for ONE area id by removing all irrelevant fsEntries.
 *
 * @param {manyFilesystemDatas} fsEntries
 * @param {kiDataClass} kiData
 * @param {string} areaID
 */
function multiLevelUpdateSingleAreaID_(fsEntries: manyFilesystemEntries, kiData:kiDataClass,areaID: string) {
    let fsEntryMod: manyFilesystemEntries = _.cloneDeep(fsEntries)
    for (let fsEntry in fsEntryMod) {
        let fsEntryData: filesystemEntry = fsEntryMod[fsEntry]
        //@ts-ignore
        fsEntryData.sheetData = removeFSEntriesWithoutAreaId_(fsEntryData.sheetData, areaID)
        singleLevelUpdater_(fsEntryMod, kiData, fsEntryData.fsScope)
    }
    
}

/**
 * Single Level Updater: Has a shard argument in case we want to filter out shards.
 */

function removeFSEntriesNotInShard_(fsData: manyFilesystemDatas, shardValue: string): manyFilesystemDatas {
    let output: manyFilesystemDatas = {}
    let shardKey = "seedId"
    
    for (let entry in fsData) {
        let entryData:filesystemData = fsData[entry]
        if (entryData.seedId.toString() == shardValue) {
            output[entry] = (entryData)
        }
    }
    return output
}

function singleLevelUpdater_(fsDataEntries:manyFilesystemEntries, kiData: kiDataClass,scope:filesystemEntry["fsScope"],shard:string|null= null) {
    let targetFSEntry = fsDataEntries[scope]
    
    //@ts-ignore
    let fsData: manyFilesystemDatas = targetFSEntry.sheetData
    if (shard != null) {
        fsData = removeFSEntriesNotInShard_(fsData, shard)
        console.info("Running Report Updater in Shard Mode on Scope:",scope," Shard ID:",shard)
    }

    let kiDataMod = doDataOperations_(kiData); // Step 3: Do Data Operations
    groupDataAndSendReports_(fsData, kiDataMod, scope) // Runs 4, which batches step 5's
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
    let test = doDataOperations_(kiDataClassTester)
    console.log(test)
    
}

function testDoDataOperationsLive() {
    // integration-style test
    let localSheetData = constructSheetDataV2(sheetDataConfig.local);
    let fsData: manyFilesystemDatas = localSheetData.distFilesys.getData();
    // let targetFSData: manyFilesystemDatas = { entry1: fsData[1], entry2: fsData[2] }
    let kiData = new kiDataClass(localSheetData.data.getData());

    let scope: filesystemEntry["fsScope"] = "Area";
    kiData = doDataOperations_(kiData)
    groupDataAndSendReports_(fsData, kiData, scope);
}
/**
 * doDataOperations: returns a new kiDataClass instance that has any and all data operations necessary for reports to generate properly.
 *
 * @param {kiDataClass} kiData
 * @return {*}  {kiDataClass}
 */
function doDataOperations_(kiData:kiDataClass):kiDataClass {
    let kiDataMod: kiDataClass = _.cloneDeep(kiData)
    
    kiDataMod.removeDuplicates().calculateCombinedName().calculateRR().sumFacebookReferrals().calculateRR()


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
    if (Object.keys(fsData).length == 0) {
        console.error("NO fsData to update!")
        let returnVal: manyKiDataClasses = {}
        return returnVal
    }
    for (let entry in fsData) {
        let entryData = fsData[entry]
        let kiDataCopy = _.cloneDeep(kiData)
        let areaIdList:string[] = entryData.areaID.split(",")
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
        kiDate: 1,
        areaID: 2,
        zone: 3,
        district: 4,
        combinedNames: 5,
        np: 6,
        sa: 7,
        bd: 8,
        bc: 9,
        serviceHrs: 10,
        rca: 11,
        rc: 12,
        cki: 13,
        "fb-role": 14,
        "fb-ref-sum": 15,
        isDuplicate:16,
        rrPercent: 17,

    }
    let reportInfo: sheetDataEntry = {
        tabName: "reportData",
        headerRow: 3,
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