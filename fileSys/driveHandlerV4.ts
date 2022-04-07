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
    rawData = {};
    constructor(folderName, parentFolder, folder, sheetID1, sheetID2, areaID, areaName, folderBaseName) {
        this.rawData = {

            folderName: folderName,
            parentFolder: parentFolder,
            folder: folder,
            sheetID1: sheetID1,
            sheetID2: sheetID2,
            areaID: areaID,
            areaName: areaName,
            folderBaseName: folderBaseName,
        };

    }
    get data() {
        return this.rawData;
    }
}


function createOrGetFsEntry(filesystem, folderNameString,parentFolderId) {
    let outEntry = {}
    let createdNew = false
    if (filesystem.existingFolders.includes(zone)) {

        console.info("fs entry already exists for ", zone);
        let currIndex = filesystems[filesystem.fsScope].sheetData.indexOf(folderNameString);
        // console.log(zone, filesystems["zone"].sheetData[currIndex])
        outEntry = filesystem.sheetData[currIndex];
    } else {
        let folderString = zone;
        if (INTERNAL_CONFIG.fileSystem.includeScopeInFolderName) {
            folderString += filesystems.zone.fsScope;
        }
        console.log("creating FSentry for ", zone);
        let preEntry = new fsEntry(folderString, parentFolderId, "<FOLDER ID>", "<REPORT1>", "<REPORT2>", "<AREA ID>", "<AREA NAME>", zone);
        // filesystem.sheetData.push(outEntry);
        outEntry = preEntry.data;
        createdNew = true
        // zoneOutData.push(zoneEntry);
    }
    return {
        entry: outEntry,
        isNew:createdNew
    }
}

function buildFSV4() {

    let allSheetData = constructSheetData();

    let orgData = getMissionOrgData(allSheetData);

    Logger.log(orgData);

    let filesystems = loadFilesystems(allSheetData);

    let reportBaseFolderId = getOrCreateReportFolder();

    let zoneOutData = [];
    zoneOutData.push(...filesystems.zone.sheetData)
    // let zoneNewData = [];

    for (let zone in orgData) {
        // this big if/else should get moved to its own function because it's going to get reused on all three levels
        let entryData = createOrGetFsEntry(filesystems.zone, zone, reportBaseFolderId)
        let zoneEntry = entryData.entry
        if(entryData.isNew) zoneOutData.push(zoneEntry)


        
        for (let district in orgData[zone]) {

            if (filesystems.district.existingFolders.includes(district)) {
                console.info("fs entry already exists for ", district);
            }
            for (let area in orgData[zone][district]) {
                if (filesystems.area.existingFolders.includes(area)) {
                    console.info("fs entry already exists for ", district);
                }
                let areaData = orgData[zone][district][area];
                // console.log(zone, "zone", district, "district", areaData.areaName, "area", areaData.areaID);
            }
        }


    }

    // for (let entry of zoneNewData) {
    //     filesystems["zone"].sheetData.push(entry.data);
    // }

    console.log("sending data to display");
    // for (let filesystem in filesystems) {
    //     filesystems[filesystem].fsData.setData(filesystems[filesystem].sheetData);
    // }
    filesystems.zone.fsData.setData(zoneOutData)
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
            sheetData: [],
            existingFolders: []
        },
        district: {
            fsData: allSheetData.distFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.dist,
            sheetData: [],
            existingFolders: []
        },
        area: {
            fsData: allSheetData.areaFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.area,
            sheetData: [],
            existingFolders: []
        }
    };
    for (let fs in filesystems) {
        let fsInter = filesystems[fs].fsData;
        filesystems[fs].sheetData.push(...fsInter.getData())
        filesystems[fs].existingFolders = buildIncludesArray(filesystems[fs].sheetData, "folderBaseName");

    }

    return filesystems;
}

function verifyFSV4() {
    let allSheetData = constructSheetData();
    let filesystems = loadFilesystems(allSheetData);


    for (let filesystem in filesystems) {
        verifySingleFilesysV4_(filesystems[filesystem]);
    }

    // this SHOULD be everything we need to do for the new FS verifier
}

function verifySingleFilesysV4_(filesystem) {
    let sheetDataObj = filesystem.fsData;
    let sheetData: { any; }[] = sheetDataObj.getData();
    let outData = [];
    let failData = [];
    for (let entry of sheetData) {
        let push = true;
        if (isFolderAccessible_(entry.folder)) { push = false; }
        if (isFolderAccessible_(entry.parentFolder)) { push = false; }
        if (entry.sheetID1 == "" || !isFileAccessible_(entry.sheetID1)) { entry.sheetID1 = ""; }
        if (entry.sheetID2 == "" || !isFileAccessible_(entry.sheetID2)) { entry.sheetID2 = ""; }
        if (!push) {
            console.log("entry does not exist ", entry.folderName);
            failData.push(entry);
        }
        if (push) { outData.push(entry); }
    }
    // sheetDataObj.clearContent() // not quite sure if this needs to be there or not, but according to the documentation, it does.
    // the implemetation shows that setData actually internally uses setValues, which means that it will wipe out old data. 
    sheetDataObj.setData(outData);
    console.log(failData);
}