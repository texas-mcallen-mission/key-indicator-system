// DriveHandler Refactor


function verifyFSV4() {
    let allSheetData = constructSheetData()

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
    }

    for(let filesystem in filesystems){
        verifySingleFilesysV4_(filesystems[filesystem]);
    }

    // this SHOULD be everything we need to do for the new FS verifier
}

/*
current things:
        folderName: 0,
        parentFolder: 1,
        folder: 2,
        sheetID1: 3,
        sheetID2: 4,
        */
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
            console.log("entry does not exist ", entry);
            failData.push(entry)
        }
    if (push) {outData.push(entry)}
    }
    // sheetDataObj.clearContent() // not quite sure if this needs to be there or not, but according to the documentation, it does.
    // the implemetation shows that setData actually internally uses setValues, which means that it will wipe out old data. 
    sheetDataObj.setData(outData)
    console.log(failData)
}

function verifySingleFilesysV3_REFERENCEONLY_(fsObj) {
    let newFsObj = [];
    Logger.log(fsObj);
    for (let i = 0; i < fsObj.length; i++) {
        let nuke = false;
        let folderAccess = isFolderAccessible_(fsObj[i].folder);
        let pFolderAccess = isFolderAccessible_(fsObj[i].parentFolder);
        // if (isFolderAccessible_(newFsObj[i].folder) == false) {
        //   nuke = true;
        // }
        // if (isFolderAccessible_(newFsObj[i].parentFolder) == false) {
        //   nuke = true;
        // }

        if (isSheetReal_(fsObj[i].sheetID1) == true) {
            // Logger.log(["Document Exists for",fsObj.name,": ",document])
        } else {
            fsObj[i].sheetID1 = "";
        }

        if (folderAccess == false || pFolderAccess == false) {
            Logger.log(["NUUUUKE", fsObj[i].name, fsObj[i].parentFolder, fsObj[i].folder, fsObj[i].sheetID1,]);

        } else {
            newFsObj.push(fsObj[i]);
        }
    }

    return newFsObj;
}