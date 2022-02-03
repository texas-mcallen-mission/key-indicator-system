//@ts-check


// THESE NEED TO NOT BE HARD-CODED IN THE FUTURE, USING SOMETHING LIKE A GET-FIRST-WITH-MATCHING-FILENAME FUNCTION
// const zoneTemplateSpreadsheetId = "1dKCcClYsNNneA4ty4-EtWg_hJl7BZ-v8Gl-5uPogiHs";
// const distTemplateSpreadsheetId = "1-y8VnTOqbYiW11nGVVVaC4iNjWE7jOcP2sMFpdzvqTM";
// const areaTemplateSpreadsheetId = "1TcIlXOnnUr_eXrDLN94tf-DB2A7eqeFBl0-QeNGKXAE";


// const kicDataStoreSheetName = "Data";

// const templateDataDumpSheetName = "Data";
// const outputDataDumpSheetName = "Data";
// const configPageSheetName = "config";




// var targetZone = "HARLINGEN"

/*const mainDataSheetHeader = [
  "Area Name", "Status Log", "hasContactData", "isDuplicate", "Form Timestamp",
  "KI Date", "Area Email", "NP", "SM", "BD", "BC", "RSM", "RC", "CKI",
  "Missionary 1", "Position 1", "isTrainer 1",
  "Missionary 2", "Position 2", "isTrainer2",
  "Missionary 3", "Position 3", "isTrainer3",
  "District Leader", "ZL1", "ZL2", "ZL3",
  "STL1 (Unimplemented)", "STL2 (Unimplemented)", "STL3 (Unimplemented)", "STLT1 (Unimplemented)", "STLT2 (Unimplemented)", "STLT3 (Unimplemented)",
  "AP1", "AP2", "AP3",
  "District", "Zone", "unitString", "hasMultipleUnits", "languageString", "isSeniorCouple", "isSisterArea",
  "hasVehicle", "vehicleMiles", "vinLast8", "aptAddress", "formNotes",
  "Self-referrals", "Street contacting", "Ward activities or events", "Referrals from recent converts", "Part-member families", "Referrals from other members", "Referrals from people being taught", "Referrals from other non-members", "Facebook (mission page)", "Facebook (personal finding)"
]*/







function createTemplates_(filesystemObject, templateID) {
    // creates per-zone templates, moves them into the correct folders, and then
    // returns a modified filesystemObject for working with later on down the line.
    // if the template already exists, it leaves it alone and moves along.
    let filesystemObjectCopy = filesystemObject;
    // Logger.log([[[[[[[filesystemObjectCopy]]]]]]])
    let templateFile = DriveApp.getFileById(templateID);

    for (let i = 0; i < filesystemObjectCopy.name.length; i++) {
        if (filesystemObjectCopy.docID[i] == "Doc Id" || filesystemObjectCopy.docID[i] == "DOC ID" || filesystemObjectCopy.docID[i] == "") {

            // if(functionGUBED == true){Logger.log([i,filesystemObjectCopy.parentFolderID[i],filesystemObjectCopy.folderID[i]])}
            let targetFolder = filesystemObjectCopy.folderID[i];
            // if(functionGUBED == true){Logger.log(filesystemObjectCopy.folderID[i])}
            let folderObject = DriveApp.getFolderById(targetFolder);
            let fileName = filesystemObjectCopy.name[i];
            let templateCopy = templateFile.makeCopy(fileName, folderObject);
            filesystemObjectCopy.docID[i] = templateCopy.getId();
        }
    }
    return filesystemObjectCopy;
}

