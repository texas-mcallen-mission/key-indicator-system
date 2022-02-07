//@ts-check
let HOTFIX_HEADERS = ["Folder Name String", "Parent Folder ID", "Zone Folder ID", "Sheet Report ID", "2nd Report ID (unimp)"];

function createTemplates_(filesystemObject, templateID) {
    // creates per-zone templates, moves them into the correct folders, and then
    // returns a modified filesystemObject for working with later on down the line.
    // if the template already exists, it leaves it alone and moves along.
    let filesystemObjectCopy = filesystemObject;
    let templateFile = DriveApp.getFileById(templateID);

    for (let i = 0; i < filesystemObjectCopy.name.length; i++) {
        if (filesystemObjectCopy.docID[i] == "Doc Id" || filesystemObjectCopy.docID[i] == "DOC ID" || filesystemObjectCopy.docID[i] == "") {
            let targetFolder = filesystemObjectCopy.folderID[i];
            let folderObject = DriveApp.getFolderById(targetFolder);
            let fileName = filesystemObjectCopy.name[i];
            let templateCopy = templateFile.makeCopy(fileName, folderObject);
            filesystemObjectCopy.docID[i] = templateCopy.getId();
        }
    }
    return filesystemObjectCopy;
}

function testGetScopedKIData(): void {
    let allSheetData = constructSheetData()
    let kiDataObj = allSheetData.data

    let data = kiDataObj.getData()
    Logger.log(data)
    getScopedKIData(kiDataObj)
}


function flog(input: any) {
    // This function 
    Logger.log([/*input.getAttribute("name"),*/ typeof input/*, "Length: " + input.length]*/)
    Logger.log(input)
}

// TODO define interface for data entry?
function getScopedKIData(sheetData): any[] {
    // the reason we're using sheetData instead of the values is so that I can easily access header positions in the same function
    // ^ this is so that I can modify which columns get displayed easily.  :)
    Logger.log(data)
    /*  WHERE YOU LEFT OFF:
        * Building function to load the data & scope it
        * figuring out how to use it properly in the reports so that I don't have a bunch of weird errors
        * basically learning TypeScript the wrong way by messing about.

    */
    flog(data)
    let data = data.getData()
    let values = data.getValues()
    let header = data.getHeader()
    flog(data);
    flog(values);
    flog(header)




}

function testUpdateSingleReport() {
    let allSheetData = constructSheetData()
    let reportScope = reportLevel.zone
    updateSingleReport(reportScope, allSheetData)
    Logger.log("Report generation completed for " + reportScope)
}



function updateSingleReport(reportScope: String, allSheetData): void {

    let sheetData
    switch (reportScope) {
        case reportLevel.area:
            sheetData = allSheetData.areaFilesys
            return
        case reportLevel.dist:
            sheetData = allSheetData.distFilesys
            return
        case reportLevel.zone:
            sheetData = allSheetData.zoneFilesys
    }
    // let areaSheetData = allSheetData.areaFilesys;

    let storedDataSheet = sheetData.sheet;
    let filesysObject = splitToDataStruct(sheetData.data);

    Logger.log("making modifiedFilesysObject");
    let modifiedFilesysObject = createTemplates_(filesysObject, areaTemplateSpreadsheetId);

    let filesysData = [];
    for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
        //@ts-ignore
        filesysData.push([modifiedFilesysObject.name[i], modifiedFilesysObject.parentFolderID[i], modifiedFilesysObject.folderID[i], modifiedFilesysObject.docID[i]])
    }

    sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, sheetData);

    let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportScope);
}

function modifyTemplates_(filesystemObject, referenceData: any[], scope: String) {
    // this function is responsible for modifying the templates and putting up-to-date, sorted data into them.
    // currently not implemented, but *REALLLLLY* IMPORTANT
    // Logger.log(filesysObject)
    Logger.log("initializing data");
    let currentDate = new Date();
    // step 1: load data from reference sheet
    // let kicData = referenceDataSheet.getDataRange().getValues();
    // let kicHeader = kicData[0];
    // Logger.log(["HEADEEEER",kicHeader])
    // kicData.shift();
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
    let splitDataByTag = splitDataByTagEliminateDupes_(kicData, columnPosition, isDuplicateColumnPosition);
    Logger.log("post-Split");

    Logger.log(typeof splitDataByTag.data);
    for (let splitTag in splitDataByTag) {
        Logger.log(splitTag);
        for (let data in splitDataByTag[splitTag]) {
            Logger.log(typeof data);
            Logger.log(splitDataByTag[splitTag][data]);
        }
    }
    Logger.log(splitDataByTag["tagArray"])
    /*
     let zoneNameCell = "B3"
     let scopeCell = "C3"
     let lastUpdatedRange = "C4"
    */
    let configPushData = [
        ["_name", scopeString],
        ["last update: ", currentDate],
    ];

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
        Logger.log([tagName, tagData])
        sendReportToDisplayV3_(kicHeader, tagData, targetDataSheet);
        Logger.log("Data Sent To Display");
        let configDataRange = configPage.getRange("B3:C4").setValues(configPushData);
        Logger.log("config page Sent");
        SpreadsheetApp.flush();
        Logger.log("flushed!");
    }

    SpreadsheetApp.flush();
}



