//@ts-check
// Shortcut functions just to make full-system testing from GAS easier

//test

function run_updateDataSheet() {
    updateDataSheet();
}

function run_importContacts() {
    let allSheetData = constructSheetData();
    // @ts-ignore
    importContacts(allSheetData);
}

function run_shareFileSys() {
    shareFileSystem();
}

function run_updateReports() {
    // @ts-ignore
    updateAreaReports();
    // @ts-ignore
    updateDistrictReports();
    // @ts-ignore
    updateZoneReports();
}

function run_markDuplicates() {
    let allSheetData = constructSheetData();
    markDuplicates(allSheetData);
}

function run_updateForm() {
    updateForm();
}

function clearCache() {
    let cacheIds = [CONFIG.dataFlow_areaId_cacheKey, CONFIG.dataFlow_allSheetData_cacheKey];
    let cache = CacheService.getDocumentCache();
    cache.removeAll(cacheIds);
}

function run_constructSheetData() {
    let allSheetData = constructSheetData();
}
