// The Scheduler!  This bad boi's job is to execute functions at given intervals.  This will supersede triggers.ts and will (eventually) integrate with KIC-config.js for maximum configurability.


// This makes using the dLog 
function meta_runner(functionName, trigger, functionArg1 = undefined) {
    console.log("[META_RUNNER] - Running ", functionName.name, " with trigger:", trigger);
    let locker = new meta_locker(functionName.name)
    if (locker.isLocked()) {
        Logger.log("[META_RUNNER][META_LOCKER] Currently in Lockout, ending execution ")
        return
    } else {
        locker.lock()
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
        locker.unlock() // I moved this in front of the dLogger bit because I shouldn't need it to run for things to work
        dLog.endFunction(functionName.name);
        dLog.end();

    }
}


class meta_locker{
    
    functionName = ""
    appendString = "Some Random Words To Avoid Weird Problems"

    cacheString = "UNDEFINED"
    constructor(functionName) {
        this.functionName = functionName
        this.cacheString = this.functionName + this.appendString
    }

    isLocked() {
        let cache = CacheService.getScriptCache()
        let cacheData = cache.get(this.cacheString)
        if (!cacheData) {
            return false
        } else {
            return true
            console.warn("[META_RUNNER] : CACHE LOCKOUT FOR ", this.functionName)
        }
    }

    lock() {
        let cache = CacheService.getScriptCache()
        cache.put(this.cacheString,"true",CONFIG.scheduler.meta_locker.cacheTimeoutTime)
    }

    unlock() {
        let cache = CacheService.getScriptCache()
        cache.remove(this.cacheString)
    }

}

const list_of_time_based_triggers = {
    /*
updateDataSheet_TimeBasedTrigger
importContacts_TimeBasedTrigger
updateForm_TimeBasedTrigger
updateFS_TimeBasedTrigger
updateAreaReports_TimeBasedTrigger
updateDistrictReports_TimeBasedTrigger
updateZoneReports_TimeBasedTrigger
sharefileSystem_TimeBasedTrigger
    */
}

const list_of_menu_triggers = {
    /*
updateDataSheet_MenuTrigger_
updateFS_MenuTrigger_
updateAreaReports_MenuTrigger_
updateDistrictReports_MenuTrigger_
updateZoneReports_MenuTrigger_
importContacts_MenuTrigger_
markDuplicates_MenuTrigger_
loadAreaIDs_MenuTrigger_
    */

}

function trigger_DEMO() {
    meta_runner(meta_runner_trigger_demo, triggerTypes.DEBUG)
}

function meta_runner_trigger_demo() {
    Logger.log("Hello, and goodbye")
    return
}

function triggerTesting() {
    let trigger = ScriptApp.newTrigger("trigger_DEMO")
    trigger.timeBased().everyMinutes(6).create()
}