//@ts-check
/*
KIC-config
General and debugging configuration parameters
*/



let CONFIG =
{
    
    // general
    
    AREA_NAME_QUESTION_TITLE: 'Area Name',
    //general_areaNameQuestionTitle

    KIC_FORM_ID: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',     //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs).      gcopy: 1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw       live: 1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g
    //general_kicFormId

    DEL_OLD_RESPONSES_AGE_LIMIT: 0,    //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.
    //general_deleteOldResponsesAgeLimit
    
    
    
    // dataFlow

    SKIP_MARKING_PULLED: true,  //Stops marking Form Responses as having been pulled into the data sheet
    //dataFlow_skipMarkingPulled

    SKIP_MARKING_DUPLICATES: false,
    //dataFlow_skipMarkingDuplicates

    FREEZE_CONTACT_DATA: false,
    //dataFlow_freezeContactData

    EXCLUDE_FORM_COLS_FROM_DATA: ["responsePulled", "submissionEmail"],
    //dataFlow_formColumnsToExcludeFromDataSheet

    FORCE_AREA_ID_RELOAD_ON_UPDATE_DATA_SHEET: false,
    //dataFlow_forceAreaIdReloadOnUpdateDataSheet
    
    CACHE_AREA_IDS_EXP_LIMIT: 1800,   //Maximum time in seconds before the cache gets reset
    //dataFlow_areaId_cacheExpirationLimit

    CACHE_AREA_IDS_KEY: "butterflies and clouds", //ID to use when storing areaIDs in the cache
    //dataFlow_areaId_cacheKey

    CACHE_SHEET_DATA_ENABLED: true,  //Cache allSheetData, the object returned by constructSheetData()
    //dataFlow_allSheetData_cacheEnabled

    CACHE_SHEET_DATA_EXP_LIMIT: 1800,   //Maximum time in seconds before the cache gets reset
    //dataFlow_allSheetData_cacheExpirationLimit

    CACHE_SHEET_DATA_KEY: "puppies and flowers", //ID to use when storing allSheetData in the cache
    //dataFlow_allSheetData_cacheKey

    CACHE_ORG_DATA_ENABLED: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

    MARK_DUPLICATES_MAX_ROW_TO_CHECK: 500,  //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.
    //dataFlow_maxRowToMarkDuplicates
    
    
    
    // fileSystem
    
    UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD: false, //WARNING: If set to true, loading the filesystem will take a VERY long time!
    //fileSystem_updateSheetProtectionsOnLoad

    INCLUDE_SCOPE_IN_FOLDER_NAME: true,
    //fileSystem_includeScopeInFolderName

    FREEZE_FILESYS: false,
    //fileSystem_freezeFilesys
    
    
    
    // logging
    
    LOG_FILESYS: false,
    //fileSystem_log_update

    LOG_FILE_SHARING: false,
    //fileSystem_log_fileShare

    LOG_OLD_sendReportToDisplayV3_: false,
    //fileSystem_log_sendReportToDisplayV3_

    LOG_IMPORT_CONTACTS: false,
    //dataFlow_log_importContacts

    LOG_MERGE_DATA: false,
    //dataFlow_log_dataMerge

    LOG_RESPONSE_PULLED: false,
    //dataFlow_log_responsePulled

    LOG_DUPLICATES: false,
    //dataFlow_log_duplicates
    
    
    
    
    // triggers
    
    ALLOW_INSTALLABLE_TRIGGER_ON_OPEN: true,
    //triggers_installable_onOpen

    ALLOW_INSTALLABLE_TRIGGER_ON_EDIT: false,  //Not currently used
    //triggers_installable_onEdit

    ALLOW_TIMEBASED_TRIGGER_UPDATE_FORM: true,
    //triggers_timeBased_updateForm
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET: true,
    //triggers_timeBased_updateDataSheet

    ALLOW_TIMEBASED_TRIGGER_IMPORT_CONTACTS: true,    
    //triggers_timeBased_importContacts

    ALLOW_TIMEBASED_TRIGGER_UPDATE_FS: true,
    //triggers_timeBased_updateFileSystem
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_AREA_REPORTS: true,
    //triggers_timeBased_updateAreaReports
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DIST_REPORTS: true,
    //triggers_timeBased_updateDistReports
    
    ALLOW_TIMEBASED_TRIGGER_UPDATE_ZONE_REPORTS: true,
    //triggers_timeBased_updateZoneReports
    
    ALLOW_TIMEBASED_TRIGGER_SHARE_FILE_SYSTEM: false,
    //triggers_timeBased_shareFileSystem

    ALLOW_MENU_TRIGGER_UPDATE_DATA_SHEET: true,
    //triggers_menu_updateDataSheet

    ALLOW_MENU_TRIGGER_UPDATE_AREA_REPORTS: true,
    //triggers_menu_updateAreaReports

    ALLOW_MENU_TRIGGER_UPDATE_DIST_REPORTS: true,
    //triggers_menu_updateDistReports

    ALLOW_MENU_TRIGGER_UPDATE_ZONE_REPORTS: true,
    //triggers_menu_updateZoneReports

    ALLOW_MENU_TRIGGER_IMPORT_CONTACTS: true,
    //triggers_menu_importContacts

    ALLOW_MENU_TRIGGER_MARK_DUPLICATES: true,
    //triggers_menu_markDuplicates

    ALLOW_MENU_TRIGGER_LOAD_AREA_IDS: true,
    //triggers_menu_loadAreaIds
    
};

//test

//Debug config parameters

let DBCONFIG =
{










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