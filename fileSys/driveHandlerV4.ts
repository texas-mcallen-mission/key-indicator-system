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
    /* where you left off:
    	
TypeError: fsData is not iterable
buildIncludesArray	@ fileSys/driveHandlerV4.gs:81
loadFilesystems	@ fileSys/driveHandlerV4.gs:93
buildFSV4	@ fileSys/driveHandlerV4.gs:48

need to refactor that big if/else statement, and after that this should be ready to test.

Error	
TypeError: allSheetData.zoneFilesys.getSheetData is not a function

I might need to convert loadfilesystems into something that uses a class...???  There's gotta be a better way to do thta.

    */
    let allSheetData = constructSheetData();

    let orgData = getMissionOrgData(allSheetData)
    
    Logger.log(orgData)
    
    let filesystems = loadFilesystems(allSheetData)

    let reportBaseFolder = getOrCreateReportFolder()

    let zoneNewData = []

    for (let zone in orgData) {
        // this big if/else should get moved to its own function because it's going to get reused on all three levels
        if (filesystems.zone.existingFolders.includes(zone)) {
            
            console.info("fs entry already exists for " , zone)
        } else {
            let folderString = zone
            if (INTERNAL_CONFIG.fileSystem.includeScopeInFolderName) {
                folderString += filesystems.zone.fsScope
            }

            zoneNewData.push(new fsEntry(folderString,reportBaseFolder,"<FOLDER ID>","","","<AREA ID>","<AREA NAME>",zone))
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

    for (let entry of zoneNewData) {
        filesystems[zone].sheetData.push(entry.data)
    }

    console.log("sending data to display")
    for (let filesystem in filesystems) {
        filesystems[filesystem].setData(filesystems[filesystem].sheetData)
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
            sheetData: allSheetData.zoneFilesys.getSheetData(),
            existingFolders: buildIncludesArray(allSheetData.zoneFilesys.getSheetData(), "folderBaseName")
        },
        district: {
            fsData: allSheetData.distFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.dist,
            sheetData: allSheetData.zoneFilesys.getSheetData(),
            existingFolders: buildIncludesArray(allSheetData.distFilesys.getSheetData(), "folderBaseName")
        },
        area: {
            fsData: allSheetData.areaFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.area,
            sheetData: allSheetData.zoneFilesys.getSheetData(),
            existingFolders: buildIncludesArray(allSheetData.areaFilesys.getSheetData(), "folderBaseName")
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