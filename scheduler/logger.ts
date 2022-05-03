//@ts-check
// This script's job is to send data to a spreadsheet (not necessarily in the parent document) and store information about the program there so that we can monitor things better than Google's built-in tools.

// this and logMetaKeys are basically enums so that I can hardcode things via Typescript that I want to use for analysis
const logKeys = {
    executionCounter: "executionCounter",
    cycleStartMillis: "cycleStartMillis", // was startTime
    cycleEndMillis: "cycleEndMillis", // was endTime
    duration: "duration",
    // mainFunction:"mainFunction",
    failures: "failures",
    functionName: "functionName",
    parentFunction: "parentFunction",
    errors: "errors",
    shardID: "shardID",
    // mainFunction:"mainFunction"

};



const logMetaKeys = {
    baseFunction: "baseFunction",
    triggerType: "triggerType",
    timeStarted: "timeStarted",
    timeEnded: "timeEnded",
    shardID:"shardID",
};

const triggerTypes = {
    "timeBased": "timeBased",
    "manual": "manual",
    "menu": "menu",
    "DEBUG": "DEBUG"
};

function justForTesting_(dLog: dataLogger, arg1: any) {
    console.log("WWWWEEEE", arg1);
}

function testMetaRunnerSys() {
    meta_runner(justForTesting_, triggerTypes.DEBUG);
}

function test_dataLogger() {
    // basically yoinked from meta_runner for debugging purposes
    let functionArg1 = "PASSTHROUGH ARGUMENT";
    console.log("[META_RUNNER] - Running ", "justForTesting_", " with trigger:", triggerTypes.DEBUG);
    let dLog = new dataLogger("justForTesting_", triggerTypes.DEBUG, false);
    dLog.startFunction("justForTesting_");
    try {

        Logger.log(typeof functionArg1);
        justForTesting_(dLog, functionArg1);

    } catch (error) {
        dLog.addFailure("justForTesting_", error);
    }
    dLog.endFunction("justForTesting_");
    dLog.end();
}

// function getDataLogSheet_() {
//     let worksheet = SpreadsheetApp.getActiveSpreadsheet();
//     let sheetData = getReportOrSetUpFromOtherSource_("DEBUG SHEET", worksheet);
//     return sheetData;
// }
class dataLogger {

    logData = {};
    logMetaData = {};

    inline = false;
    

    constructor(baseFunctionName:string, trigger, isInline:boolean = false,shardId:null|string|number = null) {
        this.logMetaData[logMetaKeys.baseFunction] = baseFunctionName;
        this.logMetaData[logMetaKeys.timeStarted] = new Date();
        this.logMetaData[logMetaKeys.triggerType] = trigger;
        this.logMetaData[logMetaKeys.timeEnded] = new Date();
        if (shardId != null) {
            this.logMetaData[logMetaKeys.shardID] = shardId
        } else {
            this.logMetaData[logMetaKeys.shardID] = ""
        }
        this.inline = isInline;
        let targetSheetEntry = sheetDataConfig.local.debug
        let rawSheetData = new RawSheetData(targetSheetEntry)

        this.sheetData = new SheetData(rawSheetData)
    }

    get isInline() {
        return this.inline;
    }

    startFunction(functionName) {
        if (this.logData[functionName] == undefined) {
            // pre-initialize data for later
            this.logData[functionName] = {};
            this.logData[functionName][logKeys.executionCounter] = 0;
            this.logData[functionName][logKeys.cycleEndMillis] = 0;
            this.logData[functionName][logKeys.duration] = 0;
            // this.logData[functionName][logKeys.failures] = 0
        }
        let cycleStartTime = new Date();
        this.logData[functionName][logKeys.executionCounter] += 1;
        this.logData[functionName][logKeys.cycleStartMillis] = cycleStartTime.getTime();

    }



    endFunction(functionName) {
        if (this.logData[functionName][logKeys.cycleEndMillis] == undefined) {
            this.logData[functionName][logKeys.cycleEndMillis] = 0;
        }
        let cycleEndDate = new Date();
        this.logData[functionName][logKeys.cycleEndMillis] = cycleEndDate.getTime();
        let currentDuration = Math.abs(this.logData[functionName][logKeys.duration]);
        let additionalTime = Math.abs(this.logData[functionName][logKeys.cycleEndMillis] - this.logData[functionName][logKeys.cycleStartMillis]);
        this.logData[functionName][logKeys.duration] = currentDuration + additionalTime;
    }

