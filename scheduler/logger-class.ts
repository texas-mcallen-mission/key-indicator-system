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

    

}
