//@ts-check
/*
KIC-config
General and debugging configuration parameters
*/



let CONFIG =
{
    
    // general
    
    AREA_NAME_QUESTION_TITLE: 'Area Name',
    general_areaNameQuestionTitle: 'Area Name',

    KIC_FORM_ID: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',
    general_kicFormId: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',     //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs every Sunday).    gcopy:'1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw'    live:'1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g'

    DEL_OLD_RESPONSES_AGE_LIMIT: 0,
    general_deleteOldResponsesAgeLimit: 0,    //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.
    
    
    
    // dataFlow

    SKIP_MARKING_PULLED: true,
    dataFlow_skipMarkingPulled: true,  //Stops marking Form Responses as having been pulled into the data sheet

    SKIP_MARKING_DUPLICATES: false,
    dataFlow_skipMarkingDuplicates: false,

    FREEZE_CONTACT_DATA: false,
    dataFlow_freezeContactData: false,

    EXCLUDE_FORM_COLS_FROM_DATA: ["responsePulled", "submissionEmail"],
    dataFlow_formColumnsToExcludeFromDataSheet: ["responsePulled", "submissionEmail"],

    FORCE_AREA_ID_RELOAD_ON_UPDATE_DATA_SHEET: false,
    dataFlow_forceAreaIdReloadOnUpdateDataSheet: false,
    
    CACHE_AREA_IDS_EXP_LIMIT: 1800,
    dataFlow_areaId_cacheExpirationLimit: 1800,   //Maximum time in seconds before the cache gets reset

    CACHE_AREA_IDS_KEY: "butterflies and clouds",
    dataFlow_areaId_cacheKey: "butterflies and clouds", //ID to use when storing areaIDs in the cache

    CACHE_SHEET_DATA_ENABLED: true,
    dataFlow_allSheetData_cacheEnabled: true,  //Cache allSheetData, the object returned by constructSheetData()

    CACHE_SHEET_DATA_EXP_LIMIT: 1800,
    dataFlow_allSheetData_cacheExpirationLimit: 1800,   //Maximum time in seconds before the cache gets reset

    CACHE_SHEET_DATA_KEY: "puppies and flowers",
    dataFlow_allSheetData_cacheKey: "puppies and flowers", //ID to use when storing allSheetData in the cache

    CACHE_ORG_DATA_ENABLED: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

    MARK_DUPLICATES_MAX_ROW_TO_CHECK: 500,
    dataFlow_maxRowToMarkDuplicates: 500,  //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.
    
    
    
    // fileSystem
    
    UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD: false,
    fileSystem_updateSheetProtectionsOnLoad: false, //WARNING: If set to true, loading the filesystem will take a VERY long time!

    INCLUDE_SCOPE_IN_FOLDER_NAME: false,
    fileSystem_includeScopeInFolderName: true,

    FREEZE_FILESYS: false,
    fileSystem_freezeFilesys: false,
    
    
    
    // logging
    
    LOG_FILESYS: false,
    fileSystem_log_update: false,

    LOG_FILE_SHARING: false,
    fileSystem_log_fileShare: false,

    LOG_OLD_sendReportToDisplayV3_: false,
    fileSystem_log_sendReportToDisplayV3_: false,

    LOG_IMPORT_CONTACTS: false,
    dataFlow_log_importContacts: false,

    LOG_MERGE_DATA: false,
    dataFlow_log_dataMerge: false,

    LOG_RESPONSE_PULLED: false,
    dataFlow_log_responsePulled: false,

    LOG_DUPLICATES: false,
    dataFlow_log_duplicates: false,
    
    
    
    
    // triggers
    
    ALLOW_INSTALLABLE_TRIGGER_ON_OPEN: true,
    triggers_installable_onOpen: true,

    ALLOW_INSTALLABLE_TRIGGER_ON_EDIT: false,
    triggers_installable_onEdit: false,  //Not currently used

    ALLOW_TIMEBASED_TRIGGER_UPDATE_FORM: true,
    triggers_timeBased_updateForm: true,
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET: true,
    triggers_timeBased_updateDataSheet: true,

    ALLOW_TIMEBASED_TRIGGER_IMPORT_CONTACTS: true,    
    triggers_timeBased_importContacts: true,

    ALLOW_TIMEBASED_TRIGGER_UPDATE_FS: true,
    triggers_timeBased_updateFileSystem: true,
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_AREA_REPORTS: true,
    triggers_timeBased_updateAreaReports: true,
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DIST_REPORTS: true,
    triggers_timeBased_updateDistReports: true,
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_ZONE_REPORTS: true,
    triggers_timeBased_updateZoneReports: true,
    
    ALLOW_TIMEBASED_TRIGGER_SHARE_FILE_SYSTEM: false,
    triggers_timeBased_shareFileSystem: false,

    ALLOW_MENU_TRIGGER_UPDATE_DATA_SHEET: true,
    triggers_menu_updateDataSheet: true,

    ALLOW_MENU_TRIGGER_UPDATE_AREA_REPORTS: true,
    triggers_menu_updateAreaReports: true,

    ALLOW_MENU_TRIGGER_UPDATE_DIST_REPORTS: true,
    triggers_menu_updateDistReports: true,

    ALLOW_MENU_TRIGGER_UPDATE_ZONE_REPORTS: true,
    triggers_menu_updateZoneReports: true,

    ALLOW_MENU_TRIGGER_IMPORT_CONTACTS: true,
    triggers_menu_importContacts: true,

    ALLOW_MENU_TRIGGER_MARK_DUPLICATES: true,
    triggers_menu_markDuplicates: true,

    ALLOW_MENU_TRIGGER_LOAD_AREA_IDS: true,
    triggers_menu_loadAreaIds: true,

};


