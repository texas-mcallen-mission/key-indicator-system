//@ts-check
// Shortcut functions just to make full-system testing from GAS easier

function run_updateDataSheet() {
    updateDataSheet();
}

function run_importContacts() {
  let allSheetData = constructSheetData();
    importContacts(allSheetData);
}

function run_shareFileSys() {
    shareFileSys();
}

function run_updateReports() {
    updateAreaReports();
    updateDistrictReports();
    updateZoneReports();
}