// function test(){
//   Logger.log(zoneDataSheetName)
// }







// 259 hope of israel
// 86 How Great Thou Art
// 108 the lord is my shepherd


function updateZoneReports() {
    // // return ""
    // // Logger.log(zoneDataSheetName)
    // let allSheetData = constructSheetData();

    // let zoneSheetData = allSheetData.zoneFilesys;

    // let storedZoneDataSheet = zoneSheetData.getSheet();
    // let newData = zoneSheetData.getValues();

    // Logger.log(newData);

    // let filesysObject = splitToDataStruct(newData);

    // Logger.log("making modifiedFilesysObject");
    // let modifiedFilesysObject = createTemplates_(
    //     filesysObject,
    //     zoneTemplateSpreadsheetId
    // );

    // let filesysData = [];
    // for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
    //     filesysData.push([
    //         modifiedFilesysObject.name[i],
    //         modifiedFilesysObject.parentFolderID[i],
    //         modifiedFilesysObject.folderID[i],
    //         modifiedFilesysObject.docID[i],
    //     ]);
    // }
    // // Logger.log(zoneDataHeaders)

    // sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, storedZoneDataSheet);

    // let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    // modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportLevel.zone);
}

function updateDistrictReports() {
    // // return ""
    // // Logger.log(areaDataSheetName)

    // let allSheetData = constructSheetData();

    // let distSheetData = allSheetData.distFilesys;

    // let storedDistrictDataSheet = distSheetData.sheet;
    // let storedDistrictData = getSheetDataWithHeader_(storedDistrictDataSheet); // was 'zoneDataSheetName'
    // // Logger.log(storedZoneData)

    // let filesysObject = splitToDataStruct(storedDistrictData.data);

    // Logger.log("making modifiedFilesysObject");
    // // Logger.log(filesysObject)
    // let modifiedFilesysObject = createTemplates_(
    //     filesysObject,
    //     distTemplateSpreadsheetId
    // );
    // // Logger.log(modifiedFilesysObject)

    // let filesysData = [];
    // for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
    //     filesysData.push([
    //         modifiedFilesysObject.name[i],
    //         modifiedFilesysObject.parentFolderID[i],
    //         modifiedFilesysObject.folderID[i],
    //         modifiedFilesysObject.docID[i],
    //     ]);
    // }

    // sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, storedDistrictDataSheet);

    // let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    // modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportLevel.dist);
}

function updateAreaReports() {
    // // return ""
    // // Logger.log(areaDataSheetName)
    // let allSheetData = constructSheetData();

    // let areaSheetData = allSheetData.areaFilesys;

    // let storedAreaDataSheet =
    //     areaSheetData.sheet; /*getSheetOrSetUp_(areaDataSheetName, areaDataHeaders)*/
    // let storedAreaData = getSheetDataWithHeader_(storedAreaDataSheet); // was 'zoneDataSheetName'
    // // Logger.log(storedZoneData)

    // let filesysObject = splitToDataStruct(storedAreaData.data);

    // Logger.log("making modifiedFilesysObject");
    // // Logger.log(filesysObject)
    // let modifiedFilesysObject = createTemplates_(
    //     filesysObject,
    //     areaTemplateSpreadsheetId
    // );
    // // Logger.log(modifiedFilesysObject)

    // let filesysData = [];
    // for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
    //     filesysData.push([
    //         modifiedFilesysObject.name[i],
    //         modifiedFilesysObject.parentFolderID[i],
    //         modifiedFilesysObject.folderID[i],
    //         modifiedFilesysObject.docID[i],
    //     ]);
    // }

    // sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, storedAreaDataSheet);

    // let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

    // modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportLevel.area);
}