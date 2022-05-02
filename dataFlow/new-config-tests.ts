// this is a test to see if I can let constructSheetData() coexist with remotes and keep cache working

/*
    local:
    form
    data
    contact
    debug


    remote:
    serviceRep
    tmmReport
    fbReferrals
    remoteData (If I add it, lol)

*/

/*
    This is about as simple as I could make the config while covering all the bases.
    sheetDataEntry is the required things to make a sheetData class
    sheetDataHolder is the way to make a big object of entries.

    columnConfig is how I get the any:number object necessary for configuring column position keys in sheetData.


*/

function testStringify() {
    let test = JSON.stringify(sheetDataConfig);
    console.log(test);

    let test2 = JSON.stringify(sheetDataConfig.local);
    console.log(test2);

    let allSheetDataLocal = constructSheetDataV2(sheetDataConfig.local);
    let allSheetDataRemote = constructSheetDataV2(sheetDataConfig.remote);
    // I think I can turn this bad boi into a cached sheetData again if I try hard enough

    let testingSheet = SpreadsheetApp.getActiveSpreadsheet();

    let jsonTestSheet = testingSheet.getSheetByName("JSON-testing");

    if (jsonTestSheet != null) {
        let localRange = jsonTestSheet.getRange(1, 1);
        localRange.setValue(JSON.stringify(allSheetDataLocal));
        let remoteRange = jsonTestSheet.getRange(2, 1);
        remoteRange.setValue(JSON.stringify(allSheetDataRemote));
    }
}


/**
 * constructSheetDataV2: creates an allSheetData type object, which should *ideally* be able to run from cache on remote targets as well!
 *
 * @param {manySheetDataEntries} target
 * @return {*}  {manySheetDatas}
 */
function constructSheetDataV2(target: manySheetDataEntries): manySheetDatas {
    let allSheetData: manySheetDatas = {};
    let keys: string[] = ["Constructed SheetData objects for:"];
    for (let key in target) {
        let entry: sheetDataEntry = target[key];
        
        let rawSheetData = new RawSheetData(entry);
        let sheetData = new SheetData(rawSheetData);
        keys.push(key);
        allSheetData[key] = sheetData;
    }
    // dunno if this will work or not yet, but we'll see!
    // syncDataFlowCols_(allSheetData.form, allSheetData.data)

    return allSheetData;
}

// {local:sheetDataEntry,remote:sheetDataEntry}


// function lol() {
//     let obj: { any:any } = {}
//     return obj
// }


