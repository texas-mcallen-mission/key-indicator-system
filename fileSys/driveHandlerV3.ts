//@ts-check


function createFS(dLog:dataLogger = new dataLogger("createFS",triggerTypes.manual,true)) {
    dLog.startFunction("createFilesystemV3")
    try {
        createFilesystemV3();
    } catch (error) {
        dLog.addFailure("createFilesystemV3", error)
    }
    dLog.endFunction("createFilesystemV3")
    if (dLog.isInline == true) { dLog.end(); }// if this is the parent function, end logging
}


function updateFS(dLog: dataLogger = new dataLogger("updateFS", triggerTypes.manual,true)) {
    dLog.startFunction("verifyFilesystem")
    try {
        verifyFilesystem()
        
    } catch (error) {
        dLog.addFailure("verifyFilesystem", error)
    }
    dLog.endFunction("verifyFilesystem")
    dLog.startFunction("createFilesystemV3")
    try {
        createFilesystemV3()
    } catch (error) {
        dLog.addFailure("createFilesystemV3", error)
    }
    dLog.endFunction("createFilesystemV3")
    if (dLog.isInline == true) { dLog.end(); }// if this is the parent function, end logging
}


function verifyFilesystem() {
    let allSheetData = constructSheetData();
    Logger.log("initializing filesystem");
    let zoneMeta = dataLoader_(allSheetData,
        CONFIG.fileSystem.reportLevel.zone); //FYI: I newlined that manually so it's more readable; it's not a formatter thing. You can change it back if you want.
    let distMeta = dataLoader_(allSheetData,
        CONFIG.fileSystem.reportLevel.dist);
    let areaMeta = dataLoader_(allSheetData,
        CONFIG.fileSystem.reportLevel.area);

    Logger.log("Beginning Verification");
    let zoneFSupdated = verifySingleFilesysV3_(zoneMeta.fsObj);
    let distFSupdated = verifySingleFilesysV3_(distMeta.fsObj);
    let areaFSupdated = verifySingleFilesysV3_(areaMeta.fsObj);

    Logger.log("Converting FSobj to writeable data");
    let zoneOutData = getDataFromArray_(zoneFSupdated, zoneMeta.sheetData);
    let distOutData = getDataFromArray_(distFSupdated, distMeta.sheetData);
    let areaOutData = getDataFromArray_(areaFSupdated, areaMeta.sheetData);
    Logger.log("writing data");
    sendDataToDisplayV3_(zoneMeta.splitData.header, zoneOutData, zoneMeta.sheet);
    sendDataToDisplayV3_(distMeta.splitData.header, distOutData, distMeta.sheet);
    sendDataToDisplayV3_(areaMeta.splitData.header, areaOutData, areaMeta.sheet);
    Logger.log("DONE");
}

