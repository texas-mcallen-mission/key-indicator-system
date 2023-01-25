// DriveHandler Refactor

/*
External Functions used:
constructSheetData
isFileAccessible_
isFolderAccessible_
getMissionOrgData
*/

/* TOP-LEVEL FUNCTIONS:
    buildFSV4() - creates filesystems- will reuse whatever is currently stored

    verifyFSV4() - checks to make sure that all sheet id's and folders actually exist.
    - this version only clears sheetid's that don't exist instead of deleting the whole thing, which is IMO better
*/

/*
    folderName: string, parentFolder: string, folderId: string, sheetID1: string | null, sheetID2: string | null, areaID: string, folderBaseName: string, seedId: string | number,

*/

class fsEntry {
    rawData:filesystemData = {
        folderName: '',
        parentFolder: '',
        folderId: '',
        sheetID1: '',
        sheetID2: '',
        areaID: '',
        folderBaseName: '',
        seedId: -1,
    };
    constructor(folderName: string, parentFolder: string, folderId: string, sheetID1: string | null, sheetID2: string | null, areaID: string, folderBaseName: string, seedId: string | number = 0) {
        this.rawData = {

            folderName: folderName,
            parentFolder: parentFolder,
            folderId: folderId,
            sheetID1: sheetID1,
            sheetID2: sheetID2,
            areaID: areaID,
            folderBaseName: folderBaseName,
            seedId: seedId
        };

    }
    get data():filesystemData {
        return this.rawData;
    }
}

function updateFSV4() {
    const allSheetData = constructSheetDataV2(sheetDataConfig.local)
    verifyFSV4(allSheetData)
    clearAllSheetDataCache()
    buildFSV4()
    updateShards()
}



function buildFSV4(allSheetData = constructSheetData()) {
    
    const orgData = getMissionOrgData(allSheetData);
    if (!Object.prototype.hasOwnProperty.call(orgData, "contact")) {
        throw "unable to build FS, contact data tab declaration is missing."
    }
    console.log(orgData);

    const filesystems:manyFilesystemEntries = loadFilesystems_(allSheetData);

    const reportBaseFolderId = getOrCreateReportFolder();
    
    for (const zone in orgData) {
        // this big if/else should get moved to its own function because it's going to get reused on all three levels
        const zoneEntryData = createOrGetFsEntry_(filesystems.Zone, zone, reportBaseFolderId,"" )
        const zoneEntry = zoneEntryData.entry
        if (zoneEntryData.isNew) filesystems.Zone.sheetData.push(zoneEntry)
        const zoneAreaIds = []

        
        for (const district in orgData[zone]) {
            
            const distEntryData = createOrGetFsEntry_(filesystems.District, district, zoneEntry.folderId, "");
            const distAreaIds = []
            const distEntry = distEntryData.entry;
            if (distEntryData.isNew) filesystems.District.sheetData.push(distEntry)
            
            for (const area in orgData[zone][district]) {
                const areaData = orgData[zone][district][area];
                
                distAreaIds.push(areaData.areaID)
                const areaEntryData = createOrGetFsEntry_(filesystems.Area, areaData.areaName, distEntry.folderId, areaData.areaID)
                const areaEntry = areaEntryData.entry
                if(areaEntryData.isNew) filesystems.Area.sheetData.push(areaEntry)
            }

            distEntry.areaID = distAreaIds.join()
            zoneAreaIds.push(...distAreaIds)
        }

        zoneEntry.areaID = zoneAreaIds.join()


    }

    console.log("sending data to display");
    for (const filesystem in filesystems) {
        filesystems[filesystem].fsData.setData(filesystems[filesystem].sheetData);
    }
    // filesystems.zone.fsData.setData(filesystems.zone.sheetData)
    //
}

