//@ts-check
/*
KIC-config
General and debugging configuration parameters
*/

const sheetCoreConfig: sheetCoreConfigInfo = {
    cacheKey: "AYYO_SHEETCACHE",
    cacheExpiration: 1800,
    cacheEnabled:true,

}

/** @type {*} */
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

        // OH BOI
        targetSheetId: "sheetID1",

        reportDataEntryConfig: {
            tabName: "reportData",
            headerRow: 3,
            includeSoftcodedColumns: false,
            // Initial Column Order 
            initialColumnOrder: {
                areaName: 0,
                kiDate: 1,
                areaID: 2,
                zone: 3,
                district: 4,
                combinedNames: 5,
                np: 6,
                sa: 7,
                bd: 8,
                bc: 9,
                serviceHrs: 10,
                rca: 11,
                rc: 12,
                cki: 13,
                "fb-role": 14,
                "fb-ref-sum": 15,
                isDuplicate: 16,
                rrPercent: 17,
            },
            requireRemote:true,
            sheetId: "",
            allowWrite: true
        }
    },
    
    kiData: {
        fb_referral_keys: [
            "fb-ref-ysa",
            "fb-ref-asl",
            "fb-ref-service",
            "fb-ref-laredo-spa",
            "fb-ref-laredo-eng",
            "fb-ref-rgv-spa",
            "fb-ref-rgv-eng",
            "fb-ref-corpus",
            "fb-ref-personal",
            "fb-ref-st-eng",
            "fb-ref-st-spa"
        ],
        baptism_source_keys: [
            "bap-self-ref",
            "bap-street",
            "bap-ward-activity-or-event",
            "bap-ref-recent-convert",
            "bap-ref-part-member",
            "bap-ref-other-member",
            "bap-ref-teaching-pool",
            "bap-ref-other-non-member",
            "bap-fb-mission",
            "bap-fb-personal",
            "bap-family-history",
            "bap-taught-prev",
        ],

        new_key_names: {
            fb_referral_sum: "fb-ref-sum",
            retentionRate: "rrPercent",
        },

    },
    // general

    general_areaNameQuestionTitle: "Area Name",

    general_deleteOldResponsesAgeLimit: 0, //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.

    // dataFlow

    dataFlow: {
        forceAreaIdReloadOnUpdateDataSheet: false,

        areaId_cacheExpirationLimit: 1800, //Maximum time in seconds before the cache gets reset
        
        areaId_cacheKey: "butterflies and clouds", //ID to use when storing areaIDs in the cache
        
        // !MOVED: Now part of sheetCoreConfig 
        // allSheetData_cacheEnabled: true, //Cache allSheetData, the object returned by constructSheetData()

        // allSheetData_cacheExpirationLimit: 1800, //Maximum time in seconds before the cache gets reset

        // allSheetData_cacheKey: "puppies and flowers", //ID to use when storing allSheetData in the cache

        missionOrgData_cacheEnabled: false, //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

        maxRowToMarkDuplicates: 500, //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.

        log_importContacts: false,
        log_dataMerge: false,
        log_responsePulled: false,
        log_duplicates: false,
        // TODO PULL THIS OUT somewhere a little easier to access?
        skipMarkingPulled: false, //Stops marking Form Responses as having been pulled into the data sheet

        skipMarkingDuplicates: false, //TODO Re-implement?

        freezeContactData: false,

        // formColumnsToExcludeFromDataSheet: ["responsePulled", "submissionEmail"],
        sheetTargets: {}
    },

    commonLib: {
        log_access_info: false, // if set to true, logger will tell you whether or not files are accessible
        log_display_info: false, // if set to true, sendDataToDisplay & sendReportToDisplay will display extra debug information
        log_display_info_extended: false, // if set to true, sendDataToDisplay & sendReportToDisplay will display even more debug information
        log_time_taken: true, // if set to true, sendDataToDisplay & sendReportToDisplay will display how much time they took to run.  Pretty useful IMO
    },


    // fileSystem
    fileSystem: {
        // IF YOU CHANGE THESE, ALSO UPDATE the fsScope interface declaration in driveHandler!
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
            max_spread: 2, // the maximum amount of variation allowed in shard size- needs to be at least 1 otherwise you might have some problems, especially with large shard counts.
            shard_cache_base_key: "THISISTHESONGTHATNEVERENDSOHYESMYFRIENDS",
            timeout_in_seconds: 600, /*10 minutes: 60 seconds * 10 */
        },

    },
    // kiData: {
    //     fb_referral_keys: [
    //         "fb-ref-ysa",
    //         "fb-ref-asl",
    //         "fb-ref-service",
    //         "fb-ref-laredo-spa",
    //         "fb-ref-laredo-eng",
    //         "fb-ref-rgv-spa",
    //         "fb-ref-rgv-eng",
    //         "fb-ref-corpus",
    //         "fb-ref-personal"
    //     ],
        
    //     new_key_names: {
    //         fb_referral_sum: "fb-ref-sum",
    //         retentionRate: "rrPercent",
    //     },

    // },

    // triggers
    // this is *technically* optional, as you can just not check it in your timeBasedTrigger caller dude
    // TODO: Convert this to a typed configuration thing like was done with sheetDataConfig
    // That way we can use EVEN MORE TYPESCRIPT to define things, which would be REALLY nice
    // Also would let me get rid of some of the boilerplate in the triggers, as I could have one metarunner thing with its own sheet responsible for like everything
    // I could also use this as a way to more cleanly enable other stuff; just have to figure out how to restructure things first
    // if I go and re-build *everything*, I can make the whole config strongly-enough typed for autocompletion to work well.
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
        /**
         * key names in this object are equal to functions, their value is the increment of minutes/days/hours/weeks between executions. 
         */
        time_based_triggers: {
            minutes: { // valid increments:  1,5,10,15,30
                // when used in conjunction with meta_runner, this becomes the time between checking if a function is running or not and executing if it is able to.
                updateDataSheet_TimeBasedTrigger: 1,
                importContacts_TimeBasedTrigger: 10,
                updateFS_TimeBasedTrigger: 10,
                // updateAreaReports_TimeBasedTrigger: 10,
                // updateDistrictReports_TimeBasedTrigger: 10,
                // updateZoneReports_TimeBasedTrigger: 10,

                pruneFS_TimeBasedTrigger: 30,
                // updateTMMReport_TimeBasedTrigger: 1,
                // updateLocalDataStore_TimeBasedTrigger: 1,
                areaShardUpdater1: 1,
                areaShardUpdater2: 1,
                districtShardUpdater1: 1,
                districtShardUpdater2: 1,
                zoneShardUpdater1: 1,
                zoneShardUpdater2: 1,

            },
            hours: { // valid increments: any integer >= 1
                updateForm_TimeBasedTrigger: 2, // 
                createMissingReports: 1,
                updateAreaReportsV5:1,
                updateDistrictReportsV5:1,
                updateZoneReportsV5:1,
            },
            days: { // valid increments: any integer >= 1
                sharefileSystem_TimeBasedTrigger: 1,
            },
            weeks: { // valid increments: any integer >= 1
                updateTimeBasedTriggers: 1, // every week, update and make sure triggers are good.  (CAN BE DANGEROUS!!!)

            },

        },



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





