//@ts-check
/*
        KIC-config
        General and debugging configuration parameters
*/


//Stub declarations of outdated code to stop typescript from yelling. @Harrier_pigeon should fix these
// MOVED TO fs-config.js
// let outputDataDumpSheetName = "";
// let configPageSheetName = "";
// let kicDataStoreSheetName = "";
// let areaDataSheetName = "";
// let districtDataSheetName = "";
// let zoneDataSheetName = "";
// let areaDataHeaders = [""];
// let districtDataHeaders = [""];
// let zoneDataHeaders = [""];
// THESE ARE BOTH DEFINED IN COMMONLIB
// function splitDataByTagEliminateDupes(x, y, z) { }
// function splitDataByTag_(x, y, z) { }






let CONFIG =
{
    //General config settings here

    //      WARNING: Caching is a work in progress! If you get a "... is not a function" error, it's probably because pulling allSheetData from the cache didn't work properly - just disable caching in the config to fix.

    //Store certain pieces of data in the cache, so they don't have to be recalculated as frequently
    CACHE_SHEET_DATA: false,  //Cache allSheetData, the object returned by constructSheetData()
    CACHE_ORG_DATA: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

    MARK_DUPLICATES_MAX_ROW_TO_CHECK: 500,  //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.


    //WARNING: If set to true, loading the filesystem will take a VERY long time!
    UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD: false,

    FORCE_AREA_ID_RELOAD_ON_UPDATE_DATA_SHEET: false,
    AREA_NAME_QUESTION_TITLE: 'Area Name',

    //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs).
    //gcopy: 1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw
    //live: 1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g
    KIC_FORM_ID: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',

    //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.
    DEL_OLD_RESPONSES_AGE_LIMIT: 0,

    //Allow triggers to run
    //These are overridden if the associated functions are disabled, ex. if DBCONFIG.FREEZE_FILESYS is true.
    ALLOW_INSTALLABLE_TRIGGER_ON_OPEN: true,
    ALLOW_INSTALLABLE_TRIGGER_ON_EDIT: false,  //Not currently used
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_FS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_FORM: true,
    ALLOW_TIMEBASED_TRIGGER_IMPORT_CONTACTS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_AREA_REPORTS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_DIST_REPORTS: true,
    ALLOW_TIMEBASED_TRIGGER_UPDATE_ZONE_REPORTS: true,
    ALLOW_MENU_TRIGGER_UPDATE_DATA_SHEET: true,
    ALLOW_MENU_TRIGGER_UPDATE_AREA_REPORTS: true,
    ALLOW_MENU_TRIGGER_UPDATE_DIST_REPORTS: true,
    ALLOW_MENU_TRIGGER_UPDATE_ZONE_REPORTS: true,
    ALLOW_MENU_TRIGGER_IMPORT_CONTACTS: true,
    ALLOW_MENU_TRIGGER_MARK_DUPLICATES: true,
    ALLOW_MENU_TRIGGER_LOAD_AREA_IDS: true,

};



//Debug config parameters

let DBCONFIG =
{




    //Enable more detailed logger statements
    LOG_IMPORT_CONTACTS: false,
    LOG_MERGE_DATA: false,
    LOG_RESPONSE_PULLED: false,
    LOG_DUPLICATES: false,
    LOG_FILE_SHARING: false,


    //Disable updating spreadsheets in certain ways
    //Direct calls to the associated functions will simply return null. If set to true, these override all relevant trigger permissions.
    SKIP_MARKING_PULLED: true,  //Stops marking Form Responses as having been pulled into the data sheet
    SKIP_MARKING_DUPLICATES: false,
    FREEZE_CONTACT_DATA: false,
    FREEZE_FILESYS: false,






};

