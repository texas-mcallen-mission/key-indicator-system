//@ts-check
let HOTFIX_HEADERS = ["Folder Name String", "Parent Folder ID", "Zone Folder ID", "Sheet Report ID", "2nd Report ID (unimp)"];

// TODO: PHASE THESE OUT!!!
const zoneTemplateSpreadsheetId = "1dKCcClYsNNneA4ty4-EtWg_hJl7BZ-v8Gl-5uPogiHs";
const distTemplateSpreadsheetId = "1-y8VnTOqbYiW11nGVVVaC4iNjWE7jOcP2sMFpdzvqTM";
const areaTemplateSpreadsheetId = "1TcIlXOnnUr_eXrDLN94tf-DB2A7eqeFBl0-QeNGKXAE";


function testFullUpdate() {
    let allSheetData = constructSheetData();
    
    let reportScope = reportLevel.zone
    let filesysSheetData
    switch (reportScope) {
        case reportLevel.area:
            filesysSheet = allSheetData.areaFilesys
            break
        case reportLevel.dist:
            filesysSheet = allSheetData.distFilesys
            break
        case reportLevel.zone:
            filesysSheet = allSheetData.zoneFilesys
            break
    }

    let kiDataObj = allSheetData.data
    let data = removeDupesAndPII_(kiDataObj)

    // I don't think I actually need contactData for this sub-system.  :)
    // // let contactSheetData = allSheetData.contactData
    // // let contactData = contactSheetData.getData()

    // // Logger.log(contactData.getData())
    // // Logger.log(contactData.getHeaders())
    // // Logger.log(contactData.getKeys())

    fullUpdateSingleLevel(filesysSheetData,data,zoneTemplateSpreadsheetId,reportScope)

}


function fullUpdateSingleLevel(filesysObj: {}, data: {}, reportTemplateID: String, scope: String, contactData: {}):void {
    // let allSheetData = constructSheetData();
    // let reportScope = reportLevel.zone;

    // let kiDataObj = allSheetData.data
    // let data = removeDupesAndPII_(kiDataObj);
    // updateSingleReportLevel(reportScope, allSheetData);
    // Logger.log("Report generation completed for " + reportScope);

    let filesysHeader = filesysObj.getHeaders()
    let filesysKeys = filesysObj.getKeys()
    let filesysData = filesysObj.getData()

    Logger.log(filesysHeader)
    Logger.log(filesysKeys)

    Logger.log(filesysKeys)

    let storedSheet = filesysObj.getSheet()

    Logger.log("adding reports to FS!")

    //   // console.log(entryValue)
    
    /*
    header names:  [Folder Name String, Parent Folder ID, Zone Folder ID, Sheet Report ID, 2nd Report ID (unimp)]
    key names:     [folderName, parentFolder, folder, sheetID1, sheetID2]
    For this section, we'll just use the internal key names for simplicity.  To switch back, you'll need to use something like the following:
        let keyPosition = header.indexOf(<"HEADER NAME STRING">)
        let keyName = keys[keyPosition]
        let entryValue = entry[keyName]
    */
    let updatedFSData = createTemplatesV2_(filesysObj, reportTemplateID)
    
    Logger.log("filesystem should be up to date!")


}

function createTemplatesV2_(filesysObj, templateID: String): {} {
    // This function creates copies of the template, and gives them names and moves them to the right spot.
    // returns a modified data object.
    let fsDataCopy = filesysObj.getData()
    let templateFile = DriveApp.getFileById(templateID)
    for (entry of fsDataCopy) {
        let sheet1 = entry.sheetID1;
        if (sheet1 == "Doc Id" || sheet1 == "DOC ID" || sheet1 == "" || isFileAccessible_(entry.sheetID1) == false) {
            let parentFolderObject = DriveApp.getFolderById(entry.parentFolder);
            let fileName = entry.folderName;
            let templateCopy = templateFile.makeCopy(fileName, parentFolderObject);
        }
    }
    Logger.log("sending Data To Display with setData()")
    Logger.log(fsDataCopy)
    filesysObj.setData(fsDataCopy)
    Logger.log("Sent!")
    
    return fsDataCopy
}

function modifyTemplatesV2_(fsData, referenceData: any[][], scope: String) {
    let currentDate = new Date();


}


function modifyTemplatesOLDTODEPRECATE_(filesystemObject, referenceData: any[][], scope: String) {
    // this function is responsible for modifying the templates and putting up-to-date, sorted data into them.
    // currently not implemented, but *REALLLLLY* IMPORTANT
    // Logger.log(filesysObject)
    Logger.log("initializing data");
    let currentDate = new Date();
    let scopeString = scope


    Logger.log(typeof splitDataByTag.data);
    for (let splitTag in splitDataByTag) {
        Logger.log(splitTag);
        for (let data in splitDataByTag[splitTag]) {
            Logger.log(typeof data);
            Logger.log(splitDataByTag[splitTag][data]);
        }
    }
    let configPushData = [
        ["_name", scopeString],
        ["last update: ", currentDate],
    ];

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
        Logger.log([tagName, tagData]);
        sendReportToDisplayV3_(kicHeader, tagData, targetDataSheet);
        Logger.log("Data Sent To Display");
        let configDataRange = configPage.getRange("B3:C4").setValues(configPushData);
        Logger.log("config page Sent");
        SpreadsheetApp.flush();
        Logger.log("flushed!");
    }

    SpreadsheetApp.flush();
}

