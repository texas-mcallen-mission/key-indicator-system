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

// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testUpdateSingleShard() {
    updateAreaReportsV5("3");
}

// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testUpdateOneBranch() {
    updateOneBranch("A500412899")
}

// This is used with the scheduler and is a globally-used function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateOneBranch(areaID:string) {
    const allData = loadData()
    multiLevelUpdateSingleAreaID_(allData.fsData, allData.kiData, areaID)
}

// This is used with the scheduler and is a globally-used function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateAreaReportsV5(shard:null|string= null) {
    const allData = loadData()
    singleLevelUpdater_(allData.fsData, allData.kiData, "Area",shard)

}
// This is used with the scheduler and is a globally-used function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateDistrictReportsV5(shard: null | string = null) {
    const allData = loadData()
    singleLevelUpdater_(allData.fsData, allData.kiData, "District",shard)
}

// This is used with the scheduler and is a globally-used function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateZoneReportsV5(shard: null | string = null) {
    const allData = loadData()
    singleLevelUpdater_(allData.fsData, allData.kiData, "Zone",shard)
}



/**
 *  Loads KI Data
 *  essentially abstracts loading the FS and stuff so that I can make it nice and neat.
 *
 * @return {{ fsData: manyFilesystemEntries; kiData: kiDataClass; }}
 */
