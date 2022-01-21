/*
        triggers.gs
        Helper functions relating to simple, installable, time-based, and custom menu triggers. Used to create a layer of abstraction between triggers and raw functions


*/





//                Installable triggers

function onOpen_InstalledTrigger() {
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

  if (STOP_DATA_UPDATE_TRIGGER) {
    Logger.log("[TRIGGER] Execution canceled: STOP_DATA_UPDATE_TRIGGER is set to true")
  }

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













