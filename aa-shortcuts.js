//@ts-check
// Shortcut functions just to make full-system testing from GAS easier


function run_importContacts() {
    const allSheetData = constructSheetDataV3();
    importContacts(allSheetData);
}

function run_updateDataSheet() {
    updateDataSheet();
}


function run_shareFileSys() {
    shareFileSystem();
}

function run_markDuplicates() {
    const allSheetData = constructSheetDataV3();
    markDuplicates(allSheetData);
}

function run_reportTester() {
    createMissingReports()
    areaShardUpdater1();
    districtShardUpdater1();
    zoneShardUpdater1();
    console.log("updated shards for area, district and zone.")
}

function run_updateReports() {
    // note: this will take a VERY long time
    updateAreaReportsV5();
    updateDistrictReportsV5();
    updateZoneReportsV5();
}


function run_updateForm() {
    updateForm();
}

function clearCache() {
    const cacheIds = [CONFIG.dataFlow_areaId_cacheKey, CONFIG.dataFlow_allSheetData_cacheKey];
    const cache = CacheService.getDocumentCache();
    cache.removeAll(cacheIds);
}

function run_constructSheetData() {
    const allSheetData = constructSheetDataV3();
    for (const key in allSheetData) {
        console.log(key)
    }
}

function setUpTriggers() {
    updateTimeBasedTriggers()
    updateSpreadsheetTriggers()
}