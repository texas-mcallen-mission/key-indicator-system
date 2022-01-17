/*
        triggers
        Helper functions relating to simple, time-based, and custom menu triggers. Used to create a layer of abstraction between triggers and raw functions


*/





//                Simple triggers

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Manual Commands')
                            .addItem('Pull Form Data', 'updateDataSheet_MenuTrigger_')
                            .addItem('Import Contacts', 'importContacts_MenuTrigger_')
                            .addSubMenu(
                                SpreadsheetApp.getUi().createMenu("Debug Menu (don't worry about it)")
                                .addItem('onOpen', 'onOpen')
                                .addItem('Mark Duplicates', 'markDuplicates_MenuTrigger_')
                            )
                            .addToUi();
}







//                Time-based triggers


function updateDataSheet_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateDataSheet() from a time-based trigger")
  updateDataSheet();
}

function updateFormData_TimeBasedTrigger() {
  Logger.log("[TRIGGER] Running updateDataSheet() from a time-based trigger")
  updateDataSheet();
}







//                Custom Menu triggers


function updateDataSheet_MenuTrigger_() {
  Logger.log("[TRIGGER] Running updateDataSheet() from the Manual Commands menu")
  updateDataSheet();
}

function importContacts_MenuTrigger_() {
  Logger.log("[TRIGGER] Running importContacts() from the Manual Commands menu")
  let allSheetData = constructSheetData();
  importContacts(allSheetData);
}

function markDuplicates_MenuTrigger_() {
  Logger.log("[TRIGGER] Running markDuplicates() from the Manual Commands menu")
  let allSheetData = constructSheetData();
  markDuplicates(allSheetData);
}














