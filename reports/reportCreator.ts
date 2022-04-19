//@ts-check


/* This version of reportCreator is very monolithic- it's only really designed to update *all* the reports in a particular level.
    I'm not quite sure how to re-architect this into something that's capable of being split up.
        I think the first step is probably to go and attempt minifying the sheetData class for a sub-project.8
*/

function debugTesting() {
    let dLog:dataLogger = new dataLogger("reportCreator Debug Testing",triggerTypes.DEBUG)
    Logger.log("Running updateFS")
    dLog.startFunction("updateFS")
    buildFSV4()
    dLog.endFunction("updateFS")
    dLog.startFunction("updateZoneReports")
    updateZoneReports();
    dLog.endFunction("updateZoneReports")
    dLog.end()
}


function updateAllReports(dLog:dataLogger = new dataLogger("updateAllReports",triggerTypes.manual,true)) {
    // THIS IS A STANDALONE FUNCTION

    console.warn("hey, running all three at the same time is probably not a good idea, it'll more than likely go past the execution time limits")
    let allSheetData = constructSheetData();
    console.time("Total reportUpdate runtime");
    updateAnyLevelReport_(allSheetData, CONFIG.fileSystem.reportLevel.zone,dLog);
    updateAnyLevelReport_(allSheetData, CONFIG.fileSystem.reportLevel.dist,dLog);
    updateAnyLevelReport_(allSheetData, CONFIG.fileSystem.reportLevel.area,dLog);
    console.timeEnd("Total reportUpdate runtime");


    if (dLog.isInline == true) { dLog.end(); } // if this is the parent function, end logging
}

function updateZoneReports(dLog:dataLogger = new dataLogger("updateZoneReports",triggerTypes.manual,true)) {
    let allSheetData = constructSheetData();
    let reportScope = CONFIG.fileSystem.reportLevel.zone;
    dLog.startFunction("updateAnyLevelReport")
    try {
        updateAnyLevelReport_(allSheetData, reportScope,dLog);
    } catch (error) {
        dLog.addFailure("updateAnyLevelReport", error)
    }
    dLog.endFunction("updateAnyLevelReport")

    if (dLog.isInline == true) { dLog.end(); } // if this is the parent function, end logging
}

function updateDistrictReports(dLog:dataLogger = new dataLogger("updateDistrictReports",triggerTypes.manual,true)) {
    dLog.startFunction("constructSheetData")
    let allSheetData = constructSheetData();
    dLog.endFunction("constructSheetData")
    let reportScope = CONFIG.fileSystem.reportLevel.dist;
    Logger.log("running updateAnyLevelReport_")
    dLog.startFunction("updateAnyLevelReport")
    let test = updateAnyLevelReport_(allSheetData, reportScope,dLog);
    dLog.endFunction("updateAnyLevelReport")
    Logger.log("report updating should be done");
    
    if (dLog.isInline == true) { dLog.end(); } // if this is the parent function, end logging
}

function updateAreaReports(dLog: dataLogger = new dataLogger("updateDistrictReports", triggerTypes.manual, true)) {
    
    let allSheetData = constructSheetData();
    let reportScope = CONFIG.fileSystem.reportLevel.area;
    dLog.startFunction("updateAnyLevelReport_")
    let test:boolean = false
    try {
        test = updateAnyLevelReport_(allSheetData, reportScope,dLog);

    } catch (error) {
        dLog.addFailure("updateAnyLevelReport_", error)
    }
    dLog.endFunction("updateAnyLevelReport_");

    if (dLog.isInline == true) { dLog.end(); }// if this is the parent function, end logging
}

function updateAnyLevelReport_(allSheetData, scope,dLog:dataLogger) {
    let reportUpdateTimer = "Total time updating reports for scope " + scope + ":";
    console.time(reportUpdateTimer);
    let reportScope = scope;
    let filesysSheetData;
    let templateID:string = ""
    switch (scope) {
        case CONFIG.fileSystem.reportLevel.area:
            filesysSheetData = allSheetData.areaFilesys;
            templateID = CONFIG.reportCreator.docIDs.areaTemplate;
            break;
        case CONFIG.fileSystem.reportLevel.dist:
            filesysSheetData = allSheetData.distFilesys;
            templateID = CONFIG.reportCreator.docIDs.distTemplate;
            break;
        case CONFIG.fileSystem.reportLevel.zone:
            filesysSheetData = allSheetData.zoneFilesys;
            templateID = CONFIG.reportCreator.docIDs.zoneTemplate;
            break
        // default:
        //     throw "Invalid scope: '" + scope + "'";
    }
    let kiDataObj = allSheetData.data;
    let kiDataHeaders = kiDataObj.getHeaders();
    let dataKeys = kiDataObj.getKeys();
    let data = removeDupesAndPII_(kiDataObj);
    // I don't think I actually need contactData for this sub-system.  :)
    // ONCE DRIVEHANDLER has been rewritten to 
    dLog.startFunction("fullUpdateSingleLevel")
    try {
        fullUpdateSingleLevel(filesysSheetData, data, templateID, reportScope, kiDataHeaders, dataKeys,dLog);
    } catch (error) {
        dLog.addFailure("fullUpdateSingleLevel", error)
    }
    dLog.endFunction("fullUpdateSingleLevel")
    let postRun = new Date;
    console.timeEnd(reportUpdateTimer);
    return true
}

