//@ts-check
// Code snippets either common to several modules, or frequently reused in side projects.

//@ts-ignore
const _ = lodash.load();



function getOrCreateReportFolder() {
    // still used in driveHandlerV3

    // looks for a folder named "Reports" in the folder this document is in or creates it, and returns a folderID for it.
    // ideally this function would let me have a reports folder that the filesystem generates inside of, but not sure what I need to do to get that working.
    // this is where I left off on 12/28/2021
    // completed on 12/29/2021

    const folderName = "Reports";
    const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    const spreadsheetFile = DriveApp.getFileById(spreadsheetId);
    const parentFolder = spreadsheetFile.getParents();
    // let oneLinerParentFolderID = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next().getId()
    // console.log(oneLinerParentFolderID)
    // let parentFolderID = parentFolder.getId()
    // let parentFolderMatches = parentFolder.next()
    const nextFolder = parentFolder.next();
    const parentFolderID = nextFolder.getId();
    const matchingChildFolders = nextFolder.getFoldersByName(folderName);
    let reportsFolderID = "";
    if (matchingChildFolders.hasNext() == true) {
        reportsFolderID = matchingChildFolders.next().getId();
        console.log("reports folder found");
    } else {
        reportsFolderID = createNewFolderV4_(parentFolderID, folderName);
        console.log("reports folder not found, creating");
    }
    return reportsFolderID;
}

// var MERGED_OBJECT = _.merge(OBJ1, OBJ2,OBJ3)


function sendDataToDisplayV3_(header, finalData, sheet, args = {sortColumn:1,ascending:true}) {
    // TODO: *maybe* merge sendDataToDisplay & sendReportToDisplay into one function with a final pre-defined object argument for extra settings, ie start row & column, whether or not to clear out the whole sheet first, etc. 
    const preDate = new Date
    // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
    sheet.clearContents();
    sheet.appendRow(header);
    console.log(finalData.length);
    if (CONFIG.commonLib.log_display_info) { console.log("adding Header"); }
    console.log(header);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    if (CONFIG.commonLib.log_display_info) { console.log("added header, adding data"); }
    if (finalData.length == 0 || typeof finalData == null) {
        console.log("no data, skipping");
        return;
    } else {
        sheet.getRange(2, 1, finalData.length, finalData[0].length).setValues(finalData);
        if (CONFIG.commonLib.log_display_info) { console.log("Data added, sorting"); }
        sheet.getRange(2, 1, finalData.length, header.length).sort([{ column: args.sortColumn, ascending: args.ascending }]);
        // console.log("data added")
    }
    const postDate = new Date
    if (CONFIG.commonLib.log_time_taken) {
        console.log("Total duration of report display: ", postDate.getTime() - preDate.getTime());
    }
}

function sendReportToDisplayV3_(header, finalData, sheet) {
    const preDate = new Date
    // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
    sheet.clearContents();
    // sheet.appendRow(header);
    // if (CONFIG.LOG_OLD_sendReportToDisplayV3_) { console.log(finalData.length); }
    if (CONFIG.commonLib.log_display_info) { console.log("adding Header"); }
    sheet.getRange(2, 1, 1, header.length).setValues([header]);
    if (CONFIG.commonLib.log_display_info) {console.log("added header, adding data");}
        if (finalData == null) {
            if (CONFIG.commonLib.log_display_info_extended) { console.log("no data, skipping"); }
        return;
    }
    const prepredate = new Date
    sheet.getRange(3, 1, finalData.length, finalData[0].length).setValues(finalData);
    if (CONFIG.commonLib.log_display_info) {
        console.log("data added, sorting");
    }
    sheet.getRange(3, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }]);
    const postDate = new Date
    if (CONFIG.commonLib.log_time_taken) {
        console.log("Total duration of report display: ", postDate.getTime() - preDate.getTime());
    }
    // going to run this one more time without a flush to see what happens when this changes.
    // SpreadsheetApp.flush()
    // console.log("data added")
}