var sheetDataConfig: { local: manySheetDataEntries} = getSheetDataConfig();
/**
 * this exists because of some weird problems I was having with the GAS environment not loading the CONFIG thing properly.
 *
 * @return {{ local: manySheetDataEntries, remote: manySheetDataEntries; }}
 */
function getSheetDataConfig(): { local: manySheetDataEntries } {
    let CONFIG = _.merge(INTERNAL_CONFIG, GITHUB_SECRET_DATA, OVERRIDE_SECRET_DATA);
    // this is stuck inside of a function for no other reason than that I was having some problems with it being static and referencing the CONFIG before that was declared.

    let sheetDataConfig: { local: manySheetDataEntries } = {
        local: {
            form: {
                tabName: "Form Responses",
                headerRow: 0,
                includeSoftcodedColumns: true,
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
                    "fb-ref-rgv-eng": 27,
                    "fb-ref-rgv-spa": 28,
                    "fb-ref-laredo-eng": 29,
                    "fb-ref-laredo-spa": 30,
                    "fb-ref-ysa": 31,
                    "fb-ref-asl": 32,
                    "fb-ref-service": 33,
                    "fb-ref-corpus": 34,
                    "fb-ref-personal": 35,
                    "feedback-general": 36, // had to hardcode these because I added more questions afterwards.
                    "feedback-improvement": 37,
                    "feedback-analysis":38,
                    "fb-ref-st-eng": 39,
                    "fb-ref-st-spa":40
                },
            },
            data: {
                tabName: "Data",
                headerRow: 0,
                includeSoftcodedColumns: true,
                keyNamesToIgnore: ["responsePulled", "submissionEmail"],
                initialColumnOrder: {
                    areaName: 0,
                    log: 1,
                    areaEmail: 2,
                    isDuplicate: 3,
                    formTimestamp: 4,
                    areaID: 5,
                    kiDate: 6,
                    np: 7,
                    sa: 8,
                    bd: 9,
                    bc: 10,
                    rca: 11,
                    rc: 12,
                    cki: 13,
                    serviceHrs: 14,
                    name1: 15,
                    position1: 16,
                    isTrainer1: 17,
                    name2: 18,
                    position2: 19,
                    isTrainer2: 20,
                    name3: 21,
                    position3: 22,
                    isTrainer3: 23,
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
                    "fb-ref-rgv-eng": 61,
                    "fb-ref-rgv-spa": 62,
                    "fb-ref-laredo-eng": 63,
                    "fb-ref-laredo-spa": 64,
                    "fb-ref-ysa": 65,
                    "fb-ref-asl": 66,
                    "fb-ref-service": 67,
                    "fb-ref-corpus": 68,
                    "fb-ref-personal": 69,
                    'feedback-general': 70,
                    'feedback-improvement': 71,
                    'feedback-analysis': 72,
                    'fb-ref-st-eng': 73,
                    'fb-ref-st-spa': 74,
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
                sheetId:CONFIG.dataFlow.sheetTargets.debug,
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
                    failures: 15,
                    errors: 16,
                    shardID: 17,
                    shardInstanceID: 18,
                    debugLogData:19,

                },
            },
            areaFilesys: {
                tabName: "Area Filesys",
                headerRow: 0,
                includeSoftcodedColumns: true,
                // sheetId: CONFIG.dataFlow.sheetTargets.headerTest, // removed because this should probably always be on the local sheet.  Doesn't take up that much space.
                initialColumnOrder: {
                    folderName: 0,
                    parentFolder: 1,
                    folderId: 2,
                    sheetID1: 3,
                    sheetID2: 4,
                    areaID: 5,
                    folderBaseName: 6,
                    seedId: 7,
                },
            },
            distFilesys: {
                tabName: "Dist Filesys",
                headerRow: 0,
                includeSoftcodedColumns: true,
                // sheetId: CONFIG.dataFlow.sheetTargets.headerTest, // removed because this should probably always be on the local sheet.  Doesn't take up that much space.
                initialColumnOrder: {
                    folderName: 0,
                    parentFolder: 1,
                    folderId: 2,
                    sheetID1: 3,
                    sheetID2: 4,
                    areaID: 5,
                    folderBaseName: 6,
                    seedId: 7,
                },
            },
            zoneFilesys: {
                tabName: "Zone Filesys",
                headerRow: 0,
                includeSoftcodedColumns: true,
                // sheetId: CONFIG.dataFlow.sheetTargets.headerTest, // removed because this should probably always be on the local sheet.  Doesn't take up that much space.
                initialColumnOrder: {
                    folderName: 0,
                    parentFolder: 1,
                    folderId: 2,
                    sheetID1: 3,
                    sheetID2: 4,
                    areaID: 5,
                    folderBaseName: 6,
                    seedId: 7,
                },
            },
        }



    };
    return sheetDataConfig;
}
