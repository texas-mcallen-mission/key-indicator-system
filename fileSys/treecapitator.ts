// Compiled using undefined undefined (TypeScript 4.6.3)
// # Treecapitator:  Prunes fs tree- if a folder is not in folder data or a document not in the tree, it's gonna get whacked.




function pruneFS() {
    let allSheetData = constructSheetData()

    let fsData = getFilesystemDocsAndFolders_(allSheetData);

    let baseFolderID = getOrCreateReportFolder()

    let currentFSData = getAllFoldersAndFiles_(baseFolderID)

    let foldersDeleted = 0

    for (let folder of currentFSData.folders) {
        if (!fsData.folders.includes(folder.id)) {
            folder.folder.setTrashed(true);
            foldersDeleted += 1
        }
    }

    let filesDeleted = 0
    for (let file of currentFSData.files) {
        if (!fsData.files.includes(file.id)) {
            file.file.setTrashed(true)
            filesDeleted += 1
        }
    }

    console.log("folders deleted",foldersDeleted," Files deleted: ",filesDeleted)
}



function testGetFilesystemData() {
    let allSheetData = constructSheetData()
    let fsData = getFilesystemDocsAndFolders_(allSheetData)

    for (let key in fsData) {
        for (let entry of fsData[key]) {
            console.log(key,entry)
        }
    }
}


function getFilesystemDocsAndFolders_(allSheetData) {

    let filesystems = {
        zoneFS: allSheetData.zoneFilesys,
        distFS: allSheetData.distFilesys,
        areaFS: allSheetData.areaFilesys
    };

    let docs = [];
    let folders = [];
    for (let fs in filesystems) {
        let data = getSingleFilesysData(filesystems[fs]);
        docs.push(...data.docs);
        folders.push(...data.folders);
    }

    return {
        files: docs,
        folders: folders
    };
}


function getSingleFilesysData(filesys) {
    let fsData = filesys.getData()
    let folderIDs = [];
    let sheetIDs = [];
    for (let entry of fsData) {
        if (entry.folderId != "") folderIDs.push(entry.folderId);
        if (entry.parentFolder != "") folderIDs.push(entry.parentFolder)
        if (entry.sheetID1 != "") sheetIDs.push(entry.sheetID1);
        if (entry.sheetID2 != "") sheetIDs.push(entry.sheetID2);
    }
    return {
        folders: folderIDs,
        docs:sheetIDs
    }
}


function testGetAllFoldersAndFiles() {
    let output = getAllFoldersAndFiles_(getOrCreateReportFolder());
    for (let folder of output.folders) {
        console.log(folder.id,folder.name)
    }
    for (let file of output.files) {
        console.log(file.id,file.name,file.type)
    }

}

function getAllFoldersAndFiles_(baseFolderID) {
    // currently this only goes three levels deep.  It's fairly easy to go further down, though- just add another subfolder loop or convert it to a while thingy or something like that
    let basefolder = DriveApp.getFolderById(baseFolderID);

    let subfolders = getSubfolders_(basefolder);
    let subSubfolders = [];
    let subsubsubfolders = [];
    for (let folder of subfolders) {
        // console.log(folder.id,folder.name)
        subSubfolders.push(...getSubfolders_(folder.folder));
    }
    for (let subfolder of subSubfolders) {
        // console.log(subfolder.id,subfolder.name)
        subsubsubfolders.push(...getSubfolders_(subfolder.folder));
    }

    // for (let subsubfolder of subsubsubfolders) {
    //     // console.log(subsubfolder.id,subsubfolder.name)
    // }

    let files = [];

    let combinedFolders = [];
    // combinedFolders.push(...basefolder)
    combinedFolders.push(...subfolders);
    combinedFolders.push(...subsubsubfolders);

    for (let folder of combinedFolders) {
        files.push(...getFiles_(folder.folder));
    }

    for (let file of files) {
        // console.log(file.type, file.id, file.name);
    }

    return {
        folders: combinedFolders,
        files: files
    };
}

function getSubfolders_(folder) {
    let output = [];
    let subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
        var folder = subfolders.next();
        let subOutput = {
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
    let output = [];
    let subfiles = folder.getFiles();
    while (subfiles.hasNext()) {
        var file = subfiles.next();
        let subOutput = {
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