function getReportOrSetUpFromOtherSource_(sheetName, targetSpreadsheet, headerData = []) {
    const ss = targetSpreadsheet;
    let outHeader = [];
    
    let data =[]
    // Checks to see if the sheet exists or not.
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headerData);
        outHeader = headerData; // Creating Header
    } else {
        const outData = sheet.getDataRange().getValues();
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

const accessibleFolderCache = {
    good: [],
    bad: []
}

/**
 * returns whether or not a folder is accessible (IE exists and is not in the garbage can)
 *
 * @param {string} folderID
 * @return {*}  {boolean}
 */
function isFolderAccessible_(folderID:string):boolean {
    // This just try catches to see if there's a folder, because for some reason this is the most effective way to do it...
    let output = true;
    let folder;
    let gone = false;
    if (accessibleFolderCache.good.includes(folderID)) return true;
    if (accessibleFolderCache.bad.includes(folderID)) return false;
    try {
        folder = DriveApp.getFolderById(folderID);
        // test = DriveApp.getFolderById(folderID).getName();

        folder.getDescription();
    } catch (e) {
        output = false;
        gone = true;
        if (CONFIG.commonLib.log_access_info) { console.log("Folder deleted with ID " + folderID); }
    }
    if (gone == false) {
        
        if (folder.isTrashed() == true) {
            if (CONFIG.commonLib.log_access_info) { console.log("folder exists but in the bin"); }
            output = false;
        }
    }
    if (output == true) {
        accessibleFolderCache.good.push(folderID);
    } else {
        accessibleFolderCache.bad.push(folderID);
    }

    return output;
}

const accessibleFileCache = {
    good: [],
    bad:[]
}
/**
 * returns whether or not a file is accessible (IE exists and is not in the garbage can)
 *
 * @param {string} fileID
 * @return {*}  {boolean}
 */
function isFileAccessible_(fileID: string):boolean {
    // This just try catches to see if there's a file, because for some reason this is the most effective way to do it...   let output = true;
    let file;
    let output = true;
    let gone = false;

    // added local caching- should significantly knock down on execution time for pruneFS()
    if (accessibleFileCache.good.includes(fileID)) return true;
    if (accessibleFileCache.bad.includes(fileID)) return false;
    try {
        file = DriveApp.getFileById(fileID);
        // test = DriveApp.getFolderById(folderID).getName();

        file.getDescription();
    } catch (e) {
        output = false;
        gone = true;
        if (CONFIG.commonLib.log_access_info) { console.log("File deleted with ID " + fileID); }

    }
    if (gone == false) {
        if (file.isTrashed() == true) {
            if (CONFIG.commonLib.log_access_info) { console.log("file exists but in the bin"); }
            output = false;
        }
    }

    if (output == true) {
        accessibleFileCache.good.push(fileID)
    } else {
        accessibleFileCache.bad.push(fileID)
    }

    return output;
}

function splitDataByTagEliminateDupes_(referenceData, tagColumn, dupeColumn) {
    // TODO No longer referenced.
    //currently just for zones, but we'll change that once I know this thing actually works.
    const checkPosition = tagColumn; // for zones
    const tagList = getUniqueFromPosition_(referenceData, checkPosition);
    // console.log(tagList)
    const splitData = {};//[tagList.length]
    // set up splitData
    for (const tag of tagList) {
        splitData[tag] = [];
    }
    for (const data of referenceData) {
        const refTag = data[checkPosition];
        // console.log(refTag)
        if (tagList.includes(refTag) == true && (data[dupeColumn] == false || dupeColumn == null /*typeof dupeColumn == "undefined" (ONLY IF THAT DOESN'T WORK)*/)) {
            const currentTag = tagList[tagList.indexOf(refTag)];
            // console.log(currentTag)
            // console.log(tagList.indexOf(refTag))
            splitData[currentTag].push(data);
        }
    }
    return { data: splitData, tagArray: tagList };
}

function splitDataByTag_(referenceData, tagColumn) {
    // TODO No longer referenced.
    //currently just for zones, but we'll change that once I know this thing actually works.
    const checkPosition = tagColumn; // for zones
    const tagList = getUniqueFromPosition_(referenceData, checkPosition);
    // console.log(tagList)
    const splitData = {};//[tagList.length]
    // set up splitData
    for (const tag of tagList) {
        splitData[tag] = [];
    }
    for (const data of referenceData) {
        const refTag = data[checkPosition];
        // console.log(refTag)
        if (tagList.includes(refTag) == true) {
            const currentTag = tagList[tagList.indexOf(refTag)];
            splitData[currentTag].push(data);
        }
    }
    return { data: splitData, tagArray: tagList };
}
function getUniqueFromPosition_(gimmeDatArray, position) {
    // this does the same thing as above, but keeps me from needing to iterate through everything twice.
    const uniqueDataFromPosition = [];
    for (let i = 0; i < gimmeDatArray.length; i++) {
        if (uniqueDataFromPosition.includes(gimmeDatArray[i][position]) == false) {
            uniqueDataFromPosition.push(gimmeDatArray[i][position]); // if it's a match, then we do the thing, otherwise no.
        }
    }
    return uniqueDataFromPosition;
}