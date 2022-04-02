// # Treecapitator:  Prunes fs tree- if a folder is not in folder data or a document not in the tree, it's gonna get whacked.


function testTree() {
    let baseFolder = DriveApp.getFolderById(getOrCreateReportFolder())

    let filesInBase = baseFolder.getFiles();
    let foldersInBase = baseFolder.getFiles();

    let listOfFolderIDs = []
    let listOfFileIDs = []

    while (foldersInBase.hasNext()) {
        let currentFolder = foldersInBase.next()
        listOfFolderIDs.push(currentFolder.getId())
    }

    while (filesInBase.hasNext()) {
        let currentFile = filesInBase.next()
        listOfFileIDs.push(currentFile.getId())
    }
    console.log("file IDs: ", listOfFileIDs)
    console.log("folder IDs:",listOfFolderIDs)
}