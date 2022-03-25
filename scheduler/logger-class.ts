//@ts-check
// This script's job is to send data to a spreadsheet (not necessarily in the parent document) and store information about the program there so that we can monitor things better than Google's built-in tools.
var loggerData = {
    // metaData: {}
}

class dataLogger {

    logData = {}
    logMetaData = {}
    constructor(baseFunctionName,trigger) {
        this.logMetaData[logMetaKeys.baseFunction] = baseFunctionName
        this.logMetaData[logMetaKeys.timeStarted] = new Date()
        this.logMetaData[logMetaKeys.triggerType] = trigger
    }

    startFunction(functionName) {
        if (this.logData[functionName] == undefined) {
            // pre-initialize data for later
            this.logData[functionName] = {};
            this.logData[functionName][logKeys.executionCounter] = 0
            this.logData[functionName][logKeys.cycleEndMillis] = 0
            this.logData[functionName][logKeys.duration] = 0
            // this.logData[functionName][logKeys.failures] = 0
        }
        let cycleStartTime = new Date()
        this.logData[functionName][logKeys.executionCounter] += 1
        this.logData[functionName][logKeys.cycleStartMillis] = cycleStartTime.getMilliseconds()

    }

    endFunction(functionName) {
        let cycleEndDate = new Date()
        this.logData[functionName][logKeys.cycleEndMillis] = cycleEndDate.getMilliseconds()
        let currentDuration = this.logData[functionName][logKeys.duration]
        let additionalTime = this.logData[functionName][logKeys.cycleEndMillis] - this.logData[functionName][logKeys.cycleStartMillis]
        this.logData[functionName][logKeys.duration] = currentDuration + additionalTime
    }

    addFailure(functionName,error) {
        if (this.logData[functionName][logKeys.failures] == undefined) {
            this.logData[functionName][logKeys.failures] = 0
        }
        this.logData[functionName][logKeys.failures] += 1
        console.warn("function failure for: ",functionName,":",error)
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
        let REMOVE_CYCLE_TIMING_DATA = false

        if (USE_OLD_DATA) {
            log_data = dataLogSheetData.data;  // This code assumes that this will either be an empty array or a two-dimensional array of arrays (like this: [ [],[],[]])
            header = dataLogSheetData.headerData;
        }

        if (!header.includes(logKeys.functionName)) {
            header.push(logKeys.functionName);
        }

        for (let functionNameKey in this.logData) {
            let entry = []
            entry[header.indexOf(logKeys.functionName)] = functionNameKey
            
            if (REMOVE_CYCLE_TIMING_DATA) {
                delete this.logData[functionNameKey][logKeys.cycleStartMillis];
                delete this.logData[functionNameKey][logKeys.cycleEndMillis];
            }

            if (GET_META_DATA) {
                for (let metaKey in logMetaKeys) {
                    if (!header.includes(metaKey)) { header.push(metaKey); }
                    entry[header.indexOf(metaKey)] = this.logMetaData[metaKey]
                }
            }

            // pulls in data from git-info- SUPER useful for multiple deployments
            if (INCLUDE_GITHUB_METADATA) {
                for (let gitKey in GITHUB_DATA) {
                    if (!header.includes(gitKey)) { header.push(gitKey); }
                    entry[header.indexOf(gitKey)] = GITHUB_DATA[gitKey]
                }
            }

            for (let subKey in this.logData[functionNameKey]) {
                if (!header.includes(subKey)) {
                    header.push(subKey)
                }
                entry[header.indexOf(subKey)] = this.logData[functionNameKey][subKey]
            }

            log_data.push(entry)

            let outData = resize_data_(log_data, header)

            let sortColumn = 1
            if (header.includes(logMetaKeys.timeStarted)) { sortColumn = header.indexOf(logMetaKeys.timeStarted); }
            
            let args = {
                sortColumn: sortColumn,
                ascending:false
            }

            sendDataToDisplayV3_(header, outData, dataLogSheet,args)

        }
    }

}

function time_a_function_classy() {

    let startTime = new Date();

    let logger: dataLogger = new dataLogger("updateDistrictReports", triggerTypes.DEBUG)

    logger.startFunction("UpdateDistrictReports")
    try {
        updateDistrictReports();
    } catch (error) {
        logger.addFailure("updateDistrictReports", error)
    }
    logger.endFunction("updateDistrictReports");

    logger.end()

}