function modifyZoneTemplates_(filesystemObject, referenceDataSheet) {

    // this function is responsible for modifying the templates and putting up-to-date, sorted data into them.
    // currently not implemented, but *REALLLLLY* IMPORTANT
    // Logger.log(filesysObject)
    Logger.log("initializing data");
    let currentDate = new Date();
    // step 1: load data from reference sheet
    let kicData = referenceDataSheet.getDataRange().getValues();
    let kicHeader = kicData[0];
    kicData.shift();
    let zoneColumnPosition = kicHeader.indexOf("Zone");
    Logger.log("pre-Split");
    let isDuplicateColumnPosition = kicHeader.indexOf("isDuplicate");
    let splitDataByZone = splitDataByTagEliminateDupes_(kicData, zoneColumnPosition, isDuplicateColumnPosition);
    Logger.log("post-Split");
    // let zoneNameCell = "B3"
    // let scopeCell = "C3"
    let scopeString = "Zone";
    // let lastUpdatedRange = "C4"

    let configPushData = [["zone_name", scopeString], ["last update: ", currentDate]];

    // TO DO:  CHANGE THE DATA PARSING TO HAPPEN ONLY ONCE, AND MAKE AN ARRAY PER ZONE.
    // this should in theory make this the number of zones (or districts, or areas) * 100% FASTER
    // which is basically a necessity at this point.

    for (let i = 0; i < filesystemObject.name.length; i++) {
        let zoneName = filesystemObject.name[i];
        configPushData[0][0] = zoneName;
        Logger.log("beginning report for tag");
        let templateSpreadsheetObject = SpreadsheetApp.openById(filesystemObject.docID[i]);
        let targetDataSheet = getSheetOrSetUpFromOtherSource(outputDataDumpSheetName, kicHeader, templateSpreadsheetObject);
        let configPage = getSheetOrSetUpFromOtherSource(configPageSheetName, ["", ""], templateSpreadsheetObject);
        Logger.log("Sheets loaded");
        // @ts-ignore
        let zoneData = splitDataByZone.data[zoneName];




        Logger.log("zoneData Loaded");
        sendDataToDisplayV3_(kicHeader, zoneData, targetDataSheet);
        Logger.log("Data Sent To Display");
        let configDataRange = configPage.getRange("B3:C4").setValues(configPushData);
        Logger.log("config page Sent");
        // SpreadsheetApp.flush()
        Logger.log("flushed!");

    }

    // SpreadsheetApp.flush()
}
function modifyTemplates_(filesystemObject, referenceDataSheet, scope) {

    // this function is responsible for modifying the templates and putting up-to-date, sorted data into them.
    // currently not implemented, but *REALLLLLY* IMPORTANT
    // Logger.log(filesysObject)
    Logger.log("initializing data");
    let currentDate = new Date();
    // step 1: load data from reference sheet
    let kicData = referenceDataSheet.getDataRange().getValues();
    let kicHeader = kicData[0];
    // Logger.log(["HEADEEEER",kicHeader])
    kicData.shift();
    let columnPosition = -1;
    let scopeString = "";
    switch (scope) {
        case reportLevel.area:
            scopeString = "Area";
            columnPosition = 0;
            break;
        case reportLevel.dist:
            scopeString = "District";
            columnPosition = kicHeader.indexOf("District");
            break;
        case reportLevel.zone:
            scopeString = "Zone";
            columnPosition = kicHeader.indexOf("Zone");
            break;
    }
    Logger.log("pre-Split");
    let isDuplicateColumnPosition = kicHeader.indexOf("isDuplicate");
    let splitDataByTag = splitDataByTag_(kicData, columnPosition, isDuplicateColumnPosition);
    // Logger.log(["TAGARRAY",splitDataByTag.tagArray])
    Logger.log("post-Split");
    // let zoneNameCell = "B3"
    // let scopeCell = "C3"

    // let lastUpdatedRange = "C4"

    let configPushData = [["_name", scopeString], ["last update: ", currentDate]];

    // TO DO:  CHANGE THE DATA PARSING TO HAPPEN ONLY ONCE, AND MAKE AN ARRAY PER ZONE.
    // this should in theory make this the number of zones (or districts, or areas) * 100% FASTER
    // which is basically a necessity at this point.

    for (let i = 0; i < filesystemObject.name.length; i++) {
        let tagName = filesystemObject.name[i];
        configPushData[0][0] = tagName;
        Logger.log("beginning report for tag");
        let templateSpreadsheetObject = SpreadsheetApp.openById(filesystemObject.docID[i]);
        let targetDataSheet = getReportFromOtherSource(outputDataDumpSheetName, templateSpreadsheetObject);
        let configPage = getReportFromOtherSource(configPageSheetName, templateSpreadsheetObject);
        Logger.log("Sheets loaded");
        // @ts-ignore
        let tagData = splitDataByTag.data[tagName];

        // Logger.log(tagData)


        Logger.log("zoneData Loaded");
        sendReportToDisplayV3_(kicHeader, tagData, targetDataSheet);
        Logger.log("Data Sent To Display");
        let configDataRange = configPage.getRange("B3:C4").setValues(configPushData);
        Logger.log("config page Sent");
        SpreadsheetApp.flush();
        Logger.log("flushed!");

    }

    SpreadsheetApp.flush();
}


