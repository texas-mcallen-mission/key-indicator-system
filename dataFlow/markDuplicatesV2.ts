// Order of operations:
/*
    Load data
    Add iterant
    Remove data for time we don't want to check
    Split data by week and then by area id
    Check to see if there are multiple entries
        If there are multiple entries, create corrective entries with the most recent data and the oldest area data
        Save iterants for things that need to be marked as duplicate
        Add "CORRECTIVE" to status log for corrected entries
        Append corrective entries
    Partial update entries to mark as duplicate for all involved entries
    Completion.

    Also need to add a timer shunt thing so that we can batch things and not run into time limits



*/

// import { create } from 'lodash';

//import { entries } from 'lodash';

// Step Uno:  Load Data

interface two_key_grouper {
    [index:string]:one_key_grouping
}

interface one_key_grouping {
    [index:string]:kiDataEntry[]
}

interface oldestNewest_return_type {
    oldest: kiDataEntry,
    newest: kiDataEntry
}
function copyObjectNoRecursion_(inObject: object) {
    const output = {}
    for (const key in inObject) {
        output[key] = inObject[key]
    }
    return output
    
}


function testMarkDuplicatesV2() {
    const allSheetData = constructSheetDataV3(["data"])
    markDuplicatesV2_(allSheetData["data"])
}
// WYLO: getOldestAndNewestEntry doesn't seem to be working properly

function getOldestAndNewestEntry(data:kiDataEntry[],timeKey: string): oldestNewest_return_type {
    const starter = copyObjectNoRecursion_(data[0])
    const output = {
        oldest: copyObjectNoRecursion_(starter),
        newest: copyObjectNoRecursion_(starter)
    };
    
    for (const entry of data) {
        const current_date = new Date(entry[timeKey])
        const comparison_date_1 = new Date(output.oldest[timeKey])
        const comparison_date_2 = new Date(output.newest[timeKey])
        if (current_date.getTime() > comparison_date_2.getTime()) {
            output.newest = entry
        } else if (current_date.getTime() < comparison_date_1.getTime()) {
            output.newest = entry
        }
    }


    return output
}





/**
 * @description
 * @param {SheetData} dataSheet
 * @param {number} [weeksToMark=7] Number of weeks: if set to -1 will do all of them.
 */
function markDuplicatesV2_(dataSheet: SheetData, weeksToMark = 7) {
    
    const dataClass = new kiDataClass(dataSheet.getData());
    // const iterantKey = "add_iterant"
    // dataClass.addIterant(iterantKey,1)
    const time_key = "kiDate";
    const timestamp_key = "formTimestamp";
    const area_id_key = "areaID";

    const cutoffDate = new Date();
    const day = cutoffDate.getTime() - (((weeksToMark * 7) + 1) * 24 * 60 * 60 * 1000);
    cutoffDate.setTime(day);
    // disabled ATM because test data is old
    if (weeksToMark != -1) {
        dataClass.removeBeforeDate(cutoffDate);
    }
    if (weeksToMark == 0) {
        console.error("Marking zero day's worth of duplicates.");
    }
    // remove entries that don't have area id's
    dataClass.popMissing("areaID");
    //@ts-expect-error I'm intentionally abusing this.  Llore.
    const aggData: two_key_grouper = dataClass.groupDataByMultipleKeys([time_key, area_id_key]);
    
    const olderEntries: kiDataEntry[] = [];
    const okEntries: kiDataEntry[] = [];
    const itkey = dataSheet.iterantKey;
    
    // outer loop
    for (const date in aggData) {
        const dataForWeek = aggData[date];
        for (const areaID in dataForWeek) {
            const data = dataForWeek[areaID];
            // if there's nothing, skiiiip
            let skip = false;
            if (data.length <= 1) {
                // skip to next in the for loop
                okEntries.push(...data)
                continue;
            }

            let intDataClass = new kiDataClass(data)
            okEntries.push(intDataClass.popNewestByDateString(timestamp_key))
            olderEntries.push(...intDataClass.end)
            

        }
    }

    const dupeEntries: kiDataEntry[] = [];
    for (const entry of olderEntries) {
        const output: kiDataEntry = {
            isDuplicate: true
        };
        output[itkey] = entry[itkey];
        dupeEntries.push(output);
    }

    dataSheet.updateRows(dupeEntries);
    // Mark known good entries as not duplicate.
    const goodEntries: kiDataEntry[] = [];
    for (const entry of okEntries) {
        const output: kiDataEntry = {
            isDuplicate: false
        };
        output[itkey] = entry[itkey];
        goodEntries.push(output);
    }
    dataSheet.updateRows(goodEntries);
    console.log("Marked ",dupeEntries.length," entries as duplicate for the last ",weeksToMark," weeks!")
    
}
