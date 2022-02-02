//@ts-check
// Shortcut functions just to make full-system testing from GAS easier

function run_updateDataSheet() {
    updateDataSheet();
}

function run_importContacts() {
    let allSheetData = constructSheetData();
    // @ts-ignore
    importContacts(allSheetData);
}

function run_shareFileSys() {
    shareFileSys();
    //TODO Fix typescript error!
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