// // THIS FUNCTION, AND MOST OF ITS DEPENDENTS NEED TO BE DEPRECATED
// function updateSingleReportLevel(reportScope: String, allSheetData): void {

//     let sheetData;
//     switch (reportScope) {
//         case reportLevel.area:
//             sheetData = allSheetData.areaFilesys;
//             return;
//         case reportLevel.dist:
//             sheetData = allSheetData.distFilesys;
//             return;
//         case reportLevel.zone:
//             sheetData = allSheetData.zoneFilesys;
//     }
//     // let areaSheetData = allSheetData.areaFilesys;

//     let storedDataSheet = sheetData.sheet;
//     let filesysObject = splitToDataStruct(sheetData.data);

//     // Logger.log("making modifiedFilesysObject");
//     // let modifiedFilesysObject = createTemplates_(filesysObject, areaTemplateSpreadsheetId);

//     // let filesysData = [];
//     // for (let i = 0; i < modifiedFilesysObject.name.length; i++) {
//     //     //@ts-ignore
//     //     filesysData.push([modifiedFilesysObject.name[i], modifiedFilesysObject.parentFolderID[i], modifiedFilesysObject.folderID[i], modifiedFilesysObject.docID[i]]);
//     // }

//     // sendDataToDisplayV3_(HOTFIX_HEADERS, filesysData, sheetData);

//     // let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""]);

//     modifyTemplates_(modifiedFilesysObject, kicDataSheet, reportScope);
// }







function testDataToArray(): void {
    let allSheetData = constructSheetData();
    let kiDataObj = allSheetData.data;

    // let data = kiDataObj.getData()
    // Logger.log(data)
    let data = removeDupesAndPII_(kiDataObj);
    let header = kiDataObj.getHeaders()
    let keys = kiDataObj.getKeys()
    
    let splitData = splitDataByKey_(data, "zone");
    
    // test to see if splitData would work well or not
    for (let zone in splitData) {
        console.log(zone)
        let distData = splitDataByKey_(splitData[zone], "district")
        for (let district in distData) {
            let areaData = splitDataByKey_(distData[district], "areaName")
            for (let area in areaData) {
                console.log("Zone: ", zone, " District: ", district, " Area: ", area)
                
                
            }
        }
    }
    let dataArray = turnDataIntoArray(data, header, keys)
    Logger.log(dataArray);
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

function splitDataByKey_(data, tag: String) {
    let uniqueKeys = [];
    let dataByKey = {};

    for (let entry of data) {
        let keyValue = entry[tag];
        if (!uniqueKeys.includes(keyValue)) {
            uniqueKeys.push(keyValue);
            dataByKey[keyValue] = [];
            // TODO - where you left off:  This little bit right here is giving me some trouble- 
            // TODO - if I can figure out how to add to a programatticaly defined array inside of an object I'll be super golden tho.
        }
        dataByKey[keyValue].push(entry);

    }
    // console.log("Split into  ", uniqueKeys.length, " groups");
    // console.log(dataByKey);
    return dataByKey;
}

function timerFunction_(pre: Date, post: Date) {
    return post.getMilliseconds() - pre.getMilliseconds()
}

function turnDataIntoArray(data , header: any[], keys:any[]):any[][] {
    // returns an array that stays in the same format as the input header.
    // for this to work:
    // * the input key array & header array have to be in the same order and match up
    // * the keys sent to this function have to be any subset of the ones sent in the data array
    // once fully tested, this function will be super powerful :)
    let preDate = new Date
    let output = []
    let count = 0
    // let durations = 0
    for (let entry of data) {
        let line = []
        // let preDate2 = new Date
        for (let headee of header) {
            let keyPosition = header.indexOf(headee)
            let keyName = keys[keyPosition]
            let entryValue = entry[keyName]
            // console.log(entryValue)
            line.push(entryValue)
        }
        console.log(line)
        // let postDate2 = new Date
        // durations += timerFunction_(preDate2, postDate2)
        count +=1
        output.push(line)
    }
    let postDate = new Date
    let duration = timerFunction_(preDate, postDate)
    console.log("Single data array duration:" ,duration, "ms - Average entry time: ", duration / count, " ms")
    return output
    
}

function removeDupesAndPII_(ki_sheetData): any[] {

    // the reason we're using sheetData instead of the values is so that I can easily access header positions in the same function
    // ^ this is so that I can modify which columns get displayed easily.  :)
    // Logger.log(data)
    /*  WHERE YOU LEFT OFF:
        * Building function to load the data & scope it
        * figuring out how to use it properly in the reports so that I don't have a bunch of weird errors
        * basically learning TypeScript the wrong way by messing about.

    */
    let data = ki_sheetData.getData();
    let values = ki_sheetData.getValues();
    let header = ki_sheetData.getHeaders();


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