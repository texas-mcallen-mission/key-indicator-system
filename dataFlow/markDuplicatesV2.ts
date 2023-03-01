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
    const allSheetData = constructSheetData()
    markDuplicatesV2(allSheetData["data"])
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

function testCreateCorrectedEntry() {
    const areaData = {
        area: "WORD",
        isSister: false,
        ki1: 123,
    }
    const kiData = {
        area: "WORDLE",
        isSister: true,
        ki1: 321
    }
    const keysToKeep = ["area", "isSister"]
    const output = createCorrectedEntry_(areaData,kiData,keysToKeep)
    const comparison = {
        area: "WORD",
        isSister: false,
        ki1: 321
    }
    let pass = true
    for (const key in areaData) {
        if (comparison[key] != output[key]) {
            pass = false
        }
    }
    if (pass) {
        console.log("✅✔✅ PASS ✅✔✅")
    } else {
        console.log("❌⛔❌ FAIL ❌⛔❌")
    }
}

function getNewestCorrectedEntry_(data: kiDataEntry[]): kiDataEntry | null{
    let output = null
    const logKey = "log"
    const logTimeKey = "newestTime"

    const correctedEntries: kiDataEntry[] = []
    for (const entry of data) {
        if (Object.prototype.hasOwnProperty.call(entry, logKey)) {
            // check to see if there's any corrected entries
            if (String(entry[logKey]).includes("CORRECTED_ENTRY")) {
                // if this is the  first that passes the corrected entry check, set output equal to it
                if (output == null) {
                    output = entry
                } else {
                    // loads up the status log section of the data, and parses it for the latest timestamp inside.
                    const outputLogData = JSON.parse(output[logKey])
                    const testLogData = JSON.parse(entry[logKey])
                    if (Object.hasOwn(outputLogData, logTimeKey) && Object.hasOwn(testLogData, logTimeKey)) {
                        // so if we *can* make a comparison, do things... otherwise we just kinda yolo it.
                        if (outputLogData[logTimeKey] < entry[logTimeKey]) {
                            output = entry
                        }
                    }
                }
            }
        }
    }
    

    return output
}

function createCorrectedEntry_(newData: kiDataEntry, areaData: kiDataEntry, keysToKeep: string[],timestamp_key:string) {
    const output: kiDataEntry = copyObjectNoRecursion_(areaData);
    for (const key of keysToKeep) {
        if (Object.hasOwnProperty.call(newData, key)) {

            output[key] = newData[key]
        }
    }
    const logData = {
        log: "CORRECTED_ENTRY",
        newestTime:-1
    }
    logData.newestTime = new Date(newData[timestamp_key]).getTime()
    output["log"] = JSON.stringify(logData)
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
        "aptAddress",
        "fb-role"
    ]
    const dataClass = new kiDataClass(dataSheet.getData())
    const iterantKey = "add_iterant"
    dataClass.addIterant(iterantKey,1)
    const time_key = "kiDate"
    const timestamp_key = "formTimestamp"
    const area_id_key = "areaID"

    const cutoffDate = new Date();
    const day = cutoffDate.getTime() - (7 * 5 * 24 * 60 * 60 * 1000);
    cutoffDate.setTime(day)
    // disabled ATM because test data is old
    // dataClass.removeBeforeDate(cutoffDate)
    // also disabled during testing because headache
    // dataClass.removeMatchingByKey("isDuplicate", [true,"true"])
    // this is from the previous attempt to clean up corrected entries.  Using something a little smarter now.
    // dataClass.removeMatchingByKey("log", ["CORRECTED_ENTRY"])
    //@ts-expect-error I'm intentionally abusing this.  Llore.
    const aggData: two_key_grouper = dataClass.groupDataByMultipleKeys([time_key, area_id_key])
    
    const correctionEntries: kiDataEntry[] = []
    const markAsDuplicateEntries : kiDataEntry[] = []
    const okEntries: number[] = []
    const itkey = dataSheet.iterantKey
    // outer loop
    for(const date in aggData) {
        const dataForWeek = aggData[date]
        for (const areaID in dataForWeek) {
            const data = dataForWeek[areaID]
            // if there's nothing, skiiiip
            if (data.length > 1) {
                // check to see if data has corrected entries in it.
                // If so, check and see if the most recent * not * corrected entry is the same as it was.

                const newestCorrectedEntry = getNewestCorrectedEntry_(data)

                for (const entry of data) {
                    
                    const dupeMarker: kiDataEntry = {
                        isDuplicate:true
                    }
                    // row assignment.  Because it's possible to change the name we
                    // can't hardcode the iterant key value and therefore have to
                    // resort to not making this be part of the variable declaration.

                    dupeMarker[itkey] = entry[itkey]
                    
                    // was having problems with the previous corrected entries getting marked as duplicate.
                    // I think this fixes that.
                    // let markAsDuplicate = true
                    if (newestCorrectedEntry == null || newestCorrectedEntry[itkey] != entry[itkey]) {
                        markAsDuplicateEntries.push(dupeMarker)
                    }
                    
                }
                const relevantEntries = getOldestAndNewestEntry(data, timestamp_key)
                // check to see if the newest corrected entry already has that information or not
                const correctedEntry = createCorrectedEntry_(relevantEntries.newest, relevantEntries.oldest, areaDataKeys, timestamp_key)

                const correctionDupeMarker: kiDataEntry = {
                    isDuplicate:true
                }
                // adds iterant key from newest corrective entry in case it needs to be marked as duplicate
                if (newestCorrectedEntry != null) {
                    correctionDupeMarker[itkey] = newestCorrectedEntry[itkey];
                }

                if (newestCorrectedEntry == null) {
                    correctionEntries.push(correctedEntry)
                    // markAsDuplicateEntries.push(correctionDupeMarker)
                } else if (relevantEntries.newest[timestamp_key] > newestCorrectedEntry[timestamp_key]){
                    correctionEntries.push(correctedEntry)
                    markAsDuplicateEntries.push(correctionDupeMarker)
                    
                } else {
                    console.log("Skipped adding correction because it was up to date")
                }

            } else {
                for (const entry of data) {
                    okEntries.push(entry[iterantKey])
                }
            }
        }
    }
    // mark duplicates- I need to figure out a better / more efficient way of doing this...
    dataSheet.updateRows(markAsDuplicateEntries)
    // for (const duplicate of markAsDuplicateEntries) {
    //     dataSheet.directModify(duplicate, { "isDuplicate": true })
    // }
    // for (const notDuplicate of okEntries) {
    //     dataSheet.directModify(notDuplicate, { "isDuplicate": false })
    // }
    dataSheet.appendData(correctionEntries)
}