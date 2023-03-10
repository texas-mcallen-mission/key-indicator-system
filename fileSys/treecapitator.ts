// Compiled using undefined undefined (TypeScript 4.6.3)
// # Treecapitator:  Prunes fs tree- if a folder is not in folder data or a document not in the tree, it's gonna get whacked.

// This was written before we knew about types and stuff- some very basic attempts have been made to make it at least a little easier to understand.

/**
 * @description removes folders and files that don't have entries in the filesystem sheets.  Makes it possible to drop the sheet and rebuild automatically and handle cleanup.
 * @global
 */
function pruneFS() {
    const allSheetData: manySheetDatas = constructSheetDataV3(["zoneFilesys","distFilesys","areaFilesys"]);

    const fsData = getFilesystemDocsAndFolders_(allSheetData);

    const baseFolderID = getOrCreateReportFolder()

    const currentFSData = getAllFoldersAndFiles_(baseFolderID)

    let foldersDeleted = 0

    for (const folder of currentFSData.folders) {
        if (!fsData.folders.includes(folder.id)) {
            folder.folder.setTrashed(true);
            foldersDeleted += 1
        }
    }

    let filesDeleted = 0
    for (const file of currentFSData.files) {
        if (!fsData.files.includes(file.id)) {
            file.file.setTrashed(true)
            filesDeleted += 1
        }
    }

    console.log("folders deleted",foldersDeleted," Files deleted: ",filesDeleted)
}


/**
 * @description tester function, written while testing this.
 */
function testGetFilesystemData() {
    const allSheetData:manySheetDatas = constructSheetDataV3(["zoneFilesys", "distFilesys", "areaFilesys"]);
    const fsData = getFilesystemDocsAndFolders_(allSheetData)

    for (const key in fsData) {
        for (const entry of fsData[key]) {
            console.log(key,entry)
        }
    }
}

/**
 * @description Gets the list of files and folders that *should* be there.
 * @param {manySheetDatas} allSheetData
 * @return {*}  {{files:string[],folders:string[]}}
 */
function getFilesystemDocsAndFolders_(allSheetData:manySheetDatas):{files:string[],folders:string[]} {

    const filesystems = {
        zoneFS: allSheetData.zoneFilesys,
        distFS: allSheetData.distFilesys,
        areaFS: allSheetData.areaFilesys
    };

    const docs = [];
    const folders = [];
    for (const fs in filesystems) {
        const data = getSingleFilesysData(filesystems[fs]);
        docs.push(...data.docs);
        folders.push(...data.folders);
    }

    return {
        files: docs,
        folders: folders
    };
}


function getSingleFilesysData(filesys) {
    const fsData = filesys.getData()
    const folderIDs:string[] = [];
    const sheetIDs:string[] = [];
    for (const entry of fsData) {
        if (entry.folderId != "") folderIDs.push(entry.folderId);
        if (entry.parentFolder != "") folderIDs.push(entry.parentFolder)
        if (entry.sheetID1 != "") sheetIDs.push(entry.sheetID1);
        if (entry.sheetID2 != "") sheetIDs.push(entry.sheetID2);
    }
    return {
        folders: folderIDs,
        docs: sheetIDs
    }
}


function testGetAllFoldersAndFiles() {
    const output = getAllFoldersAndFiles_(getOrCreateReportFolder());
    for (const folder of output.folders) {
        console.log(folder.id,folder.name)
    }
    for (const file of output.files) {
        console.log(file.id,file.name,file.type)
    }

}

/**
 * @description This function is not recursive and stops after three levels.  Could become recursive in the future, I just didn't know how to do that at the time.
 * @param {*} baseFolderID
 * @return {*} 
 */
function getAllFoldersAndFiles_(baseFolderID) {
    // currently this only goes three levels deep.  It's fairly easy to go further down, though- just add another subfolder loop or convert it to a while thingy or something like that
    const basefolder = DriveApp.getFolderById(baseFolderID);

    const subfolders = getSubfolders_(basefolder);
    const subSubfolders = [];
    const subsubsubfolders = [];
    for (const folder of subfolders) {
        // console.log(folder.id,folder.name)
        subSubfolders.push(...getSubfolders_(folder.folder));
    }
    for (const subfolder of subSubfolders) {
        // console.log(subfolder.id,subfolder.name)
        subsubsubfolders.push(...getSubfolders_(subfolder.folder));
    }

    // for (let subsubfolder of subsubsubfolders) {
    //     // console.log(subsubfolder.id,subsubfolder.name)
    // }

    const files = [];

    const combinedFolders = [];
    // combinedFolders.push(...basefolder)
    combinedFolders.push(...subfolders);
    combinedFolders.push(...subsubsubfolders);

    for (const folder of combinedFolders) {
        files.push(...getFiles_(folder.folder));
    }

    for (const file of files) {
        // console.log(file.type, file.id, file.name);
    }

    return {
        folders: combinedFolders,
        files: files
    };
}

function getSubfolders_(folder) {
    const output = [];
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
        var folder = subfolders.next();
        const subOutput = {
            folder: folder,
            id: folder.getId(),
            lastUpdated: folder.getLastUpdated(),
            owner: folder.getOwner(),
            name: folder.getName(),
            editors: folder.getEditors(),

        };
        output.push(subOutput);
    }
    return output;
}

function getFiles_(folder) {
    const output = [];
    const subfiles = folder.getFiles();
    while (subfiles.hasNext()) {
        const file = subfiles.next();
        const subOutput = {
            file: file,
            id: file.getId(),
            lastUpdated: file.getLastUpdated(),
            owner: file.getOwner(),
            name: file.getName(),
            editors: file.getEditors(),
            type: file.getMimeType(),

        };
        output.push(subOutput);
    }
    return output;
}