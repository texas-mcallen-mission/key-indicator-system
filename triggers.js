//@ts-check
/*
        triggers.gs
        Helper functions relating to installable, time-based, and custom menu triggers. Used to create a layer of abstraction between triggers and raw functions


*/





//                Installable triggers

function onOpen_InstallableTrigger() {
  Logger.log("[TRIGGER] Running buildMenu() as an installable trigger()");
  if (!CONFIG.ALLOW_INSTALLABLE_TRIGGER_ON_OPEN) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_INSTALLABLE_TRIGGER_ON_OPEN is set to false");
    return;
  }
  buildMenu();
}

function buildMenu() {
  SpreadsheetApp.getUi().createMenu('Manual Commands')
    .addItem('Pull Form Data', 'updateDataSheet_MenuTrigger_')
    .addItem('Import Contacts', 'importContacts_MenuTrigger_')
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("Debug Menu (don't worry about it)")
        .addItem('onOpen_InstallableTrigger', 'onOpen_InstallableTrigger')
        .addItem('Mark Duplicates', 'markDuplicates_MenuTrigger_')
        .addItem('loadAreaIDs', 'loadAreaIDs')
    )
    .addToUi();
}







//                Time-based triggers


function updateDataSheet_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateDataSheet() from a time-based trigger");
  if (!CONFIG.ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET is set to false");
    return;
  }
  updateDataSheet();
}
function importContacts_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running importContacts() from a time-based trigger")

  if (FREEZE_CONTACT_DATA) {
    Logger.log("[TRIGGER] Execution canceled: STOP_DATA_UPDATE_TRIGGER is set to true")
    return
  }
  let allSheetData = constructSheetData()
  importContacts(allSheetData)
}
function updateForm_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateForm() from a time-based trigger")
  if (!DBCONFIG.ALLOW_TIMEBASED_TRIGGER_UPDATE_FORM) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_TIMEBASED_TRIGGER_UPDATE_FORM is set to false")
    return;
  }
  updateForm()
}
function updateFS_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateFS() from a time-based trigger")

  createFS();
}
function updateAreaReports_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateAreaReports from a time-based trigger")
  updateAreaReports()
}
function updateDistrictReports_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateDistrictReports from a time-based trigger")
  updateDistrictReports()
}
function updateZoneReports_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateZoneReports() from a time-based trigger")
  updateZoneReports()
}




//                Custom menu triggers


function updateDataSheet_MenuTrigger_() {
  Logger.log("[TRIGGER] Running updateDataSheet() from the Manual Commands menu")
  if (!CONFIG.ALLOW_MENU_TRIGGER_UPDATE_DATA_SHEET) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_MENU_TRIGGER_UPDATE_DATA_SHEET is set to false");
    return;
  }
  updateDataSheet();
}
function updateFS_MenuTrigger_() {
  Logger.log("[TRIGGER] Running updateFS() from the Manual Commands menu")
  createFS();
}
function updateAreaReports_MenuTrigger_() {
  Logger.log("[TRIGGER] Running updateAreaReports() from the Manual Commands menu")
  updateAreaReports()
}
function updateDistrictReports_MenuTrigger_() {
  Logger.log("[TRIGGER] Running updateDistrictReports() from the Manual Commands menu")
  updateDistrictReports()
}
function updateZoneReports_MenuTrigger_() {
  Logger.log("[TRIGGER] Running updateZoneReports() from the Manual Commands menu")
  updateZoneReports()
}
function importContacts_MenuTrigger_() {
  Logger.log("[TRIGGER] Running importContacts() from the Manual Commands menu")
  if (!CONFIG.ALLOW_MENU_TRIGGER_IMPORT_CONTACTS) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_MENU_TRIGGER_IMPORT_CONTACTS is set to false");
    return;
  }
  let allSheetData = constructSheetData();
  importContacts(allSheetData);
}
function markDuplicates_MenuTrigger_() {
  Logger.log("[TRIGGER] Running markDuplicates() from the Manual Commands menu")
  if (!CONFIG.ALLOW_MENU_TRIGGER_MARK_DUPLICATES) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_MENU_TRIGGER_MARK_DUPLICATES is set to false");
    return;
  }
  let allSheetData = constructSheetData();
  markDuplicates(allSheetData);
}

function loadAreaIDs_MenuTrigger_() {
  Logger.log("[TRIGGER] Running loadAreaIDs() from the Manual Commands menu")
  if (!CONFIG.ALLOW_MENU_TRIGGER_LOAD_AREA_IDS) {
    Logger.log("[TRIGGER] Execution canceled: DBCONFIG parameter ALLOW_MENU_TRIGGER_LOAD_AREA_IDS is set to false");
    return;
  }
  let allSheetData = constructSheetData();
  markDuplicates(allSheetData);
}














