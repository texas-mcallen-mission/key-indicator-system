//@ts-check
/*
        triggers.gs
        Helper functions relating to installable, time-based, and custom menu triggers. Used to create a layer of abstraction between triggers and raw functions


*/


function meta_runner(functionName, trigger,functionArg1 = undefined) {
    console.log("[META_RUNNER] - Running ", functionName.name, " with trigger:", trigger)
    let dLog: dataLogger = new dataLogger(functionName.name, trigger, false)
    dLog.startFunction(functionName.name)
    try {
        if (functionArg1 == undefined) {
            functionName(dLog)
        } else {
            Logger.log(typeof functionArg1)
            functionName(functionArg1,dLog)
        }
    } catch (error) {
        dLog.addFailure(functionName.name, error)
    }
    dLog.endFunction(functionName)
    dLog.end()
}
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


// function testSomethingInsane() {
//     passThroughFunctionAndRun(updateZoneReports, triggerTypes.DEBUG)
// }

// function passThroughFunctionAndRun(functionName,trigger) {
//     let dLog: dataLogger = new dataLogger(functionName.name, trigger)
//     Logger.log(testSomethingInsane.name)
//     console.info("running ", functionName.name, " from a ", trigger)
//     dLog.startFunction(functionName.name)
//     try {
//         functionName(dLog)
//     } catch (error) {
//         dLog.addFailure(functionName.name, error)
//     }
//     dLog.endFunction(functionName.name)
//     dLog.end()
// }



//                Time-based triggers


function updateDataSheet_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateDataSheet() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateDataSheet) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateDataSheet is set to false");
        return;
    }
    meta_runner(updateDataSheet, triggerTypes.timeBased)
}

function importContacts_TimeBasedTrigger() {

    // Logger.log("[TRIGGER] Running importContacts() from a time-based trigger");

    if (!CONFIG.triggers.timeBased.importContacts) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.importContacts is set to false");
        return;
    }
    
    let allSheetData = constructSheetData();
    meta_runner(importContacts,triggerTypes.timeBased,allSheetData)
}

function updateForm_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateForm() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateForm) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateForm is set to false");
        return;
    }
    meta_runner(updateForm(),triggerTypes.timeBased)
}

function updateFS_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateFS() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateFileSystem) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateFileSystem is set to false");
        return;
    }
    meta_runner(updateFS,triggerTypes.timeBased)
}

function updateAreaReports_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateAreaReports from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateAreaReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateAreaReports is set to false");
        return;
    }
    meta_runner(updateAreaReports, triggerTypes.timeBased)
    // updateAreaReports();
}

function updateDistrictReports_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateDistrictReports from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateDistReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateDistReports is set to false");
        return;
    }
    meta_runner(updateDistrictReports, triggerTypes.timeBased)
    // updateDistrictReports();
}

function updateZoneReports_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running updateZoneReports() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateZoneReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateZoneReports is set to false");
        return;
    }
    meta_runner(updateZoneReports,triggerTypes.timeBased)
}

function sharefileSystem_TimeBasedTrigger() {
    Logger.log("[TRIGGER] Running shareFileSystem() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.shareFileSystem) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.shareFileSystem is set to false");
        return;
    }
    meta_runner(shareFileSystem,triggerTypes.timeBased)
}




//                Custom menu triggers


function updateDataSheet_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateDataSheet() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateDataSheet) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateDataSheet is set to false");
        return;
    }
    meta_runner(updateDataSheet,triggerTypes.menu)
}

function updateFS_MenuTrigger_() {
    if (!CONFIG.triggers.menu.updateFileSystem) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateFileSystem is set to false");
        return;
    }
    Logger.log("[TRIGGER] Running updateFS() from the Manual Commands menu");
    meta_runner(createFS,triggerTypes.menu)
}

function updateAreaReports_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateAreaReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateAreaReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateAreaReports is set to false");
        return;
    }
    meta_runner(updateAreaReports,triggerTypes.menu)
}

function updateDistrictReports_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateDistrictReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateDistReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateDistReports is set to false");
        return;
    }
    meta_runner(updateDistrictReports,triggerTypes.menu)
}

function updateZoneReports_MenuTrigger_() {
    Logger.log("[TRIGGER] Running updateZoneReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateZoneReports) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateZoneReports is set to false");
        return;
    }
    meta_runner(updateZoneReports, triggerTypes.menu)
}

function importContacts_MenuTrigger_() {
    Logger.log("[TRIGGER] Running importContacts() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.importContacts) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.importContacts is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    meta_runner(importContacts, triggerTypes.menu,allSheetData)
    // importContacts(allSheetData);
}

function markDuplicates_MenuTrigger_() {
    Logger.log("[TRIGGER] Running markDuplicates() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.markDuplicates) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.markDuplicates is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    meta_runner(markDuplicates,triggerTypes.menu,allSheetData)
}

function loadAreaIDs_MenuTrigger_() {
    Logger.log("[TRIGGER] Running loadAreaIDs() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.loadAreaIds) {
        Logger.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.loadAreaIds is set to false");
        return;
    }
    let allSheetData = constructSheetData();
    meta_runner(loadAreaIDs,triggerTypes.menu,allSheetData)
}
