//@ts-check
let HOTFIX_HEADERS = ["Folder Name String", "Parent Folder ID", "Zone Folder ID", "Sheet Report ID", "2nd Report ID (unimp)"];

// TODO: PHASE THESE OUT!!!
const zoneTemplateSpreadsheetId = "1dKCcClYsNNneA4ty4-EtWg_hJl7BZ-v8Gl-5uPogiHs";
const distTemplateSpreadsheetId = "1-y8VnTOqbYiW11nGVVVaC4iNjWE7jOcP2sMFpdzvqTM";
const areaTemplateSpreadsheetId = "1TcIlXOnnUr_eXrDLN94tf-DB2A7eqeFBl0-QeNGKXAE";


function updateAllReports() {
    updateZoneReports()
    updateDistrictReports()
    
    updateAreaReports()
}

function updateZoneReports() {
    let allSheetData = constructSheetData()

    let reportScope = reportLevel.zone

    updateAnyLevelReport_(allSheetData, reportScope)
}

function updateDistrictReports() {
    let allSheetData = constructSheetData()

    let reportScope = reportLevel.dist

    updateAnyLevelReport_(allSheetData, reportScope)
}

function updateAreaReports() {
    let allSheetData = constructSheetData()

    let reportScope = reportLevel.area

    updateAnyLevelReport_(allSheetData, reportScope)
}

function updateAnyLevelReport_(allSheetData, scope) {
    let preRun = new Date
    let allSheetData = constructSheetData();
    
    let reportScope = scope
    let filesysSheetData
    switch (reportScope) {
        case reportLevel.area:
            filesysSheetData = allSheetData.areaFilesys
            break
        case reportLevel.dist:
            filesysSheetData = allSheetData.distFilesys
            break
        case reportLevel.zone:
            filesysSheetData = allSheetData.zoneFilesys
            break
    }

    let kiDataObj = allSheetData.data
    let kiDataHeaders = kiDataObj.getHeaders()
    let dataKeys = kiDataObj.getKeys()
    let data = removeDupesAndPII_(kiDataObj)

    // I don't think I actually need contactData for this sub-system.  :)
    // ONCE DRIVEHANDLER has been rewritten to 
    fullUpdateSingleLevel(filesysSheetData,data,zoneTemplateSpreadsheetId,reportScope,kiDataHeaders,dataKeys)
    let postRun = new Date
    console.log("SCOPE:,",scope,",Updating reports took, ", postRun.getMilliseconds()-preRun.getMilliseconds()," ms")
}


function fullUpdateSingleLevel(filesysObj: {}, data: {}, reportTemplateID: String, scope: String,headers:String[],keyArray:String[]):void {

    let storedSheet = filesysObj.getSheet()

    Logger.log("adding reports to FS!")


    
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

    
    let keyName = ""
    switch (scope) {
        case reportLevel.area:
            keyName = "areaName"
            break
        case reportLevel.dist:
            keyName = "district"
            break
        case reportLevel.zone:
            keyName = "zone"
            break
    }
                
    let splitByKey = splitDataByKey_(data, keyName)
    // let header = data.getHeaders()
    modifyTemplatesV2_(updatedFSData, splitByKey, scope,keyName,headers,keyArray)
                
                // time to send the data to the reports

}

