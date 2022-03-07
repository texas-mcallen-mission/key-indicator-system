//@ts-check
/*
        triggers.gs
        Helper functions relating to installable, time-based, and custom menu triggers. Used to create a layer of abstraction between triggers and raw functions


*/

// this has a ***TON*** of re-used segments in here, could totally get cleaned up a bit.



//                Installable triggers

function onOpen_InstallableTrigger() {
    Logger.log("[TRIGGER] Running buildMenu() as an installable trigger()");
    if (!CONFIG.triggers.installable.onOpen) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.installable.onOpen is set to false");
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
    if (!CONFIG.triggers.timeBased.updateDataSheet) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateDataSheet is set to false");
        return;
    }
    updateDataSheet();
}

function importContacts_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running importContacts() from a time-based trigger");

    if (!CONFIG.triggers.timeBased.importContacts) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.importContacts is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    importContacts(allSheetData);
}

function updateForm_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateForm() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateForm) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateForm is set to false");
        return;
    }
    updateForm();
}

function updateFS_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateFS() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateFileSystem) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateFileSystem is set to false");
        return;
    }
    verifyFilesystem();
    createFS();
}

function updateAreaReports_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateAreaReports from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateAreaReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateAreaReports is set to false");
        return;
    }
    updateAreaReports();
}

function updateDistrictReports_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateDistrictReports from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateDistReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateDistReports is set to false");
        return;
    }
    updateDistrictReports();
}

function updateZoneReports_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateZoneReports() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateZoneReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateZoneReports is set to false");
        return;
    }
    updateZoneReports();
}

function shareFileSystem_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running shareFileSystem() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.shareFileSystem) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.shareFileSystem is set to false");
        return;
    }
    shareFileSystem();
}




//                Custom menu triggers


function updateDataSheet_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateDataSheet() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateDataSheet) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateDataSheet is set to false");
        return;
    }
    updateDataSheet();
}

function updateFS_MenuTrigger_() {
    if (!CONFIG.triggers.menu.updateFileSystem) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateFileSystem is set to false");
        return;
    }
    Logger.log("[TRIGGER] Running updateFS() from the Manual Commands menu");
    createFS();
}

function updateAreaReports_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateAreaReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateAreaReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateAreaReports is set to false");
        return;
    }
    updateAreaReports();
}

function updateDistrictReports_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateDistrictReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateDistReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateDistReports is set to false");
        return;
    }
    updateDistrictReports();
}

function updateZoneReports_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateZoneReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateZoneReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateZoneReports is set to false");
        return;
    }
    updateZoneReports();
}

function importContacts_MenuTrigger_() {
    Logger.log("[TRIGGER] Running importContacts() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.importContacts) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.importContacts is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    importContacts(allSheetData);
}

function markDuplicates_MenuTrigger_() {
    Logger.log("[TRIGGER] Running markDuplicates() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.markDuplicates) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.markDuplicates is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    markDuplicates(allSheetData);
}

function loadAreaIDs_MenuTrigger_() {
    Logger.log("[TRIGGER] Running loadAreaIDs() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.loadAreaIds) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.loadAreaIds is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    loadAreaIDs(allSheetData);
}
