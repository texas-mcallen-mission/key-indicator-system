//@ts-check
/*
KIC-config
General and debugging configuration parameters
*/


// TO BE DEPRECATED
const templateDataDumpSheetName = "Data"; //No more refs
const outputDataDumpSheetName = "Data"; //TODO Still has refs
const configPageSheetName = "config"; //TODO Still has refs
// let outputDataDumpSheetName = "";
// let configPageSheetName = "";
let kicDataStoreSheetName = "Data"; //TODO Still has refs
let areaDataSheetName = "Data"; //No more refs
let districtDataSheetName = "Data"; //No more refs
let zoneDataSheetName = "Data"; //No more refs
let areaDataHeaders = [""]; //No more refs
let districtDataHeaders = [""]; //No more refs
let zoneDataHeaders = [""]; //No more refs
const functionGUBED = true; //TODO No more refs - remove?




let CONFIG =
{

    // docIds

    docIds_kicFormId: '1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw',     //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs every Sunday).    gcopy:'1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw'    live:'1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g'

    zoneTemplateSpreadsheetId: "1dKCcClYsNNneA4ty4-EtWg_hJl7BZ-v8Gl-5uPogiHs", //TODO No more refs - remove?
    docIds_zoneTemplate: "1dKCcClYsNNneA4ty4-EtWg_hJl7BZ-v8Gl-5uPogiHs",

    distTemplateSpreadsheetId: "1-y8VnTOqbYiW11nGVVVaC4iNjWE7jOcP2sMFpdzvqTM", //TODO No more refs - remove?
    docIds_distTemplate: "1-y8VnTOqbYiW11nGVVVaC4iNjWE7jOcP2sMFpdzvqTM",

    areaTemplateSpreadsheetId: "1TcIlXOnnUr_eXrDLN94tf-DB2A7eqeFBl0-QeNGKXAE", //TODO No more refs - remove?
    docIds_areaTemplate: "1TcIlXOnnUr_eXrDLN94tf-DB2A7eqeFBl0-QeNGKXAE",



    // general

    general_areaNameQuestionTitle: 'Area Name',

    general_deleteOldResponsesAgeLimit: 0,    //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.



    // dataFlow

    dataFlow_skipMarkingPulled: true,  //Stops marking Form Responses as having been pulled into the data sheet

    SKIP_MARKING_DUPLICATES: false, //TODO Re-implement?
    dataFlow_skipMarkingDuplicates: false,

    dataFlow_freezeContactData: false,

    dataFlow_formColumnsToExcludeFromDataSheet: ["responsePulled", "submissionEmail"],

    dataFlow_forceAreaIdReloadOnUpdateDataSheet: false,

    dataFlow_areaId_cacheExpirationLimit: 1800,   //Maximum time in seconds before the cache gets reset

    dataFlow_areaId_cacheKey: "butterflies and clouds", //ID to use when storing areaIDs in the cache

    dataFlow_allSheetData_cacheEnabled: true,  //Cache allSheetData, the object returned by constructSheetData()

    dataFlow_allSheetData_cacheExpirationLimit: 1800,   //Maximum time in seconds before the cache gets reset

    dataFlow_allSheetData_cacheKey: "puppies and flowers", //ID to use when storing allSheetData in the cache

    dataFlow_missionOrgData_cacheEnabled: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

    dataFlow_maxRowToMarkDuplicates: 500,  //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.



    // fileSystem

    reportLevel: { zone: "Zone", dist: "District", area: "Area", },
    fileSystem_reportLevel: { zone: "Zone", dist: "District", area: "Area", }, //Theoretically, since there's no difference between this anywhere you should be able to change this to be whatever gibberish you want as long as they're unique.  These strings also included in folder naming if INCLUDE_SCOPE_IN_FOLDER_NAME is set to true, so don't make them too pithy.

    fileSystem_updateSheetProtectionsOnLoad: false, //WARNING: If set to true, loading the filesystem will take a VERY long time!

    INCLUDE_SCOPE_IN_FOLDER_NAME: true,
    fileSystem_includeScopeInFolderName: true,

    fileSystem_freezeFilesys: false, //TODO Re-implement? Currently unimplemented



    // logging

    LOG_FILESYS: false,
    fileSystem_log_update: false,
    fileSystem_log_fileShare: false,

    LOG_OLD_sendReportToDisplayV3_: false,
    fileSystem_log_sendReportToDisplayV3_: false,

    dataFlow_log_importContacts: false,
    dataFlow_log_dataMerge: false,
    dataFlow_log_responsePulled: false,
    dataFlow_log_duplicates: false,




    // triggers

    triggers_installable_onOpen: true,
    triggers_installable_onEdit: false,  //Not currently used

    triggers_timeBased_updateForm: true,
    triggers_timeBased_updateDataSheet: true,
    triggers_timeBased_importContacts: true,
    triggers_timeBased_updateFileSystem: true,
    triggers_timeBased_updateAreaReports: true,
    triggers_timeBased_updateDistReports: true,
    triggers_timeBased_updateZoneReports: true,
    triggers_timeBased_shareFileSystem: false,

    triggers_menu_updateDataSheet: true,
    triggers_menu_updateFileSystem: false,
    triggers_menu_updateAreaReports: true,
    triggers_menu_updateDistReports: true,
    triggers_menu_updateZoneReports: true,
    triggers_menu_importContacts: true,
    triggers_menu_markDuplicates: true,
    triggers_menu_loadAreaIds: true,

};
