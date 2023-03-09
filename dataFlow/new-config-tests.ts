// this is a test to see if I can let constructSheetDataV3() coexist with remotes and keep cache working

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

function testStringify() { // maybe problems with constructSheetDataV3
    const test = JSON.stringify(sheetDataConfig);
    console.log(test);

    const test2 = JSON.stringify(sheetDataConfig);
    console.log(test2);
    const allSheetData: manySheetDatas = constructSheetDataV3(["remote"]);
    // let allSheetDataRemote = constructSheetDataV2(sheetDataConfig.remote);
    // I think I can turn this bad boi into a cached sheetData again if I try hard enough

    const testingSheet = SpreadsheetApp.getActiveSpreadsheet();

    const jsonTestSheet = testingSheet.getSheetByName("JSON-testing");

    if (jsonTestSheet != null) {
        const localRange = jsonTestSheet.getRange(1, 1);
        localRange.setValue(JSON.stringify(allSheetData));
        const remoteRange = jsonTestSheet.getRange(2, 1);
        remoteRange.setValue(JSON.stringify(allSheetData));
    }
}


// /**
//  * constructSheetDataV2: creates an allSheetData type object, which should *ideally* be able to run from cache on remote targets as well!
//  *
//  * @param {manySheetDataEntries} target
//  * @return {*}  {manySheetDatas}
//  */
// function constructSheetDataV2(target: manySheetDataEntries): manySheetDatas {
//     const allSheetData: manySheetDatas = {};
//     const keys: string[] = ["Constructed SheetData objects for:"];
//     for (const key in target) {
//         const entry: sheetDataEntry = target[key];
        
//         const rawSheetData = new RawSheetData(entry);
//         const sheetData = new SheetData(rawSheetData);
//         keys.push(key);
//         allSheetData[key] = sheetData;
//     }
//     // dunno if this will work or not yet, but we'll see!
//     // syncDataFlowCols_(allSheetData.form, allSheetData.data)

//     return allSheetData;
// }

/**
 * constructSheetDataV3: creates an allSheetData type object, which should *ideally* be able to run from cache on remote targets as well! returns only the ones you need or it return all of them.
 *
 * @param {string[] | void} target
 * @return {*}  {manySheetDatas}
 */
function constructSheetDataV3(target: string[] | void) : manySheetDatas {
    const allSheetData: manySheetDatas = {};
    let targetSheets:string[] = []
    if (!target) {
        targetSheets = Object.keys(sheetDataConfig)
    } else {
        targetSheets = [...target]
    }

    for (const entry of targetSheets) {
        allSheetData[entry] = new SheetData(new RawSheetData(sheetDataConfig[entry]))
    }

    return allSheetData;
}



// {local:sheetDataEntry,remote:sheetDataEntry}


// function lol() {
//     let obj: { any:any } = {}
//     return obj
// }


