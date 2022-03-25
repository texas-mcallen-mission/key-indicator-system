//@ts-check
// This script's job is to send data to a spreadsheet (not necessarily in the parent document) and store information about the program there so that we can monitor things better than Google's built-in tools.
var loggerData = {
    // metaData: {}
}

// this and logMetaKeys are basically enums so that I can hardcode things via Typescript that I want to use for analysis
const logKeys = {
    executionCounter:"executionCounter",
    startTime: "startTime",
    endTime:"endTime",
    duration:"duration",
    // mainFunction:"mainFunction",
    failures: "failures",
    functionName: "functionName",
    parentFunction:"parentFunction"
    // mainFunction:"mainFunction"
    
}

var loggerMetaData = {
    
};

const logMetaKeys = {
    baseFunction: "baseFunction",
    triggerType: "triggerType",
    timeStarted:"timeStarted"
}

var loggerTransitive = {
    parentFunction: "parentFunction"
    

}

function getDataLogSheet_() {
    let worksheet = SpreadsheetApp.getActiveSpreadsheet()
    let sheetData = getReportOrSetUpFromOtherSource_("DEBUG SHEET", worksheet)
    return sheetData
}

function dataLogger_startFunction_(functionName:string,startTime = new Date()) {
    // stores data about the function in loggerData???
    Logger.log(typeof loggerData[functionName])
    // initialize a function name if it hasn't been 
    if (loggerData[functionName] == undefined) {
        loggerData[functionName] = {}
        loggerData[functionName][logKeys.executionCounter] = 0
        loggerData[functionName][logKeys.duration] = 0.0
        loggerData[functionName][logKeys.parentFunction] = ""
        loggerData[functionName][logKeys.failures] = 0
    }

    loggerData[functionName][logKeys.executionCounter] += 1
    loggerData[functionName][logKeys.startTime] = startTime.getMilliseconds()
}

function dataLogger_startChildFunction_(functionName, parentFunctionName, startTime = new Date) {
    dataLogger_startFunction_(functionName,startTime)
    loggerData[functionName][logKeys.parentFunction] = parentFunctionName
    
}

function dataLogger_setMainFunction_(functionName) {
    loggerMetaData[logMetaKeys.baseFunction] = functionName
    loggerMetaData[logMetaKeys.timeStarted] = new Date()
}
function dataLogger_endFunction_(functionName, endTime = new Date()) {
    // automatically calculates duration of thingy.
    loggerData[functionName][logKeys.endTime] = endTime.getMilliseconds()
    console.log(
        "DEBUGGING: START MILLIS", loggerData[functionName][logKeys.startTime],
        "FINISH TIME: ", endTime.getMilliseconds(),
        "TOTAL DURATION: ", loggerData[functionName][logKeys.startTime] - endTime.getMilliseconds(),
        "Absoluted: ", Math.abs(loggerData[functionName][logKeys.startTime] - endTime.getMilliseconds())
    )
    let additionalTime = loggerData[functionName][logKeys.endTime] - loggerData[functionName][logKeys.startTime]
    additionalTime = Math.abs(additionalTime)
    let prevDuration = loggerData[functionName][logKeys.duration]
    loggerData[functionName][logKeys.duration] = additionalTime + prevDuration //Math.abs(loggerData[functionName][logKeys.startTime] - endTime.getMilliseconds())
    // delete loggerData[functionName][logKeys.startTime]
    
}


// function setParentFunction_(functionName: string) {
//     loggerData.metaData[logKeys.mainFunction] = functionName
// }

// function dataLogger_addChildFunction_(functionName) {

// }

function merge_in_metadata_(data, metadata) {
    // data needs to be an object of objects, metadata is like a header: one object.
    // returns a object of objects where each sub-object has the data contained in metadata
    let outData = {}
    for (let key in data) {
        outData[key] = {
            // ...metadata,
            ...GITHUB_DATA,
            ...data[key],
        }
        // was merge(data[key],metadata)
        // outData[key] = outputs
        // Object.assign(data[key],metadata,data[key])
    }
    return data

}

