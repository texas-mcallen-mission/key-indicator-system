// DriveHandler Refactor

/*
External Functions used:
constructSheetData
isFileAccessible_
isFolderAccessible_
getMissionOrgData


*/

/*
current things in sheetData:
    folderName: 0,
    parentFolder: 1,
    folder: 2,
    sheetID1: 3,
    sheetID2: 4,
*/

function buildFSV4() {
    let allSheetData = constructSheetData();

    let orgData = getMissionOrgData(allSheetData)
    
    Logger.log(orgData)
    
    for (let zone in orgData) {
        
        for (let district in orgData[zone])
            
            for (let area in orgData[zone][district]) {
                let areaData = orgData[zone][district][area]
                console.log(zone, "zone", district, "district", areaData.areaName, "area",areaData.areaID)
            }

    }
}


function loadFilesystems(allSheetData) {
    let filesystems = {
        zone: {
            fsData: allSheetData.zoneFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.zone
        },
        district: {
            fsData: allSheetData.distFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.dist
        },
        area: {
            fsData: allSheetData.areaFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.area
        }
    };
    return filesystems
}

function verifyFSV4() {
    let allSheetData = constructSheetData()
    let filesystems = loadFilesystems(allSheetData)


    for(let filesystem in filesystems){
        verifySingleFilesysV4_(filesystems[filesystem]);
    }

    // this SHOULD be everything we need to do for the new FS verifier
}

function verifySingleFilesysV4_(filesystem) {
    let sheetDataObj = filesystem.fsData
    let sheetData: {any}[] = sheetDataObj.getData()
    let outData = []
    let failData = []
    for (let entry of sheetData) {
        let push = true;
        if (isFolderAccessible_(entry.folder)) { push = false; }
        if (isFolderAccessible_(entry.parentFolder)) { push = false; }
        if (entry.sheetID1 == "" || !isFileAccessible_(entry.sheetID1)) {entry.sheetID1 = "";}
        if (entry.sheetID2 == "" || !isFileAccessible_(entry.sheetID2)) {entry.sheetID2 = "";}
        if (!push) {
            console.log("entry does not exist ", entry.folderName);
            failData.push(entry)
        }
        if (push) {outData.push(entry)}
    }
    // sheetDataObj.clearContent() // not quite sure if this needs to be there or not, but according to the documentation, it does.
    // the implemetation shows that setData actually internally uses setValues, which means that it will wipe out old data. 
    sheetDataObj.setData(outData)
    console.log(failData)
}