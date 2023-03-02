// The Scheduler!  This bad boi's job is to execute functions at given intervals.  This will supersede triggers.ts and will (eventually) integrate with KIC-config.js for maximum configurability.

interface meta_runner_args {
    trigger: string,
    functionArg?: string|number|boolean|object|null,
    ignoreLockout?: boolean,
    shardNumber?: string | null,
    
    shardScope?: string,
    preLogData?:string
    
}

// This makes using the dLog 
// to explain this eslint-disable:  This is supposed to call functions.  It's on purpose.
// eslint-disable-next-line @typescript-eslint/ban-types
function meta_runner_(functionName:Function,args: meta_runner_args) {
    let logString = "[META_RUNNER] - Running " + functionName.name + " with trigger:" + args.trigger
    if(args.shardNumber != null) {logString += " RUNNING ON SHARD: "+args.shardNumber}
    if(args.ignoreLockout){ logString += " EXECUTION LOCKOUT IS DISABLED"}
    console.log(logString);

    const locker = new meta_locker(functionName.name,args.shardNumber)
    if (locker.isLocked()== true && args.ignoreLockout == false) {
        console.log("[META_RUNNER][META_LOCKER] Currently in Lockout, ending execution ")
        return
    } else {
        locker.lock()
        const dLogArgs: debugLogArgs = {
            trigger: args.trigger,
            isInline: false,
            shardId: args.shardNumber,
            scopeValue:args.shardScope
        }

        if(args.preLogData != undefined){dLogArgs.logString = args.preLogData}
        const dLog: dataLogger = new dataLogger(functionName.name,dLogArgs);

        dLog.startFunction(functionName.name);
        try {
            if (args.functionArg == undefined) {
                functionName(dLog);
            } else {
                console.log(typeof args.functionArg);
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
            console.log("LOCK ON SHARD", shardString, "Cache String: ",  this.cacheString)
        } else {
            this.cacheString = this.functionName + this.appendString
            console.log("LOCK NOT SHARDED")
        }
    }

    isLocked() {
        const cache = CacheService.getScriptCache()
        const cacheData = cache.get(this.cacheString)
        if (!cacheData) {
            return false
        } else {
            return true
            console.warn("[META_RUNNER] : CACHE LOCKOUT FOR ", this.functionName)
        }
    }

    lock() {
        const cache = CacheService.getScriptCache()
        cache.put(this.cacheString,"true",CONFIG.scheduler.meta_locker.cacheTimeoutTime)
    }

    unlock() {
        const cache = CacheService.getScriptCache()
        cache.remove(this.cacheString)
    }

}


function deleteClockTriggers() {
    const triggers = ScriptApp.getProjectTriggers()
    for (const trigger of triggers) {
        if (trigger.getTriggerSource() == ScriptApp.TriggerSource.CLOCK) {
            ScriptApp.deleteTrigger(trigger);
        }
    }
}

/**
 * @description updates all time-based triggers.
 */
function updateSpreadsheetTriggers() {
    removeSheetTriggers();
    addOnOpenTriggers();
    updateTimeBasedTriggers();
}

function addTimeBasedTriggers() {
    for (const minuteTrigger in CONFIG.scheduler.time_based_triggers.minutes) {
        const triggerTime = CONFIG.scheduler.time_based_triggers.minutes[minuteTrigger]
        const triggerGuy = ScriptApp.newTrigger(minuteTrigger)
        triggerGuy.timeBased().everyMinutes(triggerTime).create()
    }
    for (const hourTrigger in CONFIG.scheduler.time_based_triggers.hours) {
        const triggerTime = CONFIG.scheduler.time_based_triggers.hours[hourTrigger];
        const triggerGuy = ScriptApp.newTrigger(hourTrigger);
        triggerGuy.timeBased().everyHours(triggerTime).create();
    }
    for (const dayTrigger in CONFIG.scheduler.time_based_triggers.days) {
        const triggerTime = CONFIG.scheduler.time_based_triggers.days[dayTrigger];
        const triggerGuy = ScriptApp.newTrigger(dayTrigger);
        triggerGuy.timeBased().everyDays(triggerTime).create();
    }
    for (const weekTrigger in CONFIG.scheduler.time_based_triggers.weeks) {
        const TriggerTime = CONFIG.scheduler.time_based_triggers.weeks[weekTrigger];
        const triggerGuy = ScriptApp.newTrigger(weekTrigger)
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
    const triggers = ScriptApp.getProjectTriggers()
    for (const trigger of triggers) {
        if (trigger.getTriggerSource() == ScriptApp.TriggerSource.SPREADSHEETS) {
            ScriptApp.deleteTrigger(trigger)
        }
    }
}

function addOnOpenTriggers() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    for (const trigger in CONFIG.scheduler.onOpen_triggers) {
        const triggerDood = ScriptApp.newTrigger(trigger)
        triggerDood.forSpreadsheet(spreadsheet).onOpen().create()
    }
}

