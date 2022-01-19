/*
        Head.gs
        Helper functions, static variables, simple triggers
*/



//Static vars
  //let MASTER_SHEET_ID = "1P9tnkUKI2GRf--7O1rwYDF1oV8dgz2F3fa8qQGd3Jwk";
  //let FORM_ID = "1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g";
  
  // this is a temporary modification to try clearing an error
  let functionGUBED = false

  let MAX_ROWS = 300;
  let AREAS_WITHOUT_EMAILS = ["Laredo 4C",
                              "McAllen 2C",
                              "Treasure Hills B",
                              "Sullivan City",
                              "Edinburg 1A",
                              "Mission 3E",
                              "Brownsville 3B",
                              "McAllen 1B",
                              "Hidalgo E",
                              "Zapata C"];


  let CACHE_AREA_IDS = false; //[unimplemented] Store the list of areaIDs in the cache
  let CACHE_SHEET_DATA = false; //Store allSheetData in the cache (the object returned by the constructSheetData() function)
  let CACHE_ORG_DATA = false; //[unimplemented] Store missionOrgData in the cache (the object returned by getMissionOrgData() function)

  let UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD = false; //WARNING: If set to true, loading the filesystem will take a VERY long time!


  //Debugging parameters

  let DEBUG = false; //If false, all other deugging parameters are assumed to be false.

  let SKIP_MARKING_PULLED = false; //Stops marking Form Responses as having been pulled into the data sheet
  let FREEZE_CONTACT_DATA = false; //Stops importing contacts
  let STOP_DATA_UPDATE_TRIGGER = false; //Stops updateDataSheet() from triggering automatically

  let LOG_IMPORT_CONTACTS = true;
  let LOG_MERGE_DATA = false;
  let LOG_RESPONSE_PULLED = false;
  let LOG_DUPLICATES = false;
  let LOG_FILE_SHARING = false;


//End


// DRIVEHANDLER CONFIGS:
/* this changes the name of the report folder.  Because this system uses 
folder ID's, if you want to change the name of the folder and have the 
changes spread across everything that already exists, you'll either have 
to change the name of the folder itself *OR* just delete everything and 
refresh it
*/
const REPORT_FOLDER_NAME = "Reports"
/*
// this flag lets you include a string at the end of the name of the
report to make it easier to know where you are this is less important
if you don't have a zone named the same thing as a district as an area,
which is just lame anywho
*/
const INCLUDE_SCOPE_IN_FOLDER_NAME = false






function main() {
  updateDataSheet();
}










/**
 * Helper function that runs every night if static var RUN_DAILY is set to true.
 * If given a TRUE parameter, runs regardless of RUN_DAILY.
 */
function daily(runManual) {
  if (RUN_DAILY || runManual)
    updateDataSheet();
}

/**
 * Adds a string to a response row's log.
 */
function logToResponse(row, log) {
  Logger.log(`Logged to row ${row}: ${log}`);
  let prevLog = getDataSheet().getRange(row,1).getValue();
  if (prevLog != "") {
    log = prevLog + " | " + log;
  }
  getDataSheet().getRange(row,1).setValue(log);
}























