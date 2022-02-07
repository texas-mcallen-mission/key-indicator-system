/**
  * Flags duplicate responses in the Data sheet.
  */
function markDuplicates(allSheetData) {
    console.warn("TODO: markDuplicates() v2 not yet implemented");
    markDuplicates_old(allSheetData);
}

/**
 * Flags duplicate responses in the Data sheet. Old version to be replaced.
 * @param {*} allSheetData 
 */
function markDuplicates_old(allSheetData) { //                                  TODO: Don't pull the whole sheet?
    Logger.log("Marking duplicate responses. Pulling data...");
    Logger.log("TODO: Don't pull the whole sheet?");

    let sd = allSheetData.data;
    let sheet = sd.getSheet();
    let vals = sheet.getDataRange().getValues();

    let mostRecentResponse = {};   //Previously checked responses. Uses rIDs as keys, and contains row numbers for marking and timestamps for comparison
    let duplicates = [];  //Row indices that contain duplicates
    let skippedRows = []; //Row indices that are blank

    let minRow; //Used for bounds on the edit range
    let maxRow = vals.length - 1;   //Used for bounds on the edit range

    //WARNING: this assumes header is on the top row
    if (CONFIG.dataFlow_maxRowToMarkDuplicates > -1)
        maxRow = Math.min(maxRow, CONFIG.dataFlow_maxRowToMarkDuplicates);




    let firstPass = true; //Used to make the loop run twice (in case it's not sorted by timestamp)
    console.info("TODO: make mark dupes loop run twice");

    for (let row = maxRow; row > 0; row--) {    //WARNING: this assumes header is on the top row

        /*if (row == maxRow) {
            console.time("Time to process 100 lines");
        } else if (row % 100 == 0 && row > 100) {
            console.timeEnd("Time to process 100 lines");
            console.time("Time to process 100 lines");
        } else {
            console.timeEnd("Time to process 100 lines");
        }*/

        let log = "Checking if row index " + (row + 1) + " is a duplicate...";

        //Skip empty rows
        if (vals[row][sd.getIndex('areaName')] == "") {
            log += '\nSkipping row';
            skippedRows.push(row);

            if (CONFIG.LOG_DUPLICATES) Logger.log(log);
            continue;
        }


        minRow = row; //Update topmost row

        let areaName = vals[row][sd.getIndex('areaName')];
        let areaID;
        try {
            areaID = getAreaID(allSheetData, areaName);
        } catch (e) {
            console.warn("Couldn't get areaID on line " + (row + 1) + " while marking duplicates. Area '" + areaName + "' not found");
        }


        let kiDate = vals[row][sd.getIndex('kiDate')];
        let tstamp = vals[row][sd.getIndex('formTimestamp')];

        let rID = areaID + " | " + kiDate;   //Defined such that duplicate responses should have identical response IDs

        log += "\nResponse ID: '" + rID + "'";

        if (typeof mostRecentResponse[rID] == 'undefined') { //If this is the first ocurrence, add to mostRecentResponse and skip
            mostRecentResponse[rID] = { "tstamp": tstamp, "row": row };

            log += "\nFirst ocurrence, continuing.";
            if (CONFIG.LOG_DUPLICATES) Logger.log(log);
            continue;
        }

        let prev = mostRecentResponse[rID];  //Previous ocurrence
        log += "\nFound previous ocurrence on row index ${prev.row}, comparing...";

        //Handle comparing historical records (which don't have timestamps)
        if (typeof prev.tstamp == "string") {

            if (typeof tstamp == "string")
                log += "\nBoth ocurrences are historical records, can't determine which to keep. Keeping the current one and marking previous as a duplicate";
            else
                log += "\nPrev ocurrence is a historical record. Keeping the current one and marking previous as a duplicate";

            duplicates.push(prev.row);
            mostRecentResponse[rID] = { "tstamp": tstamp, "row": row };
        }
        else if (typeof tstamp == "string") {
            log += "Current ocurrence is a historical record, but the previous one is not. Keeping the previous and marking the current as a duplicate";
            duplicates.push(row);
        }
        else  //Handle non-historical responses
        {
            //If this is more recent than the previous ocurrence
            if (tstamp.getTime() > prev.tstamp.getTime()) {
                log += "\nThe current response is more recent, replacing and marking the old as duplicate.";

                duplicates.push(prev.row);
                mostRecentResponse[rID] = { "tstamp": tstamp, "row": row };
            }
            else {
                log += "\nThe previous response is more recent, marking the current as duplicate.";
                duplicates.push(row);
            }
        }

        if (CONFIG.LOG_DUPLICATES) Logger.log(log);
    }

    Logger.log("Finished pulling duplicate data. Pushing to sheet...");


    let out = [];

    for (let row = minRow; row <= maxRow; row++) {
        let isDuplicate = duplicates.includes(row);
        let isSkipped = skippedRows.includes(row);
        out[row - minRow] = [];
        out[row - minRow][0] = isDuplicate ? true :
            isSkipped ? "" : false;
    }

    sheet.getRange(minRow + 1, sd.getIndex('isDuplicate') + 1, out.length, 1).setValues(out);


    Logger.log("Finished marking duplicate responses.");

}