function createOrGetFsEntry_(filesystem, folderNameString: string, parentFolderId: string, areaId: string): { entry: filesystemData, isNew: boolean } {
    let outEntry: filesystemData = {
        folderName: '',
        parentFolder: '',
        folderId: '',
        sheetID1: '',
        sheetID2: '',
        areaID: '',
        folderBaseName: '',
        seedId: -1
    }
    let createdNew = false;
    if (filesystem.existingFolders.includes(folderNameString)) {

        console.info("fs entry already exists for ", folderNameString);
        // if there's weird errors, it's probably because things got out of whack here.
        const currIndex = filesystem.existingFolders.indexOf(folderNameString);
        // console.log(zone, filesystems["zone"].sheetData[currIndex])
        outEntry = filesystem.sheetData[currIndex];
    } else {
        let folderString = folderNameString;
        if (CONFIG.fileSystem.includeScopeInFolderName) {
            folderString += " " + filesystem.fsScope;
        }
        console.log("creating FSentry for ", folderNameString);
        const folderId = createNewFolderV4_(parentFolderId, folderString)
        const preEntry = new fsEntry(folderString, parentFolderId,folderId,"", "", areaId, folderNameString).data
        // filesystem.sheetData.push(outEntry);
        outEntry = preEntry;
        createdNew = true;
        // zoneOutData.push(zoneEntry);
    }
    return {
        entry: outEntry,
        isNew: createdNew
    };
}

function createNewFolderV4_(parentFolderId, name) {
    // creates new folder in parent folder, and then returns that folder's ID.
    // TODO: Potentially implement a caching thing with a global object to speed up second and third occurences of creating the same folderObject?
    console.log(parentFolderId);
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    const newFolder = parentFolder.createFolder(name);
    const newFolderID = newFolder.getId();
    return newFolderID;
}
function buildIncludesArray_(fsData, key) {
    const outData = [];
    for (const entry of fsData) {
        if (entry != "" && entry != undefined) {
            outData.push(entry[key]);
        }
    }
    return outData;
}

type manyFilesystemEntries = {
    [index in filesystemEntry["fsScope"]]: filesystemEntry;
};
interface filesystemEntry {
    fsData: SheetData,
    fsScope: "Zone" | "District" | "Area",
    sheetData: filesystemData[]
    existingFolders: GoogleAppsScript.Drive.Folder[]
    reportTemplate:string
}

interface manyFilesystemDatas {
    [index:string]:filesystemData,
}

/**
 *  @description interface that defines the keys available on a filesystem entry
 *
 * @interface filesystemData
 */
interface filesystemData extends kiDataEntry {
    folderName: string,
    parentFolder: string,
    folderId: string,
    sheetID1: string | null,
    sheetID2: string | null,
    areaID: string, // comma-separated values.
    folderBaseName: string,
    seedId: string | number,
}

/**
 * Loads filesystems with everything you need to get stuff going.  Used by DriveHandler & reportCreator
 * Keys: "Zone","District","Area"
 * 
 * @param {*} allSheetData
 * @return {manyFilesystemEntries}  wheeee
 */
function loadFilesystems_(allSheetData):manyFilesystemEntries {
    const filesystems:manyFilesystemEntries = {
        Zone: {
            fsData: allSheetData.zoneFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.zone,
            sheetData: [],
            existingFolders: [],
            reportTemplate:CONFIG.reportCreator.docIDs.zoneTemplate
        },
        District: {
            fsData: allSheetData.distFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.dist,
            sheetData: [],
            existingFolders: [],
            reportTemplate: CONFIG.reportCreator.docIDs.distTemplate
        },
        Area: {
            fsData: allSheetData.areaFilesys,
            fsScope: CONFIG.fileSystem.reportLevel.area,
            sheetData: [],
            existingFolders: [],
            reportTemplate: CONFIG.reportCreator.docIDs.areaTemplate
        }
    };
    for (const fs in filesystems) {
        const fsInter = filesystems[fs].fsData;
        filesystems[fs].sheetData.push(...fsInter.getData())
        filesystems[fs].existingFolders = buildIncludesArray_(filesystems[fs].sheetData, "folderBaseName");

    }

    return filesystems;
}

function verifyFSV4(allSheetData = constructSheetData()) {
    const filesystems = loadFilesystems_(allSheetData);

    for (const filesystem in filesystems) {
        verifySingleFilesysV4_(filesystems[filesystem]);
    }

    // this SHOULD be everything we need to do for the new FS verifier
}

function verifySingleFilesysV4_(filesystem: filesystemEntry) {
    const sheetDataObj = filesystem.fsData;
    
    const sheetData: filesystemData[] = convertToFilesystemData(sheetDataObj.getData());
    const outData:filesystemData[] = [];
    const failData: filesystemData[] = [];
    for (const entry of sheetData) {
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