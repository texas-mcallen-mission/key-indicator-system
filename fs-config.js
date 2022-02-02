//@ts-check

// This is a compilation of all config lines
// used by driveHandlerV3 & reportCreator
// accessControl is not in here, it's kind of its own animal

// THESE NEED TO NOT BE HARD-CODED IN THE FUTURE, USING SOMETHING LIKE A GET-FIRST-WITH-MATCHING-FILENAME FUNCTION
// ^ Thanks, @than2000 - I do know this, I'm just also not a full time developer
const zoneTemplateSpreadsheetId = "1dKCcClYsNNneA4ty4-EtWg_hJl7BZ-v8Gl-5uPogiHs";
const distTemplateSpreadsheetId = "1-y8VnTOqbYiW11nGVVVaC4iNjWE7jOcP2sMFpdzvqTM";
const areaTemplateSpreadsheetId = "1TcIlXOnnUr_eXrDLN94tf-DB2A7eqeFBl0-QeNGKXAE";
const functionGUBED = true

const reportLevel = {
    zone: "ZONE",
    dist: "DISTRICT",
    area: "AREA",
    /*
    theoretically, since there's no difference between this anywhere you 
    should be able to change this to be whatever gibberish you want as 
    long as they're unique.  These strings also included in folder naming if 
    INCLUDE_SCOPE_IN_FOLDER_NAME is set to true, so don't make them too pithy.
    */
};

const templateDataDumpSheetName = "Data";
const outputDataDumpSheetName = "Data";
const configPageSheetName = "config";
// let outputDataDumpSheetName = "";
// let configPageSheetName = "";
let kicDataStoreSheetName = "Data";
let areaDataSheetName = "Data";
let districtDataSheetName = "Data";
let zoneDataSheetName = "Data";
let areaDataHeaders = [""];
let districtDataHeaders = [""];
let zoneDataHeaders = [""];