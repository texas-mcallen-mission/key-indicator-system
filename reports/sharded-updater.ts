// Goal:  Build three a shard updating thing, using caching 

function testShardUpdater1() {
    updateShard("Area")
}

function testShardUpdater2() {
    updateShard("Area");
}

function testShardUpdater3() {
    updateShard("Zone")
}

function testShardUpdater4() {
    updateShard("Zone");
}

function testShardUpdater5() {
    updateShard("District");
}
function testShardUpdater6() {
    updateShard("District");
}

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
    for (let i = 1; i <= INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards; i++){
        // TODO: make this a little smarter so that the first group of seeds isn't the only one getting updated in weird unloaded edge cases
        if (currentState[scope][i.toString()] == false) {
            currentState[scope][i.toString()] = true
            setCacheValues(currentState)
            // LOCKOUT as fast as possible
            meta_runner(scopeFunctionTargets[scope], triggerTypes.timeBased,i.toString(),true)
            currentState = loadCacheValues()
            currentState[scope][i.toString()] = false
            setCacheValues(currentState)
        } else {
            if (i == INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards) {
                console.log("Nothing available to update on scope"+scope)
            }
        }
            
    }
}



type manyShardValues {
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
    cache.put(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key, cacheValue,
}