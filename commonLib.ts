//@ts-check
// Code snippets either common to several modules, or frequently reused in side projects.

//@ts-ignore
var _ = lodash.load();


function getOrCreateReportFolder() {
    // still used in driveHandlerV3

    // looks for a folder named "Reports" in the folder this document is in or creates it, and returns a folderID for it.
    // ideally this function would let me have a reports folder that the filesystem generates inside of, but not sure what I need to do to get that working.
    // this is where I left off on 12/28/2021
    // completed on 12/29/2021

    let folderName = "Reports";
    let spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    let spreadsheetFile = DriveApp.getFileById(spreadsheetId);
    let parentFolder = spreadsheetFile.getParents();
    // let oneLinerParentFolderID = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next().getId()
    // Logger.log(oneLinerParentFolderID)
    // let parentFolderID = parentFolder.getId()
    // let parentFolderMatches = parentFolder.next()
    let nextFolder = parentFolder.next();
    let parentFolderID = nextFolder.getId();
    let matchingChildFolders = nextFolder.getFoldersByName(folderName);
    let reportsFolderID = "";
    if (matchingChildFolders.hasNext() == true) {
        reportsFolderID = matchingChildFolders.next().getId();
        Logger.log("reports folder found");
    } else {
        reportsFolderID = createNewFolderV4_(parentFolderID, folderName);
        Logger.log("reports folder not found, creating");
    }
    return reportsFolderID;
}

// var MERGED_OBJECT = _.merge(OBJ1, OBJ2,OBJ3)


function sendDataToDisplayV3_(header, finalData, sheet, args = {sortColumn:1,ascending:true}) {
    // TODO: *maybe* merge sendDataToDisplay & sendReportToDisplay into one function with a final pre-defined object argument for extra settings, ie start row & column, whether or not to clear out the whole sheet first, etc. 
    let preDate = new Date
    // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
    sheet.clearContents();
    sheet.appendRow(header);
    Logger.log(finalData.length);
    if (CONFIG.commonLib.log_display_info) { Logger.log("adding Header"); }
    Logger.log(header);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    if (CONFIG.commonLib.log_display_info) { Logger.log("added header, adding data"); }
    if (finalData.length == 0 || typeof finalData == null) {
        Logger.log("no data, skipping");
        return;
    } else {
        sheet.getRange(2, 1, finalData.length, finalData[0].length).setValues(finalData);
        if (CONFIG.commonLib.log_display_info) { Logger.log("Data added, sorting"); }
        sheet.getRange(2, 1, finalData.length, header.length).sort([{ column: args.sortColumn, ascending: args.ascending }]);
        // Logger.log("data added")
    }
    let postDate = new Date
    if (CONFIG.commonLib.log_time_taken) {
        console.log("Total duration of report display: ", postDate.getTime() - preDate.getTime());
    }
}

function sendReportToDisplayV3_(header, finalData, sheet) {
    let preDate = new Date
    // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
    sheet.clearContents();
    // sheet.appendRow(header);
    // if (CONFIG.LOG_OLD_sendReportToDisplayV3_) { Logger.log(finalData.length); }
    if (CONFIG.commonLib.log_display_info) { Logger.log("adding Header"); }
    sheet.getRange(2, 1, 1, header.length).setValues([header]);
    if (CONFIG.commonLib.log_display_info) {Logger.log("added header, adding data");}
        if (finalData == null) {
            if (CONFIG.commonLib.log_display_info_extended) { Logger.log("no data, skipping"); }
        return;
    }
    let prepredate = new Date
    sheet.getRange(3, 1, finalData.length, finalData[0].length).setValues(finalData);
    if (CONFIG.commonLib.log_display_info) {
        Logger.log("data added, sorting");
    }
    sheet.getRange(3, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }]);
    let postDate = new Date
    if (CONFIG.commonLib.log_time_taken) {
        console.log("Total duration of report display: ", postDate.getTime() - preDate.getTime());
    }
    // going to run this one more time without a flush to see what happens when this changes.
    // SpreadsheetApp.flush()
    // Logger.log("data added")
}

