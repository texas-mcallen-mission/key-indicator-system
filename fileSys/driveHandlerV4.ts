// DriveHandler Refactor

/*
External Functions used:
constructSheetData
isFileAccessible_
isFolderAccessible_
getMissionOrgData
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


function buildFSV4() {

    let allSheetData = constructSheetData();

    let orgData = getMissionOrgData(allSheetData);

    Logger.log(orgData);

    let filesystems = loadFilesystems_(allSheetData);

    let reportBaseFolderId = getOrCreateReportFolder();
    
    for (let zone in orgData) {
        // this big if/else should get moved to its own function because it's going to get reused on all three levels
        let zoneEntryData = createOrGetFsEntry_(filesystems.zone, zone, reportBaseFolderId)
        let zoneEntry = zoneEntryData.entry
        if (zoneEntryData.isNew) filesystems.zone.sheetData.push(zoneEntry)


        
        for (let district in orgData[zone]) {
            let distEntryData = createOrGetFsEntry_(filesystems.district, district, zoneEntry.folderName);
            let distEntry = distEntryData.entry;
            if (distEntryData.isNew) filesystems.district.sheetData.push(distEntry)
            
            for (let area in orgData[zone][district]) {
                let areaData = orgData[zone][district][area];
                let areaEntryData = createOrGetFsEntry_(filesystems.area, areaData.areaName, distEntry.folderName)
                let areaEntry = areaEntryData.entry
                if(areaEntryData.isNew) filesystems.area.sheetData.push(areaEntry)
                // if (filesystems.area.existingFolders.includes(area)) {
                //     console.info("fs entry already exists for ", district);
                // }
                // console.log(zone, "zone", district, "district", areaData.areaName, "area", areaData.areaID);
            }
        }


    }

    // for (let entry of zoneNewData) {
    //     filesystems["zone"].sheetData.push(entry.data);
    // }

    console.log("sending data to display");
    for (let filesystem in filesystems) {
        filesystems[filesystem].fsData.setData(filesystems[filesystem].sheetData);
    }
    // filesystems.zone.fsData.setData(filesystems.zone.sheetData)
}

function createOrGetFsEntry_(filesystem, folderNameString, parentFolderId) {
    let outEntry = {};
    let createdNew = false;
    if (filesystem.existingFolders.includes(folderNameString)) {

        console.info("fs entry already exists for ", folderNameString);
        let currIndex = filesystem.sheetData.indexOf(folderNameString);
        // console.log(zone, filesystems["zone"].sheetData[currIndex])
        outEntry = filesystem.sheetData[currIndex];
    } else {
        let folderString = folderNameString;
        if (INTERNAL_CONFIG.fileSystem.includeScopeInFolderName) {
            folderString += filesystem.fsScope;
        }
        console.log("creating FSentry for ", folderNameString);
        let preEntry = new fsEntry(folderString, parentFolderId, "<FOLDER ID>", "<REPORT1>", "<REPORT2>", "<AREA ID>", "<AREA NAME>", folderNameString);
        // filesystem.sheetData.push(outEntry);
        outEntry = preEntry.data;
        createdNew = true;
        // zoneOutData.push(zoneEntry);
    }
    return {
        entry: outEntry,
        isNew: createdNew
    };
}
function buildIncludesArray_(fsData, key) {
    let outData = [];
    for (let entry of fsData) {
        if (entry != "" && entry != undefined) {
            outData.push(entry[key]);
        }
    }
    return outData;
}
function loadFilesystems_(allSheetData) {
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
        // disabled during testing to completely refresh the fs every time
        // filesystems[fs].sheetData.push(...fsInter.getData())
        // filesystems[fs].existingFolders = buildIncludesArray_(filesystems[fs].sheetData, "folderBaseName");

    }

    return filesystems;
}

function verifyFSV4() {
    let allSheetData = constructSheetData();
    let filesystems = loadFilesystems_(allSheetData);


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