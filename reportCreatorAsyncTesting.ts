async function sendReportToDisplayV4_async_(header, finalData, sheetObj){
    // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
    // returns a boolean to let you know whether or not it worked- if it doesn't work, then you can retry later on somehow // TODO: This is unimplemented
    let worked = true
    try {
        sheetObj.clearContents();
        // sheetObj.appendRow(header);
        // if (CONFIG.LOG_OLD_sendReportToDisplayV3_) { Logger.log(finalData.length); }
        Logger.log("adding Header");
        sheetObj.getRange(2, 1, 1, header.length).setValues([header]);
        Logger.log("added header, adding data");
        if (finalData == null) {
            Logger.log("no data, skipping");
            return;
        }
        let prepredate = new Date;
        sheetObj.getRange(3, 1, finalData.length, finalData[0].length).setValues(finalData);
        Logger.log("data added, sorting");
        let preDate = new Date;
        sheetObj.getRange(3, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }]);
        let postDate = new Date;
        console.log("Adding Data: ", preDate.getMilliseconds() - prepredate.getMilliseconds(), "ms, Sorting Data: ", postDate.getMilliseconds() - preDate.getMilliseconds(), " ms");
        // going to run this one more time without a flush to see what happens when this changes.
        // SpreadsheetApp.flush()
        // Logger.log("data added")
    } catch (error) {
        worked = false
        console.log("error occured in sendReportToDisplay: ",error)
    }
    return worked

}

async function modifyTemplatesV2_async_(fsData, referenceData, scope: String,keyName:String,header:String[],keyArray:String[]) {
    let currentDate = new Date();
    
    // TODO NEED TO PASS IN KEY ARRAY SO THAT I CAN CONVERT THE DATA INTO AN ARRAY FOR FINAL OUTPUT
    let complete = false
    for (let entry of fsData) {
        let targetID = entry.sheetID1
        let targetWorksheet = SpreadsheetApp.openById(targetID)
        let outData = turnDataIntoArray(referenceData[entry.folderName],header,keyArray) // TODO- replace folderName with name once driveHandler has been rewritten
        // Logger.log(outData)
        const dataSheetName = outputDataDumpSheetName;    // TODO THIS NEEDS TO GET MOVED TO REFERENCE THE NEW CONFIG FILE

        const configSheetName = configPageSheetName;     // TODO THIS NEEDS TO GET MOVED TO REFERENCE THE NEW CONFIG FILE
        let configPushData = [[entry.folderName,scope],["Last Updated:",currentDate]] // this winds up on the config page // TODO- replace folderName with name once driveHandler has been rewritten
        const configPosition = "B3:C4"; // TODO THIS MIGHT ALSO WANT TO MOVE.
        
        let targetDataSheet = getReportFromOtherSource(dataSheetName, targetWorksheet); // NEEDS TO BE ASYNC BECAUSE IT TAKES A NON-TRIVIAL AMOUNT OF TIME
        let targetConfSheet = getReportFromOtherSource(configSheetName,targetWorksheet)
        // WHERE YOU LEFT OFF:
        // TODO: FINISH PORTING OVER CODE FROM modifyTEmplatesOLDTODEPRECATE_()
        // TODO: NEED TO DO ALL THE CONFIG PAGE WORK AND DUMP EVERYTHING INTO THE DATASHEET
        // After that, I *should* be done with it
        // all that's left after that is running the tests on the whole thing and then we'll be done with this rewrite finally!

        let didItWork = await sendReportToDisplayV4_async_(header, outData, targetDataSheet)
        console.log(didItWork,entry.folderName) // TODO- replace folderName with name once DriveHandler has been rewritten
        targetConfSheet.getRange(configPosition).setValues(configPushData)
        // leaving out spreadsheetapp.flush because I'm not convinced that it actually helps anything at all
    }
    let newDate = new Date() 
    console.log("Async modify completed for " ,scope," in ", newDate.getMilliseconds()-currentDate.getMilliseconds(),"milliseconds")
    complete = true
    return complete
}

async function getReportFromOtherSource_async_(sheetName, targetSpreadsheet) {
  let ss; //Get currently Active sheet
  ss = targetSpreadsheet;

  // Checks to see if the sheet exists or not.
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // sheet.appendRow(headerData);// Creating Header
  }
  return sheet;
}