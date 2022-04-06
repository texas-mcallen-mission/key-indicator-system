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

class fsEntry {
    constructor(folderName, parentFolder, folder, sheetID1, sheetID2, areaID, areaName, folderBaseName) {
        this.data = {}
        this.data.folderName:folderName,
        this.data.parentFolder:parentFolder,
        this.data.folder:folder,
        this.data.sheetID1:sheetID1,
        this.data.sheetID2:sheetID2,
        this.data.areaID:areaID,
        this.data.areaName:areaName,
            this.data.folderBaseName: folderBaseName;
        
    }
    get data() {
        return this.data
    }
}




function buildFSV4() {
    let allSheetData = constructSheetData();

    let orgData = getMissionOrgData(allSheetData)
    
    Logger.log(orgData)
    
    let filesystems = loadFilesystems(allSheetData)

    let reportBaseFolder = getOrCreateReportFolder()

    

    for (let zone in orgData) {
        // this big if/else should get moved to its own function because it's going to get reused on all three levels
        if (filesystems.zone.existingFolders.includes(zone)) {
            
            console.info("fs entry already exists for " , zone)
        } else {
            let folderString = zone
            if (INTERNAL_CONFIG.fileSystem.includeScopeInFolderName) {
                folderString += filesystems.zone.fsScope
            }
            filesystems.zone.fsData.push(new fsEntry(folderString,reportBaseFolder,"<FOLDER ID>","","","<AREA ID>","<AREA NAME>",zone))
        }
        for (let district in orgData[zone])
            if (filesystems.district.existingFolders.includes(district)) {
                console.info("fs entry already exists for ", district)
            }
            for (let area in orgData[zone][district]) {
                if (filesystems.area.existingFolders.includes(area)) {
                    console.info("fs entry already exists for ", district)
                }
                let areaData = orgData[zone][district][area]
                console.log(zone, "zone", district, "district", areaData.areaName, "area",areaData.areaID)
            }

        
    }
    console.log("sending data to display")
    for (let filesystem in filesystems) {
        filesystems[filesystem].setData(filesystems[filesystem].fsData)
    }
}

function buildIncludesArray(fsData, key) {
    let outData = [];
    for (let entry of fsData) {
        if (entry != "" && entry != undefined) {
            outData.push(entry[key]);
        }
    }
    return outData;
}
function loadFilesystems(allSheetData) {
    let filesystems = {
        zone: {
            fsData: allSheetData.zoneFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.zone,
            existingFolders: buildIncludesArray(allSheetData.zoneFilesys, "folderBaseName")
        },
        district: {
            fsData: allSheetData.distFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.dist,
            existingFolders: buildIncludesArray(allSheetData.distFilesys, "folderBaseName")
        },
        area: {
            fsData: allSheetData.areaFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.area,
            existingFolders: buildIncludesArray(allSheetData.areaFilesys, "folderBaseName")
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