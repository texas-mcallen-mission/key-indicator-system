/*
        KIC-config
        General and debugging configuration parameters
*/



let CONFIG =
{
  //General config settings here
}



//Debug config parameters

let DBCONFIG =
{


  //WARNING: If set to true, loading the filesystem will take a VERY long time!
  UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD: false,

  //      WARNING: Work in progress! If you get a "... is not a function" error it's probably because pulling from the cache didn't work properly
  //Store certain pieces of data in the cache, so they don't have to be recalculated as frequently
  CACHE_AREA_IDS: false,   //[unimplemented] Cache the list of areaIDs
  CACHE_SHEET_DATA: false,  //Cache allSheetData, the object returned by constructSheetData()
  CACHE_ORG_DATA: false,   //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()


  //Enable more detailed logger statements
  LOG_IMPORT_CONTACTS: false,
  LOG_MERGE_DATA: false,
  LOG_RESPONSE_PULLED: false,
  LOG_DUPLICATES: false,
  LOG_FILE_SHARING: false,


  //Disable updating spreadsheets in certain ways
  //Direct calls to the associated functions will simply return null. If set to true, these override all relevant trigger permissions.
  SKIP_MARKING_PULLED: false,  //Stops marking Form Responses as having been pulled into the data sheet
  SKIP_MARKING_DUPLICATES: false,
  FREEZE_CONTACT_DATA: true,
  FREEZE_FILESYS: false,


  //Allow triggers to run
  //These are overridden if the associated functions are disabled, ex. if FREEZE_FILESYS is true.
  ALLOW_INSTALLABLE_TRIGGER_ON_OPEN: true,
  ALLOW_INSTALLABLE_TRIGGER_ON_EDIT: false,  //Not currently used
  ALLOW_TIMEBASED_TRIGGER_UPDATE_DATA_SHEET: true,
  ALLOW_TIMEBASED_TRIGGER_UPDATE_FS: true,
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



}

