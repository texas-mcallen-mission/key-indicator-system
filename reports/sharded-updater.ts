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
//     meta_runner(scope, triggerTypes.timeBased, targetShard, true,targetShard);
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
    let currentState = loadCacheValues()
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
        if (currentState[scope][i.toString()] == false) {
            availableShards.push(i.toString())
        } else {
            if (i == INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards) {
                console.log("Nothing available to update on scope" + scope)
                return // breaks function, so we don't run anything else
            }
        }

    }
    // this should be a little smarter, because it'll pick one from the available shards at random instead of running the first one all the time.
    // BUGFIX:   was Math.floor(Math.random() * availableShards.length)
    // Making things be offset by 1 was a terrible idea in retrospect- should've handled zero differently from null / "" / undefined.  Oops.

    let targetShard:Number = availableShards[Math.floor(Math.random() * (availableShards.length))]
    console.log("available shards:",availableShards,"targeted shard:",targetShard)
    currentState[scope][targetShard.toString()] = true;
    setCacheValues(currentState);
    // LOCKOUT as fast as possible
    let runner_args: meta_runner_args = {
        trigger: triggerTypes.timeBased,
        functionArg: targetShard.toString(),
        ignoreLockout: false,
        shardNumber: targetShard.toString(),
    }
    meta_runner(scopeFunctionTargets[scope], runner_args)
    currentState = loadCacheValues();
    currentState[scope][targetShard.toString()] = false;
    setCacheValues(currentState)
    

}



type manyShardValues = {
    [index in filesystemEntry["fsScope"]]:shardValueSet
}

interface shardValueSet {
    [index:number]:boolean|null
}


function createShardValues():manyShardValues {
    let maxShards = INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards
    let output: manyShardValues = {}
    for (let scope of ["Zone", "District", "Area"]) {
        output[scope] = {}
        for (let i = 1; i <= maxShards; i++){
            output[scope][i.toString()] = false
        }
        
    }
    return output
}

function loadCacheValues() {
    let cache = CacheService.getScriptCache()
    let cacheValues = cache.get(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key)
    let cacheOutput: manyShardValues = {}
    if (cacheValues == null || cacheValues == "" || typeof cacheValues == undefined) {
        cacheOutput = createShardValues()
    } else {
        cacheOutput = JSON.parse(cacheValues)
    }
    console.log(cacheOutput)
    return cacheOutput
}

function testShardCache() {
    let shardCacheValues = loadCacheValues()
    console.log(shardCacheValues)
    
    shardCacheValues.Area[0] = true

    setCacheValues(shardCacheValues)

    let testCache = loadCacheValues()

    console.log(shardCacheValues.Area[0])

}

function clearShardCache() {
    let cache = CacheService.getScriptCache();
    cache.remove(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key);
}

function setCacheValues(shardCacheObject: manyShardValues) {
    let cacheValue = JSON.stringify(shardCacheObject)
    let cache = CacheService.getScriptCache()
    cache.put(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key, cacheValue)
}