/*

    Config V1:

    CACHE_AREA_IDS_EXP_LIMIT: 1800,   //Maximum time in seconds before the cache gets reset
    CACHE_AREA_IDS_KEY: "butterflies and clouds", //ID to use when storing areaIDs in the cache
    CACHE_SHEET_DATA_ENABLED: true,  //Cache allSheetData, the object returned by constructSheetData()
    CACHE_SHEET_DATA_EXP_LIMIT: 1800,   //Maximum time in seconds before the cache gets reset
    CACHE_SHEET_DATA_KEY: "puppies and flowers", //ID to use when storing allSheetData in the cache
    CACHE_ORG_DATA_ENABLED: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()
    MARK_DUPLICATES_MAX_ROW_TO_CHECK: 500,  //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.
    UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD: false,
    FORCE_AREA_ID_RELOAD_ON_UPDATE_DATA_SHEET: false,
    AREA_NAME_QUESTION_TITLE: 'Area Name',
    INCLUDE_SCOPE_IN_FOLDER_NAME: true,
    KIC_FORM_ID: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',
    DEL_OLD_RESPONSES_AGE_LIMIT: 0,

    EXCLUDE_FORM_COLS_FROM_DATA: [
        "responsePulled",
        "submissionEmail"
    ],


    ALLOW_INSTALLABLE_TRIGGER_ON_OPEN: true,
    ALLOW_INSTALLABLE_TRIGGER_ON_EDIT: false,  //Not currently used
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_FS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_FORM: true,
    ALLOW_TIMEBASED_TRIGGER_IMPORT_CONTACTS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_AREA_REPORTS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DIST_REPORTS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_ZONE_REPORTS: true,
    ALLOW_TIMEBASED_TRIGGER_SHARE_FILE_SYSTEM: false,
    ALLOW_MENU_TRIGGER_UPDATE_DATA_SHEET: true,
    ALLOW_MENU_TRIGGER_UPDATE_AREA_REPORTS: true,
    ALLOW_MENU_TRIGGER_UPDATE_DIST_REPORTS: true,
    ALLOW_MENU_TRIGGER_UPDATE_ZONE_REPORTS: true,
    ALLOW_MENU_TRIGGER_IMPORT_CONTACTS: true,
    ALLOW_MENU_TRIGGER_MARK_DUPLICATES: true,
    ALLOW_MENU_TRIGGER_LOAD_AREA_IDS: true,

//test

//Debug config parameters

let DBCONFIG =
{


    LOG_IMPORT_CONTACTS: false,
    LOG_MERGE_DATA: false,
    LOG_RESPONSE_PULLED: false,
    LOG_DUPLICATES: false,
    LOG_FILE_SHARING: false,
    LOG_FILESYS: false,
    LOG_OLD_sendReportToDisplayV3_: false,
    SKIP_MARKING_PULLEDSKIP_MARKING_DUPLICATES: false,
    FREEZE_CONTACT_DATA: false,
    FREEZE_FILESYS: false,


*/