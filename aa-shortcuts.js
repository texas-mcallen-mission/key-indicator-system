//@ts-check
// Shortcut functions just to make full-system testing from GAS easier



function run_updateDataSheet() {
    updateDataSheet();
}

function run_importContacts() {
    const allSheetData = constructSheetData();
    importContacts(allSheetData);
}

function run_shareFileSys() {
    shareFileSystem();
}

function run_updateReports() {
    updateAreaReports();
    updateDistrictReports();
    updateZoneReports();
}

function run_markDuplicates() {
    const allSheetData = constructSheetData();
    markDuplicates(allSheetData);
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
    const allSheetData = constructSheetData();
}

function setUpTriggers() {
    updateTimeBasedTriggers()
    updateSpreadsheetTriggers()
}