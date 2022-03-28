// The Scheduler!  This bad boi's job is to execute functions at given intervals.  This will supersede triggers.ts and will (eventually) integrate with KIC-config.js for maximum configurability.


// This makes using the dLog 
function meta_runner(functionName, trigger, functionArg1 = undefined) {
    console.log("[META_RUNNER] - Running ", functionName.name, " with trigger:", trigger);
    let dLog: dataLogger = new dataLogger(functionName.name, trigger, false);
    dLog.startFunction(functionName.name);
    try {
        if (functionArg1 == undefined) {
            functionName(dLog);
        } else {
            Logger.log(typeof functionArg1);
            functionName(functionArg1, dLog);
        }
    } catch (error) {
        dLog.addFailure(functionName.name, error);
    }
    dLog.endFunction(functionName.name);
    dLog.end();
}