    addFailure(functionName, error) {
        if (this.logData[functionName][logKeys.failures] == undefined) {
            this.logData[functionName][logKeys.failures] = 0;
            this.logData[functionName][logKeys.errors] = "";
        }
        this.logData[functionName][logKeys.failures] += 1;
        let errorString = "";
        switch (typeof error) {
            case 'string':
                errorString = error;
                break;
            case 'object':
                errorString = error["message"];
                break;
        }


        this.logData[functionName][logKeys.errors] += errorString;
        console.warn("function failure for: ", functionName, ":", error);
    }

    end() {
        // sends data to display

        if (debug_write_is_locked_()) {
            while (!debug_write_is_locked_()) {
                Logger.log("waiting for other thing to save");
            }
        }

        let log_data = [];

        let GET_META_DATA = true;
        let INCLUDE_GITHUB_METADATA = true;
        let REMOVE_CYCLE_TIMING_DATA = false;

        for (let functionNameKey in this.logData) {
            // let entry = [];
            let newEntry:{} = {};

            // add function name:

            Object.assign(newEntry, { functionName: functionNameKey });

            // entry[header.indexOf(logKeys.functionName)] = functionNameKey;

            if (REMOVE_CYCLE_TIMING_DATA) {
                delete this.logData[functionNameKey][logKeys.cycleStartMillis];
                delete this.logData[functionNameKey][logKeys.cycleEndMillis];
            }
            // entry[header.indexOf(logKeys.functionName)] = functionNameKey;
            newEntry = this.logData[functionNameKey];

            newEntry[logKeys.functionName] = functionNameKey;


            if (this.logData[functionNameKey][logKeys.functionName] == this.logMetaData[logMetaKeys.baseFunction]) {
                // Anything put in here will only be applied to the base function that ran.
                let newDate = new Date();
                Object.assign(this.logMetaData, { "timeEnded": newDate });
                newEntry[logMetaKeys.timeEnded] = new Date();
            }

            if (GET_META_DATA) {

                newEntry = { ...newEntry, ...this.logMetaData };
            }

            // pulls in data from git-info- SUPER useful for multiple deployments
            if (INCLUDE_GITHUB_METADATA) {

                newEntry = { ...newEntry, ...GITHUB_DATA };
            }

            // TODO rework this... 
            debug_write_lock_();
            addToSheet_(newEntry);
            debug_write_unlock_();

        }

    }

}

function addToSheet_(data: any) {
    let allSheetData = constructSheetData();
    let debug = allSheetData.debug;

    debug.appendData(data);
}

function prependRows_(data, sheet) {
    sheet.insertRowsBefore(2, data.length);
    let dataRange = sheet.getRange(2, 1, data.length, data[0].length);
    dataRange.setValues(data);
}

const debug_write_lock_key = "soggyMcLoggy";
function debug_write_lock_() {
    let cache = CacheService.getScriptCache();
    cache.put(debug_write_lock_key, "true");
}

function debug_write_unlock_() {
    let cache = CacheService.getScriptCache();
    cache.remove(debug_write_lock_key);
}
function debug_write_is_locked_() {
    let cache = CacheService.getScriptCache();
    let cacheData = cache.get(debug_write_lock_key);
    if (!cacheData) {
        return false;
    } else {
        return true;
    }
}

function time_a_function_classy() {

    let startTime = new Date();
    let functionName = "updateDistrictReports";
    let logger: dataLogger = new dataLogger(functionName, triggerTypes.DEBUG,false);

    logger.startFunction(functionName);
    try {
        updateDistrictReportsV5();
    } catch (error) {
        logger.addFailure(functionName, error);
    }
    logger.endFunction(functionName);

    logger.end();

}


function resize_data_(in_data, header) {
    // this function is not working- it SHOULD rescale the arrays in an array to have the same number of values / entries, but it's not working quite yet.
    let length = header.length;
    let outData = [];
    for (let i = 0; i < in_data.length; i++) {
        if (in_data[i].length > length) {
            length = in_data[i].length;
            Logger.log("Resized array length");
        }
    }
    console.log("Max Array Length:", length);
    for (let entry of in_data) {
        let outEntry = entry;
        outEntry.length = length;
        // outEntry.fill(empty_value, entry.length, length)

        outData.push(outEntry);
    }
    return outData;
}