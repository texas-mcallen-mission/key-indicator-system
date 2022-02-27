//@ts-check
// I'm going to compile the functions I've wound up using a lot here so that they're easier to find
// created by Bert

// CLASP PIPING TEST

function sendDataToDisplayV3_(header, finalData, sheet) {
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
        sheet.getRange(2, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }]);
        // Logger.log("data added")
    }
    let postDate = new Date
    if (CONFIG.commonLib.log_time_taken) {
        console.log("Total duration of report display: ", postDate.getMilliseconds() - preDate.getMilliseconds());
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
        console.log("Total duration of report display: ", postDate.getMilliseconds() - preDate.getMilliseconds());
    }
    // going to run this one more time without a flush to see what happens when this changes.
    // SpreadsheetApp.flush()
    // Logger.log("data added")
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
        //@ts-ignore
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
    //@ts-ignore
        if (file.isTrashed() == true) {
            if (CONFIG.commonLib.log_access_info) { Logger.log("file exists but in the bin"); }
            output = false;
        }
    }

    return output;
}

function splitDataByTagEliminateDupes_(referenceData, tagColumn, dupeColumn) {
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