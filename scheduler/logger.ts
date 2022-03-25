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
    parentFunction: "parentFunction"
    // mainFunction:"mainFunction"

};



const logMetaKeys = {
    baseFunction: "baseFunction",
    triggerType: "triggerType",
    timeStarted: "timeStarted"
};

const triggerTypes = {
    "timeBased": "timeBased",
    "manual": "manual",
    "menu": "menu",
    "DEBUG": "DEBUG"
};


function getDataLogSheet_() {
    let worksheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheetData = getReportOrSetUpFromOtherSource_("DEBUG SHEET", worksheet);
    return sheetData;
}
class dataLogger {

    logData = {};
    logMetaData = {};

    inline = false;
    constructor(baseFunctionName, trigger, isInline = false) {
        this.logMetaData[logMetaKeys.baseFunction] = baseFunctionName;
        this.logMetaData[logMetaKeys.timeStarted] = new Date();
        this.logMetaData[logMetaKeys.triggerType] = trigger;
        this.inline = isInline;
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
        this.logData[functionName][logKeys.cycleStartMillis] = cycleStartTime.getMilliseconds();

    }

    endFunction(functionName) {
        if (this.logData[functionName][logKeys.cycleEndMillis] == undefined) {
            this.logData[functionName][logKeys.cycleEndMillis] = 0;
        }
        let cycleEndDate = new Date();
        this.logData[functionName][logKeys.cycleEndMillis] = cycleEndDate.getMilliseconds();
        let currentDuration = this.logData[functionName][logKeys.duration];
        let additionalTime = this.logData[functionName][logKeys.cycleEndMillis] - this.logData[functionName][logKeys.cycleStartMillis];
        this.logData[functionName][logKeys.duration] = currentDuration + additionalTime;
    }

    addFailure(functionName, error) {
        if (this.logData[functionName][logKeys.failures] == undefined) {
            this.logData[functionName][logKeys.failures] = 0;
        }
        this.logData[functionName][logKeys.failures] += 1;
        console.warn("function failure for: ", functionName, ":", error);
    }

    end() {
        // sends data to display
        let dataLogSheetData = getDataLogSheet_();
        let dataLogSheet = dataLogSheetData.sheet;

        let log_data = [];
        let header = [];

        // This will get integrated into the config file in the future, but there isn't much of a reason to quite yet
        let USE_OLD_DATA = true;
        let GET_META_DATA = true;
        let INCLUDE_GITHUB_METADATA = true;
        let REMOVE_CYCLE_TIMING_DATA = false;

        if (USE_OLD_DATA) {
            log_data = dataLogSheetData.data;  // This code assumes that this will either be an empty array or a two-dimensional array of arrays (like this: [ [],[],[]])
            header = dataLogSheetData.headerData;
        }

        if (!header.includes(logKeys.functionName)) {
            header.push(logKeys.functionName);
        }

        for (let functionNameKey in this.logData) {
            let entry = [];
            entry[header.indexOf(logKeys.functionName)] = functionNameKey;

            if (REMOVE_CYCLE_TIMING_DATA) {
                delete this.logData[functionNameKey][logKeys.cycleStartMillis];
                delete this.logData[functionNameKey][logKeys.cycleEndMillis];
            }

            if (GET_META_DATA) {
                for (let metaKey in logMetaKeys) {
                    if (!header.includes(metaKey)) { header.push(metaKey); }
                    entry[header.indexOf(metaKey)] = this.logMetaData[metaKey];
                }
            }

            // pulls in data from git-info- SUPER useful for multiple deployments
            if (INCLUDE_GITHUB_METADATA) {
                for (let gitKey in GITHUB_DATA) {
                    if (!header.includes(gitKey)) { header.push(gitKey); }
                    entry[header.indexOf(gitKey)] = GITHUB_DATA[gitKey];
                }
            }

            for (let subKey in this.logData[functionNameKey]) {
                if (!header.includes(subKey)) {
                    header.push(subKey);
                }
                entry[header.indexOf(subKey)] = this.logData[functionNameKey][subKey];
            }

            log_data.push(entry);

            let outData = resize_data_(log_data, header);

            let sortColumn = 1;
            if (header.includes(logMetaKeys.timeStarted)) { sortColumn = header.indexOf(logMetaKeys.timeStarted); }

            let args = {
                sortColumn: sortColumn,
                ascending: false
            };

            sendDataToDisplayV3_(header, outData, dataLogSheet, args);

        }
    }

}

function time_a_function_classy() {

    let startTime = new Date();
    let functionName = "updateDistrictReports";
    let logger: dataLogger = new dataLogger(functionName, triggerTypes.DEBUG);

    logger.startFunction(functionName);
    try {
        updateDistrictReports();
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