function getReportOrSetUpFromOtherSource_(sheetName, targetSpreadsheet, headerData = []) {
    let ss = targetSpreadsheet;
    let outHeader = [];
    
    let data =[]
    // Checks to see if the sheet exists or not.
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headerData);
        outHeader = headerData; // Creating Header
    } else {
        let outData = sheet.getDataRange().getValues();
        outHeader = outData[0];
        if (outData.length > 1) {
            outHeader = outData.shift()
            data = outData
        }
    }

    

    return {
        sheet: sheet,
        headerData: outHeader,
        data:data
    };
}

/*
 * @param {any} folderID
 */
function isFolderAccessible_(folderID:string) {
    // This just try catches to see if there's a folder, because for some reason this is the most effective way to do it...
    let output = true;
    let folder;
    let gone = false;
    try {
        folder = DriveApp.getFolderById(folderID);
        // test = DriveApp.getFolderById(folderID).getName();

        folder.getDescription();
    } catch (e) {
        output = false;
        gone = true;
        if (CONFIG.commonLib.log_access_info) { Logger.log("Folder deleted with ID " + folderID); }
    }
    if (gone == false) {
        
        if (folder.isTrashed() == true) {
            if (CONFIG.commonLib.log_access_info) { Logger.log("folder exists but in the bin"); }
            output = false;
        }
    }

    return output;
}

function isFileAccessible_(fileID: string) {
    // This just try catches to see if there's a file, because for some reason this is the most effective way to do it...   let output = true;
    let file;
    let output = true;
    let gone = false;
    try {
        file = DriveApp.getFileById(fileID);
        // test = DriveApp.getFolderById(folderID).getName();

        file.getDescription();
    } catch (e) {
        output = false;
        gone = true;
        if (CONFIG.commonLib.log_access_info) { Logger.log("File deleted with ID " + fileID); }

    }
    if (gone == false) {
        if (file.isTrashed() == true) {
            if (CONFIG.commonLib.log_access_info) { Logger.log("file exists but in the bin"); }
            output = false;
        }
    }

    return output;
}

function splitDataByTagEliminateDupes_(referenceData, tagColumn, dupeColumn) {
    // TODO No longer referenced.
    //currently just for zones, but we'll change that once I know this thing actually works.
    let checkPosition = tagColumn; // for zones
    let tagList = getUniqueFromPosition_(referenceData, checkPosition);
    // Logger.log(tagList)
    let splitData = {};//[tagList.length]
    // set up splitData
    for (let tag of tagList) {
        splitData[tag] = [];
    }
    for (let data of referenceData) {
        let refTag = data[checkPosition];
        // Logger.log(refTag)
        if (tagList.includes(refTag) == true && (data[dupeColumn] == false || dupeColumn == null /*typeof dupeColumn == "undefined" (ONLY IF THAT DOESN'T WORK)*/)) {
            let currentTag = tagList[tagList.indexOf(refTag)];
            // Logger.log(currentTag)
            // Logger.log(tagList.indexOf(refTag))
            splitData[currentTag].push(data);
        }
    }
    return { data: splitData, tagArray: tagList };
}

function splitDataByTag_(referenceData, tagColumn) {
    // TODO No longer referenced.
    //currently just for zones, but we'll change that once I know this thing actually works.
    let checkPosition = tagColumn; // for zones
    let tagList = getUniqueFromPosition_(referenceData, checkPosition);
    // Logger.log(tagList)
    let splitData = {};//[tagList.length]
    // set up splitData
    for (let tag of tagList) {
        splitData[tag] = [];
    }
    for (let data of referenceData) {
        let refTag = data[checkPosition];
        // Logger.log(refTag)
        if (tagList.includes(refTag) == true) {
            let currentTag = tagList[tagList.indexOf(refTag)];
            splitData[currentTag].push(data);
        }
    }
    return { data: splitData, tagArray: tagList };
}
function getUniqueFromPosition_(gimmeDatArray, position) {
    // this does the same thing as above, but keeps me from needing to iterate through everything twice.
    let uniqueDataFromPosition = [];
    for (let i = 0; i < gimmeDatArray.length; i++) {
        if (uniqueDataFromPosition.includes(gimmeDatArray[i][position]) == false) {
            uniqueDataFromPosition.push(gimmeDatArray[i][position]); // if it's a match, then we do the thing, otherwise no.
        }
    }
    return uniqueDataFromPosition;
}