function fullUpdateSingleLevel(filesysObj, data: {}, reportTemplateID: string, scope: string,headers:string[],keyArray:string[],dLog:dataLogger):void {

    let storedSheet = filesysObj.getSheet();





    /*
    header names:  [Folder Name String, Parent Folder ID, Zone Folder ID, Sheet Report ID, 2nd Report ID (unimp)]
    key names:     [folderName, parentFolder, folder, sheetID1, sheetID2]
    For this section, we'll just use the internal key names for simplicity.  To switch back, you'll need to use something like the following:
        let keyPosition = header.indexOf(<"HEADER NAME STRING">)
        let keyName = keys[keyPosition]
        let entryValue = entry[keyName]
    */
    let updatedFSData = createTemplatesV2_(filesysObj, reportTemplateID);
    Logger.log("filesystem should be up to date!");
    /*
    let keyName = "";
    switch (scope) {
        case CONFIG.fileSystem.reportLevel.area:
            keyName = "areaName";
            break;
        case CONFIG.fileSystem.reportLevel.dist:
            keyName = "district";
            break;
        case CONFIG.fileSystem.reportLevel.zone:
            keyName = "zone";
            break;
        default:
            throw "Invalid scope: '" + scope + "'";
    }
    let splitByKey = splitDataByKey_(data, keyName);
    // let header = data.getHeaders()
    dLog.startFunction("modifyTemplatesV2_async_")
    try {
        let test = modifyTemplatesV2_async_(updatedFSData, splitByKey, scope, keyName, headers, keyArray,dLog);

    } catch (error) {
        dLog.addFailure("modifyTemplatesV2_async_",error);
    }
    dLog.endFunction("modifyTemplatesV2_async_")    
    */
    // time to send the data to the reports

}
function modifyTemplatesV2_(fsData, referenceData, scope: string, keyName: string, header: string[], keyArray: string[]) {
    // TODO No longer referenced.  (Mind you, that's because it got switched to an async version)
    let currentDate = new Date();

    // TODO NEED TO PASS IN KEY ARRAY SO THAT I CAN CONVERT THE DATA INTO AN ARRAY FOR FINAL OUTPUT
    
    for (let entry of fsData) {
        let targetID = entry.sheetID1;
        let targetWorksheet = SpreadsheetApp.openById(targetID);
        let outData = turnDataIntoArray(referenceData[entry.folderBaseName], header, keyArray); // TODO- replace folderName with name once driveHandler has been rewritten
        // Logger.log(outData)
        let dataSheetName = CONFIG.reportCreator.kicDataStoreSheetName; // TODO THIS NEEDS TO GET MOVED TO REFERENCE THE NEW CONFIG FILE
        let configSheetName = CONFIG.reportCreator.configPageSheetName; // TODO THIS NEEDS TO GET MOVED TO REFERENCE THE NEW CONFIG FILE
        let configPushData = [[entry.folderBaseName, scope], ["Last Updated:", currentDate]]; // this winds up on the config page // TODO- replace folderName with name once driveHandler has been rewritten
        let configPosition = "B3:C4"; // TODO THIS MIGHT ALSO WANT TO MOVE.
        
        let targetDataSheet = getReportFromOtherSource(dataSheetName, targetWorksheet);
        let targetConfSheet = getReportFromOtherSource(configSheetName, targetWorksheet);
        // WHERE YOU LEFT OFF:
        // TODO: FINISH PORTING OVER CODE FROM modifyTEmplatesOLDTODEPRECATE_()
        // TODO: NEED TO DO ALL THE CONFIG PAGE WORK AND DUMP EVERYTHING INTO THE DATASHEET
        // After that, I *should* be done with it
        // all that's left after that is running the tests on the whole thing and then we'll be done with this rewrite finally!
        sendReportToDisplayV3_(header, outData, targetDataSheet);
        targetConfSheet.getRange(configPosition).setValues(configPushData);
        // leaving out spreadsheetapp.flush because I'm not convinced that it actually helps anything at all
        
    }

}

