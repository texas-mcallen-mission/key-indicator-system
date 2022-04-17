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
        dLog.endFunction(functionName.name);
        dLog.end();
        locker.unlock() // I moved this in front of the dLogger bit because I shouldn't need it to run for things to work

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


function deleteClockTriggers() {
    let triggers = ScriptApp.getProjectTriggers()
    for (let trigger of triggers) {
        if (trigger.getTriggerSource() == ScriptApp.TriggerSource.CLOCK) {
            ScriptApp.deleteTrigger(trigger);
        }
    }
}

function addTimeBasedTriggers()() {
    for (let trigger in CONFIG.scheduler.time_based_triggers) {
        let triggerDood = ScriptApp.newTrigger(trigger)
        triggerDood.timeBased().everyMinutes(CONFIG.scheduler.execution_wait_in_minutes).create()
    }
    for (let minuteTrigger in CONFIG.scheduler.time_based_triggers.minutes) {
        let triggerTime = CONFIG.scheduler.time_based_triggers.minutes[minuteTrigger]
        let triggerGuy = ScriptApp.newTrigger(minuteTrigger)
        triggerGuy.timeBased().everyMinutes(triggerTime).create()
    }
    for (let hourTrigger in CONFIG.scheduler.time_based_triggers.hours) {
        let triggerTime = CONFIG.scheduler.time_based_triggers.hours[hourTrigger];
        let triggerGuy = ScriptApp.newTrigger(hourTrigger);
        triggerGuy.timeBased().everyHours(triggerTime).create();
    }
    for (let dayTrigger in CONFIG.scheduler.time_based_triggers.days) {
        let triggerTime = CONFIG.scheduler.time_based_triggers.days[dayTrigger];
        let triggerGuy = ScriptApp.newTrigger(dayTrigger);
        triggerGuy.timeBased().everyDays(triggerTime).create();
    }
    for (let weekTrigger in CONFIG.scheduler.time_based_triggers.weeks) {
        let TriggerTime = CONFIG.scheduler.time_based_triggers.weeks[weekTrigger];
        let triggerGuy = ScriptApp.newTrigger(weekTrigger)
        triggerGuy.timeBased().everyWeeks(TriggerTime).create()
    }


    console.info("all time_based_triggers added")
}

function updateTimeBasedTriggers() {
    deleteClockTriggers()
    addTimeBasedTriggers()
    console.info("timeBased triggers updated")
}

function removeSheetTriggers() {
    let triggers = ScriptApp.getProjectTriggers()
    for (let trigger of triggers) {
        if (trigger.getTriggerSource() == ScriptApp.TriggerSource.SPREADSHEETS) {
            ScriptApp.deleteTrigger(trigger)
        }
    }
}

function addOnOpenTriggers() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    for (let trigger in CONFIG.scheduler.onOpen_triggers) {
        let triggerDood = ScriptApp.newTrigger(trigger)
        triggerDood.forSpreadsheet(spreadsheet).onOpen().create()
    }
}

function updateSpreadsheetTriggers() {
    removeSheetTriggers()
    addOnOpenTriggers()
}