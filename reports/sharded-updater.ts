// Goal:  Build three a shard updating thing, using caching 

function testShardUpdater1() {
    updateShard("Area")
}

function testShardUpdater2() {
    updateShard("District");
}

function testShardUpdater3() {
    updateShard("Zone")
}
function testShardUpdater4() {
    updateShard("Area");
}

function testShardUpdater5() {
    updateShard("District");
}

function testShardUpdater6() {
    updateShard("Zone");
}

// function updateShard1_Area() {
//     let scope = "Area";
//     let targetShard = "1";
//     let runner_args = {
//         trigger: triggerTypes.DEBUG,
//         functionArg: targetShard.toString(),
//         ignoreLockout: true,
//         shardNumber: targetShard.toString(),
//     };
//     meta_runner(updateAreaReportsV5, runner_args);
// }
// function updateShard2_Area() {
//     let scope = "Area";
//     let targetShard = "2";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard3_Area() {
//     let scope = "Area";
//     let targetShard = "3";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard4_Area() {
//     let scope = "Area";
//     let targetShard = "4";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard1_District() {
//     let scope = "District";
//     let targetShard = "1";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard2_District() {
//     let scope = "District";
//     let targetShard = "2";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard3_District() {
//     let scope = "District";
//     let targetShard = "3";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard4_District() {
//     let scope = "District";
//     let targetShard = "4";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard1_Zone() {
//     let scope = "Zone";
//     let targetShard = "1";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard2_Zone() {
//     let scope = "Zone";
//     let targetShard = "2";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard3_Zone() {
//     let scope = "Zone";
//     let targetShard = "3";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }
// function updateShard4_Zone() {
//     let scope = "Zone";
//     let targetShard = "4";
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true);
// }



function updateShard(scope: filesystemEntry["fsScope"]) {
    // this implementation is somewhat dumb and essentially requires things to take more than a minute to update to hit shards further down the line.
    let currentState:shardLockCache = loadShardCache()
    let scopeFunctionTargets = {
        "Zone": updateZoneReportsV5,
        "District": updateDistrictReportsV5,
        "Area":updateAreaReportsV5
    }
    let targetScope = currentState[scope]
    let worked = false
    let availableShards = []
    // TODO: make this a little smarter so that the first group of seeds isn't the only one getting updated in weird unloaded edge cases
    for (let i = 1; i <= INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards; i++){
        if (currentState[scope][i.toString()].active == false) {
            availableShards.push(i.toString())
        } else {
            if (i == INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards && availableShards.length == 0) {
                
                console.log("Nothing available to update on scope" + scope)
                return // breaks function, so we don't run anything else
            }
        }

    }
    // this should be a little smarter, because it'll pick one from the available shards at random instead of running the first one all the time.
    // BUGFIX:   was Math.floor(Math.random() * availableShards.length)
    // Making things be offset by 1 was a terrible idea in retrospect- should've handled zero differently from null / "" / undefined.  Oops.

    let targetShard:number = availableShards[Math.floor(Math.random() * (availableShards.length))]
    console.log("Scope: ",scope," available shards:",availableShards,"targeted shard:",targetShard)
    // currentState[scope][targetShard.toString()] = true;
    // setShardCache(currentState);
    // LOCKOUT as fast as possible
    shardLock_updateActivity(scope, targetShard.toString(),true)
    let runner_args: meta_runner_args = {
        trigger: triggerTypes.timeBased,
        functionArg: targetShard.toString(),
        ignoreLockout: true,
        shardNumber: targetShard.toString(),
        shardScope: scope,
        preLogData:turnArrayToString(availableShards)
    }
    meta_runner(scopeFunctionTargets[scope], runner_args)
    // currentState = loadShardCache();
    // currentState[scope][targetShard.toString()] = false;
    // setShardCache(currentState)
    shardLock_updateActivity(scope, targetShard.toString(), false)
    console.log(loadShardCache())
    

}


function turnArrayToString(array) {
    let outString = "[";
    for (let i in array) {
        let entry = array[i];
        if (entry.constructor.name == "Array") {
            outString += turnArrayToString(entry);

        } else {
            outString += entry;
        }
        // formatting: if not the last entry in a stack, append a comma.
        if (+i != array.length - 1) { outString += ", "; }
    }
    outString += "]";
    return outString;
}

function shardLock_updateActivity(scope: filesystemEntry["fsScope"], shard: string, isActive: boolean) {
    let cacheValues = loadShardCache();
    let lastUpdateTime = new Date().getTime()
    cacheValues[scope][shard].active = isActive;
    cacheValues[scope][shard].lastUpdate = lastUpdateTime
    setShardCache(cacheValues);
}

// function testShardCache() {
//     let shardCacheValues = loadShardCache();
//     console.log(shardCacheValues);

//     shardCacheValues[Area][0].

//     setShardCache(shardCacheValues);

//     let testCache = loadShardCache();

//     console.log(shardCacheValues.Area[0]);

// }


type shardLockCache = {
    [index in filesystemEntry["fsScope"]]:shardSet
}
interface shardSet {
    [index:string]:shardEntry
}

interface shardEntry {
    active: boolean,
    lastUpdate:number,
}





function createShardValues():shardLockCache {
    let maxShards = INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards
    let output: shardLockCache = {"Zone": {},"District": {},"Area": {},
    }
    for (let scope of ["Zone", "District", "Area"]) {
        output[scope] = {}
        for (let i = 1; i <= maxShards; i++){
            let entry: shardEntry = {
                active: false,
                lastUpdate:0
            }
            output[scope][i.toString()] = entry
        }
        
    }
    return output
}
/**
 * Takes the output from JSON.parse'ing the cache and verifies that it matches the shardLockCache interface.
 *
 * @param {*} cacheOutput
 * @return {*}  {shardLockCache}
 */
function verifyCache(cacheOutput) :shardLockCache{
    let scopes = ["Zone", "District", "Area"];
    let testScope:string = scopes[Math.floor(Math.random() * scopes.length)]
    let testShard:string = Math.floor(Math.random()*INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards).toString()
    let testSet = cacheOutput[testScope][testShard]
    if (typeof testSet.active == 'boolean' && typeof +testSet.lastUpdate == 'number') {
        // Force convert cacheOutput's lastUpdate to type Number
        for (let scope of cacheOutput) {
            for (let shard of cacheOutput[scope])
                cacheOutput[scope][shard].lastUpdate = + cacheOutput[scope][shard].lastUpdate
        }
        return cacheOutput
    } else {
        console.warn("Cache did not verify, resetting")
        return createShardValues()
    }
}

function loadShardCache() {
    let cache = CacheService.getScriptCache()
    let cacheValues = cache.get(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key)
    if (cacheValues == null || cacheValues == "" || typeof cacheValues == undefined) {
        var cacheOutput = createShardValues()
    } else {
        var cacheOutput:shardLockCache = verifyCache(JSON.parse(cacheValues))
    }
    console.log(cacheOutput)
    return cacheOutput
}





function clearShardCache() {
    let cache = CacheService.getScriptCache();
    cache.remove(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key);
}

function setShardCache(shardCacheObject: shardLockCache) {
    let cacheValue = JSON.stringify(shardCacheObject)
    let cache = CacheService.getScriptCache()
    cache.put(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key, cacheValue)
}