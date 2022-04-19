// Goal:  Build three a shard updating thing, using caching 


function updateShard(scope) {
    let cache = CacheService.getScriptCache()
    let maxShards = INTERNAL_CONFIG.fileSystem.shardManager.number_of_shards

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
    for (let scope in INTERNAL_CONFIG.fileSystem.reportLevel) {
        let scopeVal = INTERNAL_CONFIG.fileSystem.reportLevel[scope];
        output[scope] = {}
        for (let i = 1; i <= maxShards; i++){
            output[scope][i] = false
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

function setCacheValues(shardCacheObject: manyShardValues) {
    let cacheValue = JSON.stringify(shardCacheObject)
    let cache = CacheService.getScriptCache()
    cache.put(INTERNAL_CONFIG.fileSystem.shardManager.shard_cache_base_key, cacheValue,
}