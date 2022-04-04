// Compiled using undefined undefined (TypeScript 4.6.3)
// # Treecapitator:  Prunes fs tree- if a folder is not in folder data or a document not in the tree, it's gonna get whacked.


function testGetFilesystemData() {
    let allSheetData = constructSheetData()
    let fsData = getFilesystemDocsAndFolders(allSheetData)

    for (let key in fsData) {
        for (let entry of fsData[key]) {
            console.log(key,entry)
        }
    }
}

function getFilesystemDocsAndFolders(allSheetData) {

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
        docs: docs,
        folders: folders
    };
}

function getFilesystemDocsAndFoldersOld(allSheetData) {
    let zoneFS = allSheetData.zoneFilesys;
    let distFS = allSheetData.distFilesys
    let areaFS = allSheetData.areaFilesys
    
    let zoneData = getSingleFilesysData(zoneFS)
    let distData = getSingleFilesysData(distFS)
    let areaData = getSingleFilesysData(areaFS)

    let allFolders = []
    allFolders.push(...zoneData.folders)
    allFolders.push(...distData.folders)
    allFolders.push(...areaData.folders)

    let allDocs = []
    allDocs.push(...zoneData.docs);
    allDocs.push(...distData.docs);
    allDocs.push(...areaData.docs);

    return {
        folders: allFolders,
        docs:allDocs
    }

}

function getSingleFilesysData(filesys) {
    let fsData = filesys.getData()
    let folderIDs = [];
    let sheetIDs = [];
    for (let entry of filesys) {
        if (entry.folder != "") folderIDs.push(entry.folder);
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