function verifySingleFilesysV3_(fsObj) {
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

// this little one-liner gets the root folder of the drive in case the reports folder is not found.
var reportRootFolder = DriveApp.getFileById(
    SpreadsheetApp.getActiveSpreadsheet().getId()
)
    .getParents()
    .next()
    .getId();

/*
 * @param {{ zoneFilesys: any; distFilesys: any; areaFilesys: any; }} allSheetData
 * @param {string} scope
 */
function dataLoader_(allSheetData, scope) {
    let sheetDataClass;

    switch (scope) {
        case CONFIG.fileSystem.reportLevel.zone:
            sheetDataClass = allSheetData.zoneFilesys;
            break;
        case CONFIG.fileSystem.reportLevel.dist:
            sheetDataClass = allSheetData.distFilesys;
            break;
        case CONFIG.fileSystem.reportLevel.area:
            sheetDataClass = allSheetData.areaFilesys;
    }
    let sheetObj = sheetDataClass.getSheet();
    // split will have to get changed once Elder Gerlek updates his chunks; headerSplit_ won't need to exist for much longer.
    let split = headerSplit_(sheetObj.getDataRange().getValues());
    let fsObj = loadFSIntoClass_(split.data, sheetDataClass);

    return {
        sheetData: sheetDataClass,
        sheet: sheetObj,
        splitData: split,
        fsObj: fsObj,
    };
}

function testOrgData() {
    let allSheetData = constructSheetData();

    let contacts = getContactData(allSheetData);
    let contactSheetData = allSheetData.contact;
}

// NEXT STEP: MAKE A FS VERIFIER.  NOT SURE HOW TO DO THAT YET BUT SHOULD BE GOOD

function createFilesystemV3() {
    // TODO Remove this comment
    //WHERE YOU LEFT OFF:
    /*
      Elder Gerlek's Mission Org data thingy lets me do the triple-loop thingy the way I wanted to in the first place.
       All I've gotta do now is figure out how to iterate through it and check to see if a folder already exists
      This function is written but untested as of 1/15/2022 5:// former ignore
    */

    reportRootFolder = getOrCreateReportFolder();
    let allSheetData = constructSheetData();

    let contacts = getContactData(allSheetData);
    let contactSheetData = allSheetData.contact;

    // let allSheetData = constructSheetData()
    // let contacts = getContactData(allSheetData)
    // let orgLeaderData = getMissionLeadershipData(contacts)
    // Logger.log(orgLeaderData)

    // this one can only really be gotten rid of by converting to typescript as well.
    // @ts-ignore
    let orgData = getMissionOrgData(allSheetData);

    let zoneMeta = dataLoader_(allSheetData,
        CONFIG.fileSystem.reportLevel.zone);
    let distMeta = dataLoader_(allSheetData,
        CONFIG.fileSystem.reportLevel.dist);
    let areaMeta = dataLoader_(allSheetData,
        CONFIG.fileSystem.reportLevel.area);

    let returnedData = updateFilesysV3_(
        zoneMeta,
        distMeta,
        areaMeta,
        orgData,
        reportRootFolder
    );

    Logger.log(returnedData);

    // Logger.log(["SHEETIDTEST", zoneMeta.loader.getIndex("sheetID1")])

    let zoneOutData = getDataFromArray_(returnedData.zoneFilesys, zoneMeta.sheetData);
    sendDataToDisplayV3_(zoneMeta.splitData.header, zoneOutData, zoneMeta.sheet);

    let distOutData = getDataFromArray_(returnedData.distFilesys, distMeta.sheetData);
    sendDataToDisplayV3_(distMeta.splitData.header, distOutData, distMeta.sheet);

    let areaOutData = getDataFromArray_(returnedData.areaFilesys, areaMeta.sheetData);
    sendDataToDisplayV3_(areaMeta.splitData.header, areaOutData, areaMeta.sheet);



}
/*
 * @param {{ names: any; fileObjArray: any; }} preData
 * @param {string} name
 * @param {any} parentFolder
 * @param {string} scope
 */
function updateFS_getCreateFolderObj_(preData, name, parentFolder, scope) {
    
    let folderObj;
    if (preData.names.includes(name + "" + scope) == true) {
        if (CONFIG.fileSystem.log_existing_folders) { Logger.log("Folder already exists for " + name + " " + scope); }
        let folderPosition = preData.names.indexOf(name);
        folderObj = preData.fileObjArray[folderPosition];
    } else if (preData.names.includes(name)) {
        if (CONFIG.fileSystem.log_existing_folders) { Logger.log("Folder already exists for " + name); }
        let folderPosition = preData.names.indexOf(name);
        folderObj = preData.fileObjArray[folderPosition];
    } else {
        folderObj = createFilesysEntryV3_(name, parentFolder, scope);
    }
    return folderObj;
}
function testy() {
    let allSheetData = constructSheetData();
    let contacts = getContactData(allSheetData);
    let orgLeaderData = getMissionLeadershipData(contacts);
    Logger.log(orgLeaderData);
}

/**
 * @param {any} fsObject
 */
function getFilesAndNames(fsObject) {
    let folderNames = [];
    let files = [];
    for (let file of fsObject) {
        folderNames.push(file.folderName);
        files.push(file);
    }
    return {
        names: folderNames,
        fileObjArray: files,
    };
}


function updateFilesysV3_(
    zoneMetaObj,
    distMetaObj,
    areaMetaObj,
    orgData,
    reportBaseFolder
) {
    // returns an array of filesys objects

    // let zoneRequiredEntries = getRequiriedEntries_(contactInfo, CONFIG.fileSystem.reportLevel.zone)

    let anyUpdates = false;
    let preZoneData = zoneMetaObj.fsObj.length > 0 ? getFilesAndNames(zoneMetaObj.fsObj) : { names: [], fileObjArray: [] };
    let preDistData = distMetaObj.fsObj.length > 0 ? getFilesAndNames(distMetaObj.fsObj) : { names: [], fileObjArray: [] };
    let preAreaData = areaMetaObj.fsObj.length > 0 ? getFilesAndNames(areaMetaObj.fsObj) : { names: [], fileObjArray: [] };

    let zFolderObjs = [];
    let dFolderObjs = [];
    let aFolderObjs = [];

    for (let zone in orgData) {
        Logger.log(zone);
        // pre-check to see if folder already exists
        // let zFolderID = ""  // Originally was going to need this but realized if I use the folderObj I'll probably have less problems
        let zFolderObj = updateFS_getCreateFolderObj_(
            preZoneData,
            zone,
            reportBaseFolder,
            CONFIG.fileSystem.reportLevel.zone
        );
        zFolderObjs.push(zFolderObj);
        console.log(orgData[zone],"-",zFolderObj);

        for (let district in orgData[zone]) {
            Logger.log(district);
            let dFolderObj = updateFS_getCreateFolderObj_(
                preDistData,
                district,
                zFolderObj.folder,
                CONFIG.fileSystem.reportLevel.dist
            );
            dFolderObjs.push(dFolderObj);
            for (let area of orgData[zone][district]) {
                let aFolderObj = updateFS_getCreateFolderObj_(
                    preAreaData,
                    area,
                    dFolderObj.folder,
                    CONFIG.fileSystem.reportLevel.area
                );
                aFolderObjs.push(aFolderObj);
                Logger.log(area);
            }
        }
    }
    return {
        zoneFilesys: zFolderObjs,
        distFilesys: dFolderObjs,
        areaFilesys: aFolderObjs,
    };
}

/*
 * @param {any} parentFolderId
 * @param {string} name
 */
function createNewFolderV3_(parentFolderId, name) {
    // creates new folder in parent folder, and then returns that folder's ID.

    Logger.log(parentFolderId);
    let parentFolder = DriveApp.getFolderById(parentFolderId);
    let newFolder = parentFolder.createFolder(name);
    let newFolderID = newFolder.getId();
    if (CONFIG.log_filesys) { Logger.log(["FOLDER EXISTS", parentFolderId, newFolderID]); }
    return newFolderID;
}

/*
 * @param {{ [x: string]: any; }} contactInfo
 * @param {string} scope
 */
function getRequiriedEntries_(contactInfo, scope) {
    // this is a generalized version of a thing I wrote like four times the exact same way.  HAHA
    let output = [];
    for (let areaID in contactInfo) {
        let contactData = contactInfo[areaID];
        switch (scope) {
            case CONFIG.fileSystem.reportLevel.zone:
                output.push(contactData.areaData.zone);
                break;
            case CONFIG.fileSystem.reportLevel.dist:
                output.push(contactData.areaData.district);
                break;
            case CONFIG.fileSystem.reportLevel.area:
                output.push(contactData.areaData.areaName);
        }
    }
    output = getUniqueV3_(output);
    return output;
}

/*
 * @param {string | any[]} gimmeDatArray
 */
function getUniqueV3_(gimmeDatArray) {
    let uniqueData = [];
    for (let i = 0; i < gimmeDatArray.length; i++) {
        if (uniqueData.includes(gimmeDatArray[i]) == false) {
            uniqueData.push(gimmeDatArray[i]); // if it's a match, then we do the thing, otherwise no.
        }
    }
    return uniqueData;
}




/*
 * @param {any} data
 */
function headerSplit_(data) {
    let outData = data;
    let header = outData.shift();
    return {
        data: outData,
        header: header,
    };
}

/*
 * @param {any} data
 */
function loadFSIntoClass_(data) {
    let fsData = [];

    for (let item of data) {
        let email = [];
        email.push(item[5]);
        email.push(item[6]);
        // this is a basic loader doodad, it can become more smart in the future if I want it to by incorporating Elder Gerlek's sheetloader indexOf thingy.
        let entry = new FilesystemEntry(item[0], item[1], item[2], item[3], item[4]);
        fsData.push(entry);
    }

    return fsData;
}
