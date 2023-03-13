//@ts-check
/*
        triggers.gs
        Helper functions relating to installable, time-based, and custom menu triggers. Used to create a layer of abstraction between triggers and raw functions


*/


//                Time-based triggers

// DEPRECATED, DO NOT NEED ANYMORE
// function updateTMMReport_TimeBasedTrigger() {
//     console.log("[TRIGGER] Running updateTMMReport() from a time-based trigger");
//     let meta_args: meta_runner_args = {
//         trigger:triggerTypes.timeBased
//     }
//     meta_runner(updateTMMReport,meta_args);
// }

// function updateLocalDataStore_TimeBasedTrigger() {
//     console.log("[TRIGGER] Running updateLocalDataStore() from a time-based trigger");
//         let meta_args: meta_runner_args = {
//         trigger:triggerTypes.timeBased
//     }
//     meta_runner(updateLocalDataStore,meta_args)
// }

function updateDataSheet_TimeBasedTrigger() {
    console.log("[TRIGGER] Running updateDataSheet() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateDataSheet) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateDataSheet is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger:triggerTypes.timeBased
    }
    meta_runner_(updateDataSheetV2,meta_args)
    }

function importContacts_TimeBasedTrigger() {

    // console.log("[TRIGGER] Running importContacts() from a time-based trigger");

    if (!CONFIG.triggers.timeBased.importContacts) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.importContacts is set to false");
        return;
    }

    const allSheetData : manySheetDatas = constructSheetDataV3(["closedAreas","contact"]);
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased,
        functionArg: allSheetData
    };
    meta_runner_(importContactsV2, meta_args)

    }

function updateForm_TimeBasedTrigger() {
    console.log("[TRIGGER] Running updateForm() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateForm) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateForm is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(updateForm, meta_args)
}

function updateFS_TimeBasedTrigger() {
    console.log("[TRIGGER] Running updateFS() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateFileSystem) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateFileSystem is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(updateFSV4, meta_args);
}

function updateAreaReports_TimeBasedTrigger() {
    console.log("[TRIGGER] Running updateAreaReports from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateAreaReports) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateAreaReports is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(updateAreaReportsV5, meta_args)

}

function updateDistrictReports_TimeBasedTrigger() {
    console.log("[TRIGGER] Running updateDistrictReports from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateDistReports) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateDistReports is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(updateDistrictReportsV5, meta_args)
}

function updateZoneReports_TimeBasedTrigger() {
    console.log("[TRIGGER] Running updateZoneReports() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.updateZoneReports) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.updateZoneReports is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(updateZoneReportsV5, meta_args)
}

function sharefileSystem_TimeBasedTrigger() {
    console.log("[TRIGGER] Running shareFileSystem() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.shareFileSystem) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.shareFileSystem is set to false");
        return;
    }//@ts-check

    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(shareFileSystem, meta_args);
}


function onOpen_InstallableTrigger() {
    console.log("[TRIGGER] Running buildMenu() as an installable trigger()");
    if (!CONFIG.triggers.installable.onOpen) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.installable.onOpen is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.onOpen
    };
    meta_runner_(buildMenu, meta_args)
    // buildMenu();
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






function pruneFS_TimeBasedTrigger() {
    console.log("[TRIGGER] Running pruneFS() from a time-based trigger");
    if (!CONFIG.triggers.timeBased.pruneFS) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.timeBased.pruneFS is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.timeBased
    };
    meta_runner_(pruneFS, meta_args)
}




//                Custom menu triggers


function updateDataSheet_MenuTrigger_() {
    console.log("[TRIGGER] Running updateDataSheet() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateDataSheet) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateDataSheet is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu
    };
    meta_runner_(updateDataSheetV2, meta_args)

}

function updateFS_MenuTrigger_() {
    if (!CONFIG.triggers.menu.updateFileSystem) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateFileSystem is set to false");
        return;
    }
    console.log("[TRIGGER] Running buildFSV4() from the Manual Commands menu");
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu
    };
    meta_runner_(buildFSV4, meta_args)
}

function updateAreaReports_MenuTrigger_() {
    console.log("[TRIGGER] Running updateAreaReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateAreaReports) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateAreaReports is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu
    };
    meta_runner_(updateAreaReportsV5, meta_args)
}

function updateDistrictReports_MenuTrigger_() {
    console.log("[TRIGGER] Running updateDistrictReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateDistReports) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateDistReports is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu
    };
    meta_runner_(updateDistrictReportsV5, meta_args)
}

function updateZoneReports_MenuTrigger_() {
    console.log("[TRIGGER] Running updateZoneReports() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.updateZoneReports) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.updateZoneReports is set to false");
        return;
    }
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu
    };
    meta_runner_(updateZoneReportsV5, meta_args)
}

function importContacts_MenuTrigger_() {
    console.log("[TRIGGER] Running importContacts() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.importContacts) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.importContacts is set to false");
        return;
    }
    const allSheetData : manySheetDatas = constructSheetDataV3();
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu,
        functionArg:allSheetData,
    };
    meta_runner_(importContactsV2, meta_args)
}

function markDuplicates_MenuTrigger_() {
    console.log("[TRIGGER] Running markDuplicates() from the Manual Commands menu");
    if (!CONFIG.triggers.menu.markDuplicates) {
        console.log("[TRIGGER] Execution canceled: CONFIG parameter triggers.menu.markDuplicates is set to false");
        return;
    }
    const allSheetData = constructSheetDataV3();
    const meta_args: meta_runner_args = {
        trigger: triggerTypes.menu,
        functionArg:allSheetData
    };
    meta_runner_(markDuplicatesV2_, meta_args)
}


