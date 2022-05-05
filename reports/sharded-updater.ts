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

function getSmallestGroup(shardKeys: manyShardEntries):manyShardEntries {
    let smallest: number = Number.MAX_SAFE_INTEGER
    let smallestSet: manyShardEntries = {}
    for (let key in shardKeys) {
        let keyValue:shardEntry = shardKeys[key]
        let updateTime: number = keyValue.lastUpdate
        if (updateTime == smallest) {
            smallestSet[key] = keyValue
        }
        if (updateTime < smallest) {
            smallest = updateTime
            smallestSet = {}
            smallestSet[key] = keyValue
        }
    }
    return smallestSet
    
}

interface manyShardEntries {
    [index:string]:shardEntry
}

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
    let availShardKeys: manyShardEntries = {}
    let lockedKeys = 0
    // TODO: make this a little smarter so that the first group of seeds isn't the only one getting updated in weird unloaded edge cases
    for (let i = 1; i <= INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards; i++){
        if (currentState[scope][i.toString()].active == false) {
            // availableShards.push(i.toString())
            availShardKeys[i.toString()] = currentState[scope][i.toString()]
            lockedKeys++
        } else {
            if (i == INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards && lockedKeys == INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards) {
                console.log("Nothing available to update on scope" + scope)
            }
        }

    }
    //T3_H5_R6: Choose from group of least recently updated shards.
    let smallGuys = getSmallestGroup(availShardKeys)
    let availableShards = []
    for (let entry in smallGuys) {
        availableShards.push(entry.toString())
    }

    let targetShard:string = availableShards[Math.floor(Math.random() * (availableShards.length))]
    console.log("Scope: ",scope," available shards:",availableShards,smallGuys,"targeted shard:",targetShard)
    // currentState[scope][targetShard.toString()] = true;
    // setShardCache(currentState);
    // LOCKOUT as fast as possible
    shardLock_updateActivity(scope, targetShard,true)
    let runner_args: meta_runner_args = {
        trigger: triggerTypes.timeBased,
        functionArg: targetShard,
        ignoreLockout: true,
        shardNumber: targetShard,
        shardScope: scope,
        preLogData:turnArrayToString(availableShards)
    }
    meta_runner(scopeFunctionTargets[scope], runner_args)
    // currentState = loadShardCache();
    // currentState[scope][targetShard.toString()] = false;
    // setShardCache(currentState)
    shardLock_updateActivity(scope, targetShard, false)
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
function updateCache(cacheOutput): shardLockCache {
    let scopes = ["Zone", "District", "Area"];
    let testScope: string = scopes[Math.floor(Math.random() * scopes.length)];
    let testShard: string = Math.floor(Math.random() * INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards).toString();
    let testSet = cacheOutput[testScope][testShard];
    // try {
    // if (typeof testSet["active"] == 'boolean' && typeof +testSet[lastUpdate] == 'number') {
    //     // Force convert cacheOutput's lastUpdate to type Number
    try {

        for (let scope in cacheOutput) {
            for (let shard in cacheOutput[scope])
            cacheOutput[scope][shard].lastUpdate = + cacheOutput[scope][shard].lastUpdate;
        }
        return cacheOutput;
    // }
    // } else {
    //     console.warn("Cache did not verify, resetting")
    //     return createShardValues()
    // }
    
    } catch (error) {
        console.warn(cacheOutput)
        console.error(error);
        return createShardValues()
    }
    // }
}
function loadShardCache() {
    let cache = CacheService.getScriptCache()
    let cacheValues = cache.get(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key)
    if (cacheValues == null || cacheValues == "" || typeof cacheValues == undefined) {
        var cacheOutput = createShardValues()
    } else {
        var cacheOutput:shardLockCache = updateCache(JSON.parse(cacheValues))
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