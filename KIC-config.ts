//@ts-check
/*
KIC-config
General and debugging configuration parameters
*/



let INTERNAL_CONFIG = {
    // docIds
    docIds_kicFormId: "This, along with the ones below, should probably be set in env secrets", //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs every Sunday).    gcopy:'1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw'    live:'1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g'

    reportCreator: {
        docIDs: {
            zoneTemplate: "ZONE TEMPLATE ID Goes Here",
            distTemplate: "Stick a district template here, if ya want",
            areaTemplate: "same as above, but for areas",
        },
        outputDataSheetName: "Data",
        configPageSheetName: "config",
        kicDataStoreSheetName: "Data",
    },

    // general

    general_areaNameQuestionTitle: "Area Name",

    general_deleteOldResponsesAgeLimit: 0, //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.

    // dataFlow

    dataFlow: {
        forceAreaIdReloadOnUpdateDataSheet: false,

        areaId_cacheExpirationLimit: 1800, //Maximum time in seconds before the cache gets reset

        areaId_cacheKey: "butterflies and clouds", //ID to use when storing areaIDs in the cache

        allSheetData_cacheEnabled: true, //Cache allSheetData, the object returned by constructSheetData()

        allSheetData_cacheExpirationLimit: 1800, //Maximum time in seconds before the cache gets reset

        allSheetData_cacheKey: "puppies and flowers", //ID to use when storing allSheetData in the cache

        missionOrgData_cacheEnabled: false, //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

        maxRowToMarkDuplicates: 500, //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.

        log_importContacts: false,
        log_dataMerge: false,
        log_responsePulled: false,
        log_duplicates: false,
        // TODO PULL THIS OUT
        skipMarkingPulled: true, //Stops marking Form Responses as having been pulled into the data sheet

        skipMarkingDuplicates: false, //TODO Re-implement?

        freezeContactData: false,

        formColumnsToExcludeFromDataSheet: ["responsePulled", "submissionEmail"],
    },

    commonLib: {
        log_access_info: false, // if set to true, logger will tell you whether or not files are accessible
        log_display_info: false, // if set to true, sendDataToDisplay & sendReportToDisplay will display extra debug information
        log_display_info_extended: false, // if set to true, sendDataToDisplay & sendReportToDisplay will display even more debug information
        log_time_taken: true, // if set to true, sendDataToDisplay & sendReportToDisplay will display how much time they took to run.  Pretty useful IMO
    },


    // fileSystem
    fileSystem: {
        reportLevel: { zone: "Zone", dist: "District", area: "Area" }, //Theoretically, since there's no difference between this anywhere you should be able to change this to be whatever gibberish you want as long as they're unique.  These strings also included in folder naming if INCLUDE_SCOPE_IN_FOLDER_NAME is set to true, so don't make them too pithy.

        updateSheetProtectionsOnLoad: false, //WARNING: If set to true, loading the filesystem will take a VERY long time!

        includeScopeInFolderName: false,

        freezeFilesys: false, //TODO Re-implement? Currently unimplemented

        log_existing_folders: false,

        log_filesys: false, //TODO Update references
        log_update: false,

        log_fileShare: false,

        LOG_OLD_sendReportToDisplayV3_: false, //TODO Update references
        log_sendReportToDisplayV3_: false,

        shardManager: {
            number_of_shards: 4, // this is 1-indexed: if you put 4 here, you will get 4 shards, not 5 total
            max_spread: 2 // the maximum amount of variation allowed in shard size- needs to be at least 1 otherwise you might have some problems, especially with large shard counts.
        }
    },

    // triggers
    triggers: {
        installable: {
            onOpen: true,
            onEdit: false, //Not currently used
        },
        timeBased: {
            updateForm: true,
            updateDataSheet: true,
            importContacts: true,
            updateFileSystem: true,
            updateAreaReports: true,
            updateDistReports: true,
            updateZoneReports: true,
            shareFileSystem: true,
            pruneFS: true
        },
        menu: {
            updateDataSheet: true,
            updateFileSystem: true,
            updateAreaReports: true,
            updateDistReports: true,
            updateZoneReports: true,
            importContacts: true,
            markDuplicates: true,
            loadAreaIds: true,
        }


    },

    scheduler: {
        meta_locker: {
            cacheTimeoutTime: 1900 // 30 minutes * 60 seconds + 100 extra seconds just in case
        },
        time_based_triggers: {
            updateDataSheet_TimeBasedTrigger: "updateDataSheet_TimeBasedTrigger",
            importContacts_TimeBasedTrigger: "importContacts_TimeBasedTrigger",
            updateForm_TimeBasedTrigger: "updateForm_TimeBasedTrigger",
            updateFS_TimeBasedTrigger: "updateFS_TimeBasedTrigger",
            updateAreaReports_TimeBasedTrigger: "updateAreaReports_TimeBasedTrigger",
            updateDistrictReports_TimeBasedTrigger: "updateDistrictReports_TimeBasedTrigger",
            updateZoneReports_TimeBasedTrigger: "updateZoneReports_TimeBasedTrigger",
            sharefileSystem_TimeBasedTrigger: "sharefileSystem_TimeBasedTrigger",

            pruneFS_TimeBasedTrigger: "pruneFS_TimeBasedTrigger",
        },
        execution_wait_in_minutes: 15, // can be 1, 5, 15 or 30


        onOpen_triggers: {
            onOpen_InstallableTrigger: "onOpen_InstallableTrigger",
        }


    }


};

