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

function testMarkDuplicatesV2() {
    const allSheetData = constructSheetData()
    markDuplicatesV2(allSheetData["data"])
}
// WYLO: getOldestAndNewestEntry doesn't seem to be working properly

function getOldestAndNewestEntry(data:kiDataEntry[],timeKey: string): oldestNewest_return_type {
    const starter = data[0]
    const output = {
        oldest: starter,
        newest: starter
    };
    
    for (const entry of data) {
        const current_date = new Date(entry[timeKey])
        const comparison_date_1 = new Date(output.oldest[timeKey])
        const comparison_date_2 = new Date(output.newest[timeKey])
        if (current_date.getTime() > comparison_date_2.getTime()) {
            output.newest = entry
        } else if (current_date.getTime() < comparison_date_1.getTime()) {
            output.oldest = entry
        }
    }


    return output
}

function createCorrectedEntry_(areaDataEntry: kiDataEntry, dataEntry: kiDataEntry, keysToKeep: string[]) {
    const output: kiDataEntry = dataEntry;
    for (const key of keysToKeep) {
        if (Object.hasOwnProperty.call(areaDataEntry, key)) {

            output[key] = areaDataEntry[key]
        }
    }
    output["log"] = "CORRECTED_ENTRY"
    output["isDuplicate"] = false
    return output

}
function markDuplicatesV2(dataSheet:SheetData) {
    const areaDataKeys = [
        "areaName",
        "areaEmail",
        "areaID",
        "kiDate",
        "name1",
        "position1",
        "isTrainer1",
        "name2",
        "position2",
        "isTrainer2",
        "name3",
        "position3",
        "isTrainer3",
        "districtLeader",
        "zoneLeader1",
        "zoneLeader2",
        "zoneLeader3",
        "stl1",
        "stl2",
        "stl3",
        "stlt1",
        "stlt2",
        "stlt3",
        "assistant1",
        "assistant2",
        "assistant3",
        "district",
        "zone",
        "unitString",
        "hasMultipleUnits",
        "languageString",
        "isSeniorCouple",
        "isSisterArea",
        "hasVehicle",
        "vehicleMiles",
        "vinLast8",
        "aptAddress"
    ]
    const dataClass = new kiDataClass(dataSheet.getData())
    const iterantKey = "add_iterant"
    dataClass.addIterant(iterantKey,1)
    const time_key = "kiDate"
    const area_id_key = "areaID"

    const cutoffDate = new Date();
    const day = cutoffDate.getTime() - (7 * 5 * 24 * 60 * 60 * 1000);
    cutoffDate.setTime(day)
    // disabled ATM because test data is old
    // dataClass.removeBeforeDate(cutoffDate)
    // also disabled during testing because headache
    // dataClass.removeMatchingByKey("isDuplicate", [true,"true"])
    dataClass.removeMatchingByKey("log", ["CORRECTED_ENTRY"])
    //@ts-expect-error I'm intentionally abusing this.  Llore.
    const aggData: two_key_grouper = dataClass.groupDataByMultipleKeys([time_key, area_id_key])
    // data should come out of this formatted like so:
    /* "Sun, Jan 23":{
        "A123456": [
            {kiDataEntry1},...{kiDataEntryN}
        ],
        "A231": [
            {kiDataEntry1}
        ]
    }
    */
    // const aggDataDemo:two_key_grouper = {
    //     "Sun, Jan 23": {
    //         "A123456": [
    //             dataClass.data[0] ,  dataClass.data[1]
    //         ],
    //         "A231": [
    //             dataClass.data[3]
    //         ]
    //     }
    // }
    const correctionEntries: kiDataEntry[] = []
    const markAsDuplicateEntries : number[] = []
    const okEntries: number[] = []
    // outer loop
    for(const date in aggData) {
        const dataForWeek = aggData[date]
        for (const areaID in dataForWeek) {
            const data = dataForWeek[areaID]
            // if there's nothing, skiiiip
            if (data.length > 1) {
                for (const entry of data) {
                    markAsDuplicateEntries.push(entry[iterantKey])
                }
                const relevantEntries = getOldestAndNewestEntry(data, time_key)
                correctionEntries.push(createCorrectedEntry_(relevantEntries.oldest, relevantEntries.newest, areaDataKeys))

            } else {
                for (const entry of data) {
                    okEntries.push(entry[iterantKey])
                }
            }
        }
    }
    // mark duplicates- I need to figure out a better / more efficient way of doing this...
    for (const duplicate of markAsDuplicateEntries) {
        dataSheet.directModify(duplicate, { "isDuplicate": true })
    }
    for (const notDuplicate of okEntries) {
        dataSheet.directModify(notDuplicate, { "isDuplicate": false })
    }
    dataSheet.insertData(correctionEntries)
}