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

function createDumbEntry() {
    function randNum() {
        return Math.floor(Math.random()*5)
    }
    const dumbEntry: kiDataEntry = {
        areaName: "Mercedes C",
        // responsePulled: 1,
        // isDuplicate: 2,
        formTimestamp: convertToSheetDate_(new Date().toString()),
        submissionEmail: "DEBUGDATA@LOL",
        kiDate: convertToSheetDate_(new Date().toString()),
        np: randNum(),
        sa: randNum(),
        bd: randNum(),
        bc: randNum(),
        rca: randNum(),
        rc: randNum(),
        serviceHrs: randNum(),
        cki: randNum(),
        "bap-self-ref": randNum(),
        "bap-street": randNum(),
        "bap-ward-activity-or-event": randNum(),
        "bap-ref-recent-convert": randNum(),
        "bap-ref-part-member": randNum(),
        "bap-ref-other-member": randNum(),
        "bap-ref-teaching-pool": randNum(),
        "bap-ref-other-non-member": randNum(),
        "bap-fb-mission": randNum(),
        "bap-fb-personal": randNum(),
        "bap-family-history": randNum(),
        "bap-taught-prev": randNum(),
        "fb-role": 26,
        "fb-ref-rgv-eng": randNum(),
        "fb-ref-rgv-spa": randNum(),
        "fb-ref-laredo-eng": randNum(),
        "fb-ref-laredo-spa": randNum(),
        "fb-ref-ysa": randNum(),
        "fb-ref-asl": randNum(),
        "fb-ref-service": randNum(),
        "fb-ref-corpus": randNum(),
        "fb-ref-personal": randNum(),
        "feedback-general": "DEBUG DATA", // had to hardcode these because I added more questions afterwards.
        "feedback-improvement": "DEBUG DATA",
        "feedback-analysis": "DEBUG DATA!",
        "fb-ref-st-eng": randNum(),
        "fb-ref-st-spa": randNum(),
        "mpl": randNum(),
        "RCA-weekly": randNum()
    };

    const areaNames = ['Mission 3A',"Sharyland B","Mercedes C"]
    const entries:kiDataEntry[] = []
    for (let i = 0; i < 5; i++){
        const entry = { ...dumbEntry }
        entry["areaName"] = areaNames[i % areaNames.length]
        entries.push(entry)
    }
    // const granulify = new kiDataClass(entries).addGranulatedTime("kiDate", "kiDate", timeGranularities.day).end
    constructSheetDataV3(["form"]).form.appendData(entries)
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
    const correctionDate = convertToSheetDate_(new Date())
    const output = createCorrectedEntry_(areaData,kiData,keysToKeep,correctionDate)
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


/**
 * @description
 * @param {SheetData} dataSheet
 * @param {number} [weeksToMark=7] Number of weeks: if set to -1 will do all of them.
 */
function markDuplicatesV2_(dataSheet: SheetData, weeksToMark = 7) {
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
    ];
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
    
    const correctionEntries: kiDataEntry[] = [];
    const markAsDuplicateEntries: kiDataEntry[] = [];
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
                continue;
            }
            let dataModClass = new kiDataClass(data);
            let correctedEntries = dataModClass.popStringIncludes("log", "CORRECTED_ENTRY");
            let relevantEntries = getOldestAndNewestEntry(data, timestamp_key);
            // first check to see if there are corrected entries
            // and then if there are any, whether or not we're up to date.
            if (correctedEntries.length > 0) {
                let latestCorrectiveEntry = getNewestCorrectedEntry_(correctedEntries);
                // Corrected entries store some JSON data in the log that we have to use here:
                let logData = JSON.parse(latestCorrectiveEntry["log"]);

                const logTimeKey = "newestTime";

                // skip if we've already made a corrected entry and it's up to date.
                if (logData[logTimeKey] >= relevantEntries.newest.formTimestamp) {
                    continue;
                } else {
                    markAsDuplicateEntries.push(...correctedEntries);
                }
            }

            // at this point, the only way we're here is if there's stuff that hasn't been updated.
            const correctedEntry = createCorrectedEntry_(relevantEntries.newest, relevantEntries.oldest, areaDataKeys, timestamp_key);
            markAsDuplicateEntries.push(...dataModClass.end);
            correctionEntries.push(correctedEntry);

        }
    }
    // WYLO 2023-03-01: okentries needs to get updated to use the new kiDataEntry format stuff as well.
    // mark duplicates- I need to figure out a better / more efficient way of doing this...
    dataSheet.appendData(correctionEntries);
    // dataSheet.updateRows(markAsDuplicateEntries)
    const dupeEntries: kiDataEntry[] = [];
    for (const entry of markAsDuplicateEntries) {
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
    console.log("Skipped adding ", String(okEntries.length), "entries that were already up to date!");
    // for (const duplicate of markAsDuplicateEntries) {
    //     dataSheet.directModify(duplicate, { "isDuplicate": true })
    // }
    // for (const notDuplicate of okEntries) {
    //     dataSheet.directModify(notDuplicate, { "isDuplicate": false })
    // }
}