function loadData(): { fsData: manyFilesystemEntries; kiData: kiDataClass; } {
    const localSheetData:manySheetDatas = constructSheetDataV2(sheetDataConfig.local)
    const fsDataEntries: manyFilesystemEntries = loadFilesystems_(localSheetData)
    
    const kiData = new kiDataClass(localSheetData.data.getData())

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
function removeFSEntriesWithoutAreaId_(fsData: filesystemData[], areaID: string): filesystemData[] {
    const output: filesystemData[] = [];
    const shardKey = "seedId";
    for (const entry in fsData) {
        const entryData = fsData[entry];
        const areaIDs = entryData.areaID.split(",")
        for (const areaID of areaIDs) { areaID.trim(); }
        if (areaID.includes(areaID)) {
            output.push(entryData);
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
    const fsEntryMod: manyFilesystemEntries = _.cloneDeep(fsEntries)
    for (const fsScopeKey in fsEntryMod) {
        const fsEntryData: filesystemEntry = fsEntryMod[fsScopeKey]
        
        fsEntryData.sheetData = removeFSEntriesWithoutAreaId_(fsEntryData.sheetData, areaID)
        singleLevelUpdater_(fsEntryMod, kiData, fsEntryData.fsScope)
    }
    
}

/**
 * Single Level Updater: Has a shard argument in case we want to filter out shards.
 */

function removeFSEntriesNotInShard_(fsData: filesystemData[], shardValue: string): filesystemData[] {
    const output: filesystemData[] = []
    // const shardKey = "seedId"
    for (const entry of fsData) {
        if (entry.seedId.toString() == shardValue) {
            output.push(entry)
        }
    }
    // for (const entry in fsData) {
    //     const entryData:filesystemData = fsData[entry]
    //     if (entryData.seedId.toString() == shardValue) {
    //         output[entry] = (entryData)
    //     }
    // }
    return output
}

function singleLevelUpdater_(fsDataEntries:manyFilesystemEntries, kiData: kiDataClass,scope:filesystemEntry["fsScope"],shard:string|null= null) {
    const targetFSEntry = fsDataEntries[scope]
    
    // is of type filesystemData at runtime
    let fsData: filesystemData[] = targetFSEntry.sheetData
    if (shard != null) {
        fsData = removeFSEntriesNotInShard_(fsData, shard)
        console.info("Running Report Updater in Shard Mode on Scope:",scope," Shard ID:",shard)
    }

    const kiDataMod = doDataOperations_(kiData); // Step 3: Do Data Operations
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
// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testDoDataOperations() {
    // stand-alone test
    const kiData: kiDataEntry[] = [
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
    const kiDataClassTester = new kiDataClass(kiData)
    const test = doDataOperations_(kiDataClassTester)
    console.log(test)
    
}


function convertToFilesystemData(kiData:kiDataEntry[]):filesystemData[] {
    const output: filesystemData[] = []
    for (const entry of kiData) {
        // 👇 may be reassigned later
        // eslint-disable-next-line prefer-const 
        let fsDataBase: filesystemData = {
            folderName: '',
            parentFolder: '',
            folderId: '',
            sheetID1: '',
            sheetID2: '',
            areaID: '',
            folderBaseName: '',
            seedId: ''
            , ...entry
        }
        output.push(fsDataBase)
    }

    return output
}

// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testDoDataOperationsLive() {
    // integration-style test
    const localSheetData = constructSheetDataV2(sheetDataConfig.local);
    const fsData: filesystemData[] = convertToFilesystemData(localSheetData.distFilesys.getData())
    // let targetFSData: manyFilesystemDatas = { entry1: fsData[1], entry2: fsData[2] }
    let kiData = new kiDataClass(localSheetData.data.getData());

    const scope: filesystemEntry["fsScope"] = "Area";
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
    const kiDataMod: kiDataClass = _.cloneDeep(kiData)
    kiDataMod.calculatePercentage("rca", "rc", CONFIG.kiData.new_key_names.retentionRate);
    kiDataMod.createSumOfKeys(CONFIG.kiData.fb_referral_keys, CONFIG.kiData.new_key_names.fb_referral_sum);
    kiDataMod.removeDuplicates().calculateCombinedName()


    return kiDataMod
}




/**
 * STEP 4 TEST FUNCTIONS
 */

// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testKeepMatchingByKey() {
    // standalone test, because this thing was having problems
    // _.deepClone(object) solved them, but these are good demos / sanity checks.
    const testKey = "areaID";
    const kiData = [
        { val1: "WHEEE", areaID: "AREA_NUMBER_1", testThingy: "AREA1-ENTRY-1" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_1", testThingy: "AREA1-ENTRY-2" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_2", testThingy: "AREA2-ENTRY-1" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_2", testThingy: "AREA2-ENTRY-2" },
        { val1: "WHEEE", areaID: "AREA_NUMBER_3", testThingy: "AREA3-ENTRY-1" },
    ];
    const kiDataa = new kiDataClass(kiData);
    kiDataa.keepMatchingByKey(testKey, ["AREA_NUMBER_1", "AREA_NUMBER_2"]);
    console.log(kiDataa.end);
}

// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testKeepMatchingByKey2() {
    // semi-integrated test- loads external data
    const localSheetData = constructSheetDataV2(sheetDataConfig.local);

    const testKey = "areaID";
    const kiData = localSheetData.data.getData();
    const kiDataa = new kiDataClass(kiData);
    kiDataa.keepMatchingByKey(testKey, ["A500364080", "A6974467"]);
    console.log(kiDataa.end);
}

// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testGroupAndSendReports(): void {
    // integration test: loads external data, pushes it.
    const localSheetData = constructSheetDataV2(sheetDataConfig.local)
    const fsData:filesystemData[] = convertToFilesystemData(localSheetData.distFilesys.getData())
    // let targetFSData: manyFilesystemDatas = { entry1: fsData[1], entry2: fsData[2] }
    const kiData = new kiDataClass(localSheetData.data.getData())

    const scope: filesystemEntry["fsScope"] = "Area"

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
function groupDataAndSendReports_(fsData: filesystemData[], kiData: kiDataClass, scope: filesystemEntry["fsScope"]): manyKiDataClasses {
    const sheetId = CONFIG.reportCreator.targetSheetId
    const output: manyKiDataClasses = {}
    if (Object.keys(fsData).length == 0) {
        console.error("NO fsData to update!")
        const returnVal: manyKiDataClasses = {}
        return returnVal
    }
    for (const entry in fsData) {
        const entryData = fsData[entry]
        const kiDataCopy = _.cloneDeep(kiData)
        const areaIdList:string[] = entryData.areaID.split(",")
        kiDataCopy.keepMatchingByKey("areaID", areaIdList)
        const data = kiDataCopy.end
        // console.info("fsData Key:", entry, entryData.folderBaseName, data[0])
        
        // output[entry] = kiDataCopy
        // TODO: Consider passing through the sheetID key, so that these core functions can be re-used to create more reports?
        if (typeof entryData[sheetId] == null || typeof entryData[sheetId] == undefined || !isFileAccessible_(entryData[sheetId]) ) {
            console.error("SHEET ID EITHER NULL OR NOT ACCESSIBLE FOR ENTRY",entryData.folderName)
            
        } else {
            updateSingleReportV5_(entryData[sheetId], data,entryData.folderBaseName/* I could probably add a fileName entry thingy to this... */, scope)
            
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
// Tester function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testSingleReportUpdater():void {
    
    const localSheetData = constructSheetDataV2(sheetDataConfig.local)

    const kiData = new kiDataClass(localSheetData.data.getData()).calculateCombinedName().createSumOfKeys(CONFIG.kiData.fb_referral_keys,CONFIG.kiData.new_key_names.fb_referral_sum).keepMatchingByKey("district",["ZAPATA","Zapata"]).end

    console.log(kiData.length.toString())
    const report = updateSingleReportV5_(CONFIG.dataFlow.sheetTargets.headerTest, kiData,"TESTBOI", "Area")
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
function updateSingleReportV5_(sheetID: string, kiData: kiDataEntry[] | manyKiDataEntries, areaName:string,scope: filesystemEntry["fsScope"]):SheetData {

    const reportInfo: sheetDataEntry = _.cloneDeep(CONFIG.reportCreator.reportDataEntryConfig)
    reportInfo.sheetId = sheetID
    const updateTime = new Date()
    const preHeader = [["Report Scope:",scope,"Area Name:",areaName,"Last Updated:",updateTime]]

    const rawReportSheetData = new RawSheetData(reportInfo)
    const targetReport = new SheetData(rawReportSheetData)

    targetReport.setData(kiData)
    targetReport.directEdit(0, 0,preHeader)
    // and then a bit of code to do stuff like update the config page or something like that with the update time.
    // but that passthrough bit is currently unimplemented on sheetData.
    return targetReport
}