// this combines the two objects together- the bottom ones overwrite the top ones.
//@ts-ignore
var _ = lodash.load();

function test_lodash() {
    console.log(CONFIG);
    // if you stick something in override_secret_data you'll be able to notice the changes.
}

// stick things here that you want to override your secret data- mostly for testing, or when you don't have access to modify github action secrets.
const OVERRIDE_SECRET_DATA = {
    //   dataFlow: { skipMarkingPulled: true } // easily re-commentable for convenience
};


var CONFIG = _.merge(INTERNAL_CONFIG, GITHUB_SECRET_DATA, OVERRIDE_SECRET_DATA);


interface manySheetDatas {
    [index: string]: SheetData,
}

interface sheetDataEntry {
    tabName: string,
    includeSoftcodedColumns: boolean,
    headerRow: number,
    sheetId?: string,
    allowWrite?: boolean,
    
    initialColumnOrder: columnConfig,

}

interface manySheetDataEntries {
    [index: string]: sheetDataEntry;
}

interface columnConfig {
    [index: string]: number,

}


var sheetDataConfig: { local: manySheetDataEntries, remote: manySheetDataEntries; } = getSheetDataConfig();
function getSheetDataConfig(): { local: manySheetDataEntries, remote: manySheetDataEntries; } {
    let CONFIG = _.merge(INTERNAL_CONFIG, GITHUB_SECRET_DATA, OVERRIDE_SECRET_DATA)

    let sheetDataConfig: { local: manySheetDataEntries, remote: manySheetDataEntries; } = {
        local: {
            form: {
                tabName: "Form Responses",
                headerRow: 0,
                includeSoftcodedColumns:true,
                initialColumnOrder: {
                    areaName: 0,
                    responsePulled: 1,
                    isDuplicate: 2,
                    formTimestamp: 3,
                    submissionEmail: 4,
                    kiDate: 5,
                    np: 6,
                    sa: 7,
                    bd: 8,
                    bc: 9,
                    rca: 10,
                    rc: 11,
                    serviceHrs: 12,
                    cki: 13,
                    "bap-self-ref": 14,
                    "bap-street": 15,
                    "bap-ward-activity-or-event": 16,
                    "bap-ref-recent-convert": 17,
                    "bap-ref-part-member": 18,
                    "bap-ref-other-member": 19,
                    "bap-ref-teaching-pool": 20,
                    "bap-ref-other-non-member": 21,
                    "bap-fb-mission": 22,
                    "bap-fb-personal": 23,
                    "bap-family-history": 24,
                    "bap-taught-prev": 25,
                    "fb-role": 26,
                    "fb-ref-ysa": 27,
                    "fb-ref-asl": 28,
                    "fb-ref-service": 29,
                    "fb-ref-laredo-spa": 30,
                    "fb-ref-laredo-eng": 31,
                    "fb-ref-rgv-spa": 32,
                    "fb-ref-rgv-eng": 33,
                    "fb-ref-corpus": 34,
                },
            },
            data: {
                tabName: "Data",
                headerRow: 0,
                includeSoftcodedColumns:true,
                initialColumnOrder: {
                    areaName: 0,
                    log: 1,
                    areaEmail: 2,
                    isDuplicate: 3,
                    formTimestamp: 4, //form data
                    areaID: 5,
                    kiDate: 6, //form data

                    np: 7, //form data
                    sa: 8, //form data
                    bd: 9, //form data
                    bc: 10, //form data
                    rca: 11, //form data
                    rc: 12, //form data
                    cki: 13, //form data
                    serviceHrs: 14, //form data

                    name1: 15,
                    position1: 16,
                    isTrainer1: 17,
                    name2: 18,
                    position2: 19,
                    isTrainer2: 20,
                    name3: 21,
                    position3: 22,
                    isTrainer3: 23, // hello, update!

                    // super confused
                    districtLeader: 24,
                    zoneLeader1: 25,
                    zoneLeader2: 26,
                    zoneLeader3: 27,
                    stl1: 28,
                    stl2: 29,
                    stl3: 30,
                    stlt1: 31,
                    stlt2: 32,
                    stlt3: 33,
                    assistant1: 34,
                    assistant2: 35,
                    assistant3: 36,

                    district: 37,
                    zone: 38,
                    unitString: 39,
                    hasMultipleUnits: 40,
                    languageString: 41,
                    isSeniorCouple: 42,
                    isSisterArea: 43,
                    hasVehicle: 44,
                    vehicleMiles: 45,
                    vinLast8: 46,
                    aptAddress: 47,

                    "bap-self-ref": 48,
                    "bap-street": 49,
                    "bap-ward-activity-or-event": 50,
                    "bap-ref-recent-convert": 51,
                    "bap-ref-part-member": 52,
                    "bap-ref-other-member": 53,
                    "bap-ref-teaching-pool": 54,
                    "bap-ref-other-non-member": 55,
                    "bap-fb-mission": 56,
                    "bap-fb-personal": 57,
                    "bap-family-history": 58,
                    "bap-taught-prev": 59,
                    "fb-role": 60,
                    "fb-ref-ysa": 61,
                    "fb-ref-asl": 62,
                    "fb-ref-service": 63,
                    "fb-ref-laredo-spa": 64,
                    "fb-ref-laredo-eng": 65,
                    "fb-ref-rgv-spa": 66,
                    "fb-ref-rgv-eng": 67,
                    "fb-ref-corpus": 68,
                },
            },
            contact: {
                tabName: "Contact Data",
                headerRow: 0,
                includeSoftcodedColumns: true,
                initialColumnOrder: {
                    dateContactGenerated: 0,
                    areaEmail: 1,
                    areaName: 2,
                    name1: 3,
                    position1: 4,
                    isTrainer1: 5,
                    name2: 6,
                    position2: 7,
                    isTrainer2: 8,
                    name3: 9,
                    position3: 10,
                    isTrainer3: 11,
                    district: 12,
                    zone: 13,
                    unitString: 14,
                    hasMultipleUnits: 15,
                    languageString: 16,
                    isSeniorCouple: 17,
                    isSisterArea: 18,
                    hasVehicle: 19,
                    vehicleMiles: 20,
                    vinLast8: 21,
                    aptAddress: 22,
                },
            },
            debug: {
                tabName: "DEBUG SHEET",
                headerRow: 0,
                includeSoftcodedColumns: true,
                initialColumnOrder: {
                    functionName: 0,
                    baseFunction: 1,
                    triggerType: 2,
                    timeStarted: 3,
                    timeEnded: 4,
                    commit_sha: 5,
                    action_event_name: 6,
                    github_actor: 7,
                    job_id: 8,
                    github_repository: 9,
                    github_branch_ref: 10,
                    executionCounter: 11,
                    cycleEndMillis: 12,
                    duration: 13,
                    cycleStartMillis: 14,
                    failures: 15

                },
            },
            headerTest: {
                tabName: "headerTest",
                headerRow: 1,
                includeSoftcodedColumns: true,
                sheetId: CONFIG.dataFlow.sheetTargets.headerTest,
                initialColumnOrder: {
                    areaName: 0,
                    log: 1,
                    areaEmail: 2,
                    isDuplicate: 3,
                    formTimestamp: 4, //form data
                    areaID: 5,
                    kiDate: 6, //form data

                    np: 7, //form data
                    sa: 8, //form data
                    bd: 9, //form data
                    bc: 10, //form data
                    rca: 11, //form data
                    rc: 12, //form data
                    serviceHrs: 14, //form data

                    name1: 15,
                    position1: 16,
                    isTrainer1: 17,
                    name2: 18,
                    position2: 19,
                    isTrainer2: 20,
                    name3: 21,
                    position3: 22,
                    isTrainer3: 23, // hello, update!

                    cki: 13, //form data
                    // super confused
                    districtLeader: 24,
                    zoneLeader1: 25,
                    zoneLeader2: 26,
                    zoneLeader3: 27,
                    stl1: 28,
                    stl2: 29,
                    stl3: 30,
                    stlt1: 31,
                    stlt2: 32,
                    stlt3: 33,
                    assistant1: 34,
                    assistant2: 35,
                    assistant3: 36,

                    "bap-self-ref": 48,
                    "bap-street": 49,
                    "bap-ward-activity-or-event": 50,
                    "bap-ref-recent-convert": 51,
                    "bap-ref-part-member": 52,
                    "bap-ref-other-member": 53,
                    "bap-ref-teaching-pool": 54,
                    "bap-ref-other-non-member": 55,
                    "bap-fb-mission": 56,
                    "bap-fb-personal": 57,
                    "bap-family-history": 58,
                    "bap-taught-prev": 59,
                    "fb-role": 60,
                    "fb-ref-ysa": 61,

                    district: 37,
                    zone: 38,
                    unitString: 39,
                    hasMultipleUnits: 40,
                    languageString: 41,
                    isSeniorCouple: 42,
                    isSisterArea: 43,
                    hasVehicle: 44,
                    vehicleMiles: 45,
                    vinLast8: 46,
                    aptAddress: 47,

                    "fb-ref-asl": 62,
                    "fb-ref-service": 63,
                    "fb-ref-laredo-spa": 64,
                    "fb-ref-laredo-eng": 65,
                    "fb-ref-rgv-spa": 66,
                    "fb-ref-rgv-eng": 67,
                    "fb-ref-corpus": 68,
                },
            }
        },
        remote: {
            serviceRep: {
                tabName: "serviceRep-data",
                headerRow: 2,
                includeSoftcodedColumns: false,
                sheetId: CONFIG.dataFlow.sheetTargets.serviceRep,
                initialColumnOrder: {
                    areaName: 0,
                    areaID: 1,
                    district: 2,
                    zone: 3,
                    combinedNames: 4,
                    kiDate: 5,
                    serviceHrs: 6,
                },
            },
            tmmReport: {
                tabName: "TMM Report Printable",
                headerRow: 9,
                includeSoftcodedColumns: false,
                sheetId: CONFIG.dataFlow.sheetTargets.tmmReport,
                initialColumnOrder: {
                    areaName: 0,
                    district: 1,
                    zone: 2,
                    np: 3,
                    sa: 4,
                    bd: 5,
                    bc: 6,
                    rrPercent: 7,
                    serviceHrs: 8,
                    cki: 9,
                    hasVehicle: 10,
                    truncLang: 11,
                    combinedNames: 12,
                },
            },
            fbReferrals: {
                tabName: "techSquad Data",
                headerRow: 1,
                includeSoftcodedColumns: false,
                sheetId: CONFIG.dataFlow.sheetTargets.fbReferrals,
                initialColumnOrder: {
                    areaName: 0,
                    areaID: 1,
                    district: 2,
                    zone: 3,
                    combinedNames: 4,
                    kiDate: 5,
                    "fb-role": 6,
                    "fb-ref-ysa": 7,
                    "fb-ref-asl": 8,
                    "fb-ref-service": 9,
                    "fb-ref-laredo-spa": 10,
                    "fb-ref-laredo-eng": 11,
                    "fb-ref-rgv-spa": 12,
                    "fb-ref-rgv-eng": 13,
                    "fb-ref-corpus": 14,
                },
            },
            remoteData: {
                tabName: "Data",
                headerRow: 1,
                sheetId: CONFIG.dataFlow.sheetTargets.data,
                includeSoftcodedColumns: false,
                allowWrite: false,
                initialColumnOrder: {
                    areaName: 0,
                    log: 1,
                    areaEmail: 2,
                    isDuplicate: 3,
                    formTimestamp: 4, //form data
                    areaID: 5,
                    kiDate: 6, //form data

                    np: 7, //form data
                    sa: 8, //form data
                    bd: 9, //form data
                    bc: 10, //form data
                    rca: 11, //form data
                    rc: 12, //form data
                    cki: 13, //form data
                    serviceHrs: 14, //form data

                    name1: 15,
                    position1: 16,
                    isTrainer1: 17,
                    name2: 18,
                    position2: 19,
                    isTrainer2: 20,
                    name3: 21,
                    position3: 22,
                    isTrainer3: 23, // hello, update!

                    // super confused
                    districtLeader: 24,
                    zoneLeader1: 25,
                    zoneLeader2: 26,
                    zoneLeader3: 27,
                    stl1: 28,
                    stl2: 29,
                    stl3: 30,
                    stlt1: 31,
                    stlt2: 32,
                    stlt3: 33,
                    assistant1: 34,
                    assistant2: 35,
                    assistant3: 36,

                    district: 37,
                    zone: 38,
                    unitString: 39,
                    hasMultipleUnits: 40,
                    languageString: 41,
                    isSeniorCouple: 42,
                    isSisterArea: 43,
                    hasVehicle: 44,
                    vehicleMiles: 45,
                    vinLast8: 46,
                    aptAddress: 47,
                    // "formNotes": 48,    //form data
                    //...additional form data (ex. baptism sources)
                    "bap-self-ref": 48,
                    "bap-street": 49,
                    "bap-ward-activity-or-event": 50,
                    "bap-ref-recent-convert": 51,
                    "bap-ref-part-member": 52,
                    "bap-ref-other-member": 53,
                    "bap-ref-teaching-pool": 54,
                    "bap-ref-other-non-member": 55,
                    "bap-fb-mission": 56,
                    "bap-fb-personal": 57,
                    "bap-family-history": 58,
                    "bap-taught-prev": 59,
                    "fb-role": 60,
                    "fb-ref-ysa": 61,
                    "fb-ref-asl": 62,
                    "fb-ref-service": 63,
                    "fb-ref-laredo-spa": 64,
                    "fb-ref-laredo-eng": 65,
                    "fb-ref-rgv-spa": 66,
                    "fb-ref-rgv-eng": 67,
                    "fb-ref-corpus": 68,

                },
            },
        }



    };
    return sheetDataConfig;
}
