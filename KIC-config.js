//@ts-check
/*
        KIC-config
        General and debugging configuration parameters
*/

/*
Modules:
dataFlow
reportCreator
driveHandler
importContacts
general
*/

let CONFIG =
{

    CACHE_AREA_IDS_EXP_LIMIT: 1800,   //Maximum time in seconds before the cache gets reset


    CACHE_AREA_IDS_KEY: "butterflies and clouds", //ID to use when storing areaIDs in the cache


    CACHE_SHEET_DATA_ENABLED: true,  //Cache allSheetData, the object returned by constructSheetData()


    CACHE_SHEET_DATA_EXP_LIMIT: 1800,   //Maximum time in seconds before the cache gets reset


    CACHE_SHEET_DATA_KEY: "puppies and flowers", //ID to use when storing allSheetData in the cache


    CACHE_ORG_DATA_ENABLED: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()


    MARK_DUPLICATES_MAX_ROW_TO_CHECK: 500,  //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.


    
    UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD: false, //WARNING: If set to true, loading the filesystem will take a VERY long time!


    FORCE_AREA_ID_RELOAD_ON_UPDATE_DATA_SHEET: false,


    AREA_NAME_QUESTION_TITLE: 'Area Name',


    INCLUDE_SCOPE_IN_FOLDER_NAME: true,

    
    
    KIC_FORM_ID: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',     //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs).      gcopy: 1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw       live: 1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g

    
    
    DEL_OLD_RESPONSES_AGE_LIMIT: 0,    //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.

    
    EXCLUDE_FORM_COLS_FROM_DATA: ["responsePulled", "submissionEmail"],


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

};

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



    SKIP_MARKING_PULLED: true,  //Stops marking Form Responses as having been pulled into the data sheet


    SKIP_MARKING_DUPLICATES: false,


    FREEZE_CONTACT_DATA: false,


    FREEZE_FILESYS: false,






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