function createTemplatesV2_(filesysObj, templateID: string): {} {
    // TODO - this could probably get a minor speed improvement by switching to async execution.
    // This function creates copies of the template, and gives them names and moves them to the right spot.
    // returns a modified data object.
    let fsDataCopy = filesysObj.getData();
    let templateFile = DriveApp.getFileById(templateID);
    // console.log("testing")
    for (let entry of fsDataCopy) {
        // Logger.log(entry);

        let sheet1 = entry.sheetID1;
        if (sheet1 == "Doc Id" || sheet1 == "DOC ID" || sheet1 == "" || isFileAccessible_(entry.sheetID1) == false) {
            let parentFolderObject = DriveApp.getFolderById(entry.folder);
            let fileName = entry.folderBaseName; // TODO- replace folderName with name once driveHandler has been rewritten
            let templateCopy = templateFile.makeCopy(fileName, parentFolderObject);
            // templateCopy.getId()
            entry.sheetID1 = templateCopy.getId();
            console.log("created template for ", entry.folderBaseName, " with ID ", entry.sheetID1); // TODO- replace folderName with name once driveHandler has been rewritten
        }
        // Logger.log(entry);

    }
    Logger.log("sending Data To Display with setData()");
    // Logger.log(fsDataCopy)
    let displayTimer = "Time to send data to display:";
    console.time(displayTimer);
    filesysObj.setData(fsDataCopy);
    console.timeEnd(displayTimer);
    return fsDataCopy;
}
function testDataToArray():void {
    let allSheetData = constructSheetData();
    let kiDataObj = allSheetData.data;

    let data = removeDupesAndPII_(kiDataObj);
    let header = kiDataObj.getHeaders();
    let keys = kiDataObj.getKeys();
    let splitData = splitDataByKey_(data, "zone");

    // test to see if splitData would work well or not
    for (let zone in splitData) {
        // console.log(zone)
        let distData = splitDataByKey_(splitData[zone], "district");
        for (let district in distData) {
            let areaData = splitDataByKey_(distData[district], "areaName");
            for (let area in areaData) {
                console.log("Zone: ", zone, " District: ", district, " Area: ", area);
            }
        }
    }
    let dataArray = turnDataIntoArray(data, header, keys);
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
function splitDataByKey_(data, key:string) {
    // This function basically splits any SheetData.getData() into groupings based on unique values of a specified key.
    let allKeyValues = [];
    let dataByKey = {};

    for (let entry of data) {
        let keyValue = entry[key];
        //former ignore
        if (!allKeyValues.includes(keyValue)) {
            //former ignore
            allKeyValues.push(keyValue);
            dataByKey[keyValue] = [];
        }
        dataByKey[keyValue].push(entry);

    }
    return dataByKey;
}



function timerFunction_(pre: Date, post: Date) {
    return post.getTime() - pre.getTime();
}
function turnDataIntoArray(data, header:any[], keys:any[]):any[][] {
    // returns an array that stays in the same format as the input header.
    // for this to work:
    // * the input key array & header array have to be in the same order and match up
    // * the keys sent to this function have to be any subset of the ones sent in the data array
    // once fully tested, this function will be super powerful :)
    let preDate = new Date;
    let output = [];
    let count = 0;
    // let durations = 0
    for (let entry of data) {
        let line = [];
        // let preDate2 = new Date
        for (let headee of header) {
            let keyPosition = header.indexOf(headee);
            let keyName = keys[keyPosition];
            let entryValue = entry[keyName];
            // console.log(entryValue)
            // former ignore
            line.push(entryValue);
        }
        count += 1;
        //former ignore
        output.push(line);
    }
    let postDate = new Date;
    let duration = timerFunction_(preDate, postDate);
    console.log("Single data array duration:", duration, "ms - Average entry time: ", duration / count, " ms");
    return output;
}
function removeDupesAndPII_(ki_sheetData):any[] {
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
    let removedEntries = {}
    for (let entry of data) {
        // console.log("Pre-Modifications",entry)
        for (let property of listToHide) {
            entry[property] = "";
        }
        for (let exclusions of valuesToExclude) {
            //@ts-ignore
            removedEntries[exclusions[0]] = 0
            // loops through values we want to exclude and checks to see if they match or not. 
            //@ts-ignore
            if (entry[exclusions[0]] == exclusions[1]) {
                //@ts-ignore
                removedEntries[exclusions[0]]++
            }
        }
        // console.log("Post-Mods",entry)
    }

    for (let removalKey in removedEntries) {
        console.log("Removed ",removedEntries[removalKey]," entries that matched rule for ",removalKey)
    }

    let postDate = new Date;
    let durationInMillis = postDate.getTime() - preDate.getTime();
    let output = "Scoping Data- Time Started: "
    
    console.log("Scoping Data- Time Started: ", preDate, "Time Finished:", postDate, "Duration: ", durationInMillis, "ms");
    return data;
}



