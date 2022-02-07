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

function testSplitData(): void {
    let allSheetData = constructSheetData()
    let kiDataObj = allSheetData.data

    // let data = kiDataObj.getData()
    // Logger.log(data)
    let data = getScopedKIData(kiDataObj)
    let splitData = splitDataByTagV2_(data, "Area Name")
    Logger.log(splitData)
}


function flog(input: any) {
    // This function 
    Logger.log(typeof input)
    Logger.log(input)
}

// TODO define interface for data entry?
// THIS WILL HAPPEN IN THE PROPER RESTRUCTURE REWRITE THING THAT I'LL DO EVENTUALLY, BUT NOT WHEN I NEED TO GET SOMETHING DONE THE SAME NIGHT
// interface dataEntry {
//     areaId: string;
//     date: Date;
//     isDuplicate: boolean;
//     data: any[];

// }

// const testDataEntry: dataEntry = {
//     areaId: "AAAAA",
//     date: new Date,
//     data: ["test"]
// }

// define data entry class thingy and constructor for it so that I can have an easy - to - use and consistent way of editing stuff ?

function splitDataByTagV2_(data, tag:String) {
    let listOfTags = []
    let dataByTag = {}
    for (let entry of data) {
        let tagValue = entry[tag]
        if (listOfTags.includes(entry[tag]) == false){
            listOfTags.push(tagValue)
            dataByTag[tagValue] = []
            // TODO - where you left off:  This little bit right here is giving me some trouble- 
            // TODO - if I can figure out how to add to a programatticaly defined array inside of an object I'll be super golden tho.
            dataByTag[tagValue].push(entry)
        } else {
            dataByTag[tagValue].push(entry)
        }


    }
    console.log("split into  ", listOfTags.length, " groups")
    console.log(dataByTag)
    return dataByTag
}



function getScopedKIData(ki_sheetData): any[] {

    // the reason we're using sheetData instead of the values is so that I can easily access header positions in the same function
    // ^ this is so that I can modify which columns get displayed easily.  :)
    // Logger.log(data)
    /*  WHERE YOU LEFT OFF:
        * Building function to load the data & scope it
        * figuring out how to use it properly in the reports so that I don't have a bunch of weird errors
        * basically learning TypeScript the wrong way by messing about.

    */
    flog(ki_sheetData);
    let data = ki_sheetData.getData();
    let values = ki_sheetData.getValues();
    let header = ki_sheetData.getHeaders();
    flog(data);
    flog(values);
    flog(header);

    let listToHide = ["aptAddress"];
    let valuesToExclude = [["isDuplicate", true], ["Questions, comments, concerns?", "TEST DATA"]];
    // Iterate through data and set all values of columns in listToHide to null
    // then iterate through the list of values to exclude and remove those as well.
    // -- actually maybe we'll do that one first because then the second one has a smaller data set?
    // first:  check to see if 
    let preDate = new Date;
    for (let entry of data) {
        // console.log("Pre-Modifications",entry)
        for (let property of listToHide) {
            entry[property] = "";
        }
        for (let exclusions of valuesToExclude) {
            //@ts-ignore
            // loops through values we want to exclude and checks to see if they match or not. 
            if (entry[exclusions[0]] == exclusions[1]) {
                
                console.log("removed entry for", entry["areaName"], "that matched rule for", exclusions[0]);
            }
        }
        // console.log("Post-Mods",entry)
    }
    let postDate = new Date;
    let durationInMillis = postDate.getTime() - preDate.getTime();
    console.log("Scoping Data- Time Started: ", preDate, "Time Finished:", postDate, "Duration: ", durationInMillis, "ms");
    return data;
}

function testUpdateSingleReport() {
    let allSheetData = constructSheetData()
    let reportScope = reportLevel.zone
    updateSingleReportLevel(reportScope, allSheetData)
    Logger.log("Report generation completed for " + reportScope)
}



function updateSingleReportLevel(reportScope: String, allSheetData): void {

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

function modifyTemplates_(filesystemObject,  referenceData: any[], scope: String) {
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
    let splitDataByTag = splitDataByTagEliminateDupes_(referenceData, columnPosition, isDuplicateColumnPosition);
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