function modifyTemplatesV2_(fsData, referenceData: {}[][], scope: String,keyName:String,header:String[],keyArray:String[]) {
    let currentDate = new Date();
    
    // TODO NEED TO PASS IN KEY ARRAY SO THAT I CAN CONVERT THE DATA INTO AN ARRAY FOR FINAL OUTPUT

    for (let entry of fsData) {
        let targetID = entry.sheetID1
        let targetWorksheet = SpreadsheetApp.openById(targetID)
        let outData = turnDataIntoArray(referenceData[entry.folderName],header,keyArray) // TODO- replace folderName with name once driveHandler has been rewritten
        // Logger.log(outData)
        let dataSheetName = outputDataDumpSheetName;    // TODO THIS NEEDS TO GET MOVED TO REFERENCE THE NEW CONFIG FILE

        let configSheetName = configPageSheetName;     // TODO THIS NEEDS TO GET MOVED TO REFERENCE THE NEW CONFIG FILE
        let configPushData = [[entry.folderName,scope],["Last Updated:",currentDate]] // this winds up on the config page // TODO- replace folderName with name once driveHandler has been rewritten
        let configPosition = "B3:C4"; // TODO THIS MIGHT ALSO WANT TO MOVE.
        
        let targetDataSheet = getReportFromOtherSource(dataSheetName, targetWorksheet);
        let targetConfSheet = getReportFromOtherSource(configSheetName,targetWorksheet)
        // WHERE YOU LEFT OFF:
        // TODO: FINISH PORTING OVER CODE FROM modifyTEmplatesOLDTODEPRECATE_()
        // TODO: NEED TO DO ALL THE CONFIG PAGE WORK AND DUMP EVERYTHING INTO THE DATASHEET
        // After that, I *should* be done with it
        // all that's left after that is running the tests on the whole thing and then we'll be done with this rewrite finally!

        sendReportToDisplayV3_(header, outData, targetDataSheet)
        
        targetConfSheet.getRange(configPosition).setValues(configPushData)
        // leaving out spreadsheetapp.flush because I'm not convinced that it actually helps anything at all
    }

}


function createTemplatesV2_(filesysObj, templateID: String): {} {
    // This function creates copies of the template, and gives them names and moves them to the right spot.
    // returns a modified data object.
    let fsDataCopy = filesysObj.getData()
    let templateFile = DriveApp.getFileById(templateID)
    // console.log("testing")
    for (let entry of fsDataCopy) {
        // Logger.log(entry);
        
        let sheet1 = entry.sheetID1;
        if (sheet1 == "Doc Id" || sheet1 == "DOC ID" || sheet1 == "" || isFileAccessible_(entry.sheetID1) == false) {
            let parentFolderObject = DriveApp.getFolderById(entry.folder);
            let fileName = entry.folderName; // TODO- replace folderName with name once driveHandler has been rewritten
            let templateCopy = templateFile.makeCopy(fileName, parentFolderObject);
            // templateCopy.getId()
            entry.sheetID1 = templateCopy.getId() 
            console.log("created template for ",entry.folderName," with ID ",entry.sheetID1) // TODO- replace folderName with name once driveHandler has been rewritten
        }
        // Logger.log(entry);
        
    }
    Logger.log("sending Data To Display with setData()")

    // Logger.log(fsDataCopy)
    let preDate = new Date
    filesysObj.setData(fsDataCopy)
    let postDate = new Date
    console.log("Sent Data To Display! - Duration: ",postDate.getMilliseconds()- preDate.getMilliseconds()," ms")
    
    return fsDataCopy
}









function testDataToArray(): void {
    let allSheetData = constructSheetData();
    let kiDataObj = allSheetData.data;

    let data = removeDupesAndPII_(kiDataObj);
    let header = kiDataObj.getHeaders()
    let keys = kiDataObj.getKeys()
    
    let splitData = splitDataByKey_(data, "zone");
    
    // test to see if splitData would work well or not
    for (let zone in splitData) {
        // console.log(zone)
        let distData = splitDataByKey_(splitData[zone], "district")
        for (let district in distData) {
            let areaData = splitDataByKey_(distData[district], "areaName")
            for (let area in areaData) {
                console.log("Zone: ", zone, " District: ", district, " Area: ", area)
                
            }
        }
    }
    let dataArray = turnDataIntoArray(data, header, keys)
    // Logger.log(dataArray);
}



// TODO define interface for data entry?
// THIS WILL HAPPEN IN THE PROPER RESTRUCTURE REWRITE THING THAT I'LL DO EVENTUALLY, BUT NOT WHEN I NEED TO GET SOMETHING DONE THE SAME NIGHT
// interface dataEntry {
//     areaId: string;
//     date: Date;
//     isDuplicate: boolean;
//     data: any[];

// }


function splitDataByKey_(data, tag: String) {
    // This function basically splits any SheetData.getData() into groupings based on unique values of a specified key.
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




