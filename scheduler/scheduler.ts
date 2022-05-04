// The Scheduler!  This bad boi's job is to execute functions at given intervals.  This will supersede triggers.ts and will (eventually) integrate with KIC-config.js for maximum configurability.

interface meta_runner_args {
    trigger: string,
    functionArg?: any,
    ignoreLockout?: boolean,
    shardNumber?:string|null
}

// This makes using the dLog 
function meta_runner(functionName:Function,args: meta_runner_args) {
    let logString = "[META_RUNNER] - Running " + functionName.name + " with trigger:" + args.trigger
    if(args.shardNumber != null) {logString += "RUNNING ON SHARD: "+args.shardNumber}
    if(args.ignoreLockout){ logString += " EXECUTION LOCKOUT IS DISABLED"}
    console.log(logString);

    let locker = new meta_locker(functionName.name,args.shardNumber)
    if (locker.isLocked()== true && args.ignoreLockout == false) {
        Logger.log("[META_RUNNER][META_LOCKER] Currently in Lockout, ending execution ")
        return
    } else {
        locker.lock()
        let dLog: dataLogger = new dataLogger(functionName.name,args.trigger, false,args.shardNumber);
        dLog.startFunction(functionName.name);
        try {
            if (args.functionArg == undefined) {    
                functionName(dLog);
            } else {
                Logger.log(typeof args.functionArg);
                functionName(args.functionArg, dLog);
            }
        } catch (error) {
            dLog.addFailure(functionName.name, error);
        }
        dLog.endFunction(functionName.name);
        dLog.end();
        locker.unlock() // I moved this in front of the dLogger bit because I shouldn't need it to run for things to work

    }
}


class meta_locker {
    
    functionName = "";
    appendString = "Some Random Words To Avoid Weird Problems";

    onShard = false;
    shardValue: string|null = null 

    cacheString = "UNDEFINED"
    constructor(functionName,shardString:null|string = null) {
        this.functionName = functionName
        if (shardString != null) {
            this.onShard = true
            this.shardValue = shardString
            this.cacheString = this.functionName + this.appendString + this.shardValue
            console.log("LOCK ON SHARD",shardString)
        } else {
            this.cacheString = this.functionName + this.appendString
            console.log("LOCK NOT SHARDED")
        }
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

function addTimeBasedTriggers() {
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
        triggerGuy.timeBased().everyWeeks(TriggerTime).onWeekDay(ScriptApp.WeekDay.TUESDAY).create()
        // Set to Tuesday because it's the day after p-Day, which is the big number reporting day.
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
    updateTimeBasedTriggers()
}