let HOTFIX_HEADERS = ['Folder Name String', 'Parent Folder ID', 'Zone Folder ID', 'Sheet Report ID', '2nd Report ID (unimp)'];


function updateZoneReports() {
    // return ""
    // Logger.log(zoneDataSheetName)
    let allSheetData = constructSheetData();

    let zoneSheetData = allSheetData.zoneFilesys;


    let storedZoneDataSheet = zoneSheetData.sheet;

    let storedZoneData = getSheetDataWithHeader_(storedZoneDataSheet); // was 'zoneDataSheetName'
    // Logger.log(storedZoneData)

    let filesysObject = splitToDataStruct(storedZoneData.data);


    Logger.log("making modifiedFilesysObject");
    // Logger.log(filesysObject)
    let modifiedFilesysObject = createTemplates_(filesysObject, zoneTemplateSpreadsheetId);
    // Logger.log(modifiedFilesysObject)

    let filesysData = [];
    for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
        filesysData.push([modifiedFilesysObject.name[i], modifiedFilesysObject.parentFolderID[i], modifiedFilesysObject.folderID[i], modifiedFilesysObject.docID[i]]);
    }
    // Logger.log(zoneDataHeaders)

    sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, storedZoneDataSheet);

    let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportLevel.zone);




}


// function test(){
//   Logger.log(zoneDataSheetName)
// }

function updateAreaReports() {
    // return ""
    // Logger.log(areaDataSheetName)
    let allSheetData = constructSheetData();

    let areaSheetData = allSheetData.areaFilesys;

    let storedAreaDataSheet = areaSheetData.sheet; /*getSheetOrSetUp_(areaDataSheetName, areaDataHeaders)*/
    let storedAreaData = getSheetDataWithHeader_(storedAreaDataSheet); // was 'zoneDataSheetName'
    // Logger.log(storedZoneData)

    let filesysObject = splitToDataStruct(storedAreaData.data);


    Logger.log("making modifiedFilesysObject");
    // Logger.log(filesysObject)
    let modifiedFilesysObject = createTemplates_(filesysObject, areaTemplateSpreadsheetId);
    // Logger.log(modifiedFilesysObject)

    let filesysData = [];
    for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
        filesysData.push([modifiedFilesysObject.name[i], modifiedFilesysObject.parentFolderID[i], modifiedFilesysObject.folderID[i], modifiedFilesysObject.docID[i]]);
    }

    sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, storedAreaDataSheet);

    let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportLevel.area);




}

function updateDistrictReports() {
    // return ""
    // Logger.log(areaDataSheetName)

    let allSheetData = constructSheetData();

    let distSheetData = allSheetData.distFilesys;

    let storedDistrictDataSheet = distSheetData.sheet;
    let storedDistrictData = getSheetDataWithHeader_(storedDistrictDataSheet); // was 'zoneDataSheetName'
    // Logger.log(storedZoneData)

    let filesysObject = splitToDataStruct(storedDistrictData.data);


    Logger.log("making modifiedFilesysObject");
    // Logger.log(filesysObject)
    let modifiedFilesysObject = createTemplates_(filesysObject, distTemplateSpreadsheetId);
    // Logger.log(modifiedFilesysObject)

    let filesysData = [];
    for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
        filesysData.push([modifiedFilesysObject.name[i], modifiedFilesysObject.parentFolderID[i], modifiedFilesysObject.folderID[i], modifiedFilesysObject.docID[i]]);
    }

    sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, storedDistrictDataSheet);

    let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportLevel.dist);




}

// 259 hope of israel
// 86 How Great Thou Art
// 108 the lord is my shepherd