function dataLogger_end_() {
    // sends data to display
    let dataLogSheetData = getDataLogSheet_();
    let dataLogSheet = dataLogSheetData.sheet;
    
    let log_data = []
    let header = []
    let USE_OLD_DATA = true

    let GET_META_DATA = true

    let INCLUDE_GITHUB_METADATA = true

    let REMOVE_START_END_MILLISECONDS = true

    if (USE_OLD_DATA) {
        log_data = dataLogSheetData.data;  // This code assumes that this will either be an empty array or a two-dimensional array of arrays (like this: [ [],[],[]])
        header = dataLogSheetData.headerData;
    }

    
    if (!header.includes(logKeys.functionName)){
        header.push(logKeys.functionName);
    }
    // if (GET_META_DATA) { loggerData = merge_in_metadata_(loggerMetaData, loggerData); }

    for (let key in loggerData) {
        let entry = []
        entry[ header.indexOf(logKeys.functionName)] = key

        console.log(key, loggerData[key]);
        
        if (REMOVE_START_END_MILLISECONDS) {
            delete loggerData[key][logKeys.startTime]
            delete loggerData[key][logKeys.endTime]
        }

        if (GET_META_DATA) {
            for (let metaKey in logMetaKeys) { // SHOVES that metadata in there
                if (!header.includes(metaKey)) { header.push(metaKey); }
                entry[header.indexOf(metaKey)] = loggerMetaData[metaKey];
            }
        }

        if (INCLUDE_GITHUB_METADATA) {
            for (let gitKey in GITHUB_DATA) {
                if (!header.includes(gitKey)) { header.push(gitKey); }
                entry[header.indexOf(gitKey)] = GITHUB_DATA[gitKey]
            }
        }
        

        for (let subKey in loggerData[key]) { // iterates through and 
            if (!header.includes(subKey)) {
                header.push(subKey)
            }
            entry[header.indexOf(subKey)] = loggerData[key][subKey]
            
        }
        
        log_data.push(entry)
    }
    
    let outData = resize_data_(log_data,header)
    Logger.log(["data",log_data])
    console.log("header",header)
    console.log("outData",outData)
    // sendReportToDisplayV3_(header, data, dataLogSheet)

    let sortColumn = 1
    if(header.includes(logMetaKeys.timeStarted)){sortColumn = header.indexOf(logMetaKeys.timeStarted)+1}

    let args = {
        sortColumn: sortColumn,
        ascending:false
    }
    sendDataToDisplayV3_(header, outData, dataLogSheet,args)
    
}

function resize_data_(in_data,header) {
    // this function is not working- it SHOULD rescale the arrays in an array to have the same number of values / entries, but it's not working quite yet.
    let length = header.length
    let outData = []
    for (let i = 0; i < in_data.length;i++) {
        if (in_data[i].length > length) {
            length = in_data[i].length
            Logger.log("Resized array length")
        }
    }
    console.log("Max Array Length:",length)
    for (let entry of in_data) {
        let outEntry = entry
        outEntry.length = length
        // outEntry.fill(empty_value, entry.length, length)
        
        outData.push(outEntry)
    }
    return outData
}

function dataLogger_addFailure_(functionName) {
    if (loggerData[functionName][logKeys.failures] == undefined) {
        loggerData[functionName][logKeys.failures] = 0
    }
    loggerData[functionName][logKeys.failures] += 1
    console.warn("function failure for ",functionName)
}

function dataLogger_setTriggerType_(triggerType) {
    loggerMetaData[logMetaKeys.triggerType] = triggerType
}

function time_a_function() {
    
    let startTime = new Date()
    dataLogger_setMainFunction_("updateDistrictReports")
    dataLogger_startFunction_("updateDistrictReports",startTime) // not quite sure how to call this thing yet
    try {
        updateDistrictReports()
    } catch (error) {
        dataLogger_addFailure_("updateDistrictReports")
    }
    dataLogger_endFunction_("updateDistrictReports")

    dataLogger_setMainFunction_("updateZoneReports")
    dataLogger_startFunction_("updateZoneReports", startTime); // not quite sure how to call this thing yet
    // try {
    //     updateZoneReports();
    // } catch (error) {
    //     dataLogger_addFailure_("updateZoneReports");
    // }
    dataLogger_endFunction_("updateZoneReports")


    dataLogger_end_()

}