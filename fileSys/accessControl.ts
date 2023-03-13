/*
        accessControl.gs
        Functions managing file sharing and read/write access
*/


// written by @than2000

/**
 * Shares folders in the file structure with the appropriate area emails.
 * Pulls contact data from the Contacts sheet and file structure data from the Filesys sheets.
 */
function shareFileSystem() {
    
    console.warn("Warning: tried to share file system. Don't run unless connected to a file system that you're okay with sharing to the whole mission.")

    console.log('Beginning read/write file sharing...');
    const allSheetData: manySheetDatas = constructSheetDataV3(["contact", "zoneFilesys", "distFilesys","areaFilesys"])

    const cSheetData: SheetData = allSheetData.contact;
    const contacts = getContactData(cSheetData);
    const missionOrgData = getMissionLeadershipDataV2_(contacts);

    //List of emails with full access
    const officeEmails = [];
    officeEmails.push(missionOrgData.apArea.areaEmail); //Add AP email
    if (missionOrgData.hasStltArea) officeEmails.push(missionOrgData.stltArea.areaEmail); //Add STLT email if it exists




    //Pull and sort area, dist, zone file data


    function getFolders(sheetData) {
        const allFoldersList = sheetData.getData(); //List of objects containing the folder data for each folder
        const allFolders = {};                      //Turn allFoldersList into an object keyed by name, rather than a list
        //i.e. allZoneFolders["BROWNSVILLE"] returns Brownsville zone's folder data
        for (let i = 0; i < allFoldersList.length; i++) {
            const folder = allFoldersList[i];
            const name = folder.folderName;
            allFolders[name] = folder;
        }
        return allFolders;
    }

    const allZoneFolderData = getFolders(allSheetData.zoneFilesys);
    const allDistFolderData = getFolders(allSheetData.distFilesys);
    const allAreaFolderData = getFolders(allSheetData.areaFilesys);




    //Zone folders




    for (const zoneName in missionOrgData.zones) {
        const zoneFolderData = allZoneFolderData[zoneName];
        const zoneFolderID = zoneFolderData.folderId;
        const zoneFolder = DriveApp.getFolderById(zoneFolderID);

        const zoneOrgData = missionOrgData.zones[zoneName];

        if (CONFIG.fileSystem.log_fileShare) console.log("Sharing folder for zone '" + zoneName + "'");


        //      Update folder access: zEmails, officeEmails


        //List of emails with limited editor access at the zone level
        const zEmails = [];
        zEmails.push(zoneOrgData.zlArea.areaEmail);  //Add ZL area email
        if (zoneOrgData.hasStlArea) zEmails.push(zoneOrgData.stlArea.areaEmail);  //Add STL area email if it exists

        if (CONFIG.fileSystem.log_fileShare) console.log('zEmails: ' + zEmails);

        //Remove old editors, then add new ones
        const editorEmails = zoneFolder.getEditors().map(editor => { return editor.getEmail(); }); //Get a list of Editor objects, then convert to list of emails
        for (const editor of editorEmails) {
            if (!zEmails.includes(editor) && !officeEmails.includes(editor)) {
                zoneFolder.removeEditor(editor);
            }
        }

        // zoneFolder.addEditors(zEmails);
        // zoneFolder.addEditors(officeEmails);
        silentShareToGroup(zoneFolderID, zEmails);
        silentShareToGroup(zoneFolderID, officeEmails);

        const editorNames = zoneFolder.getEditors().map(e => { return e.getName(); });
        if (CONFIG.fileSystem.log_fileShare) console.log('Removed and re-added zone folder editors: ' + editorNames);


        // if (CONFIG.fileSystem.updateSheetProtectionsOnLoad) {

        //     //      Update Spreadsheet page protections: officeEmails only

        //     let zFiles = zoneFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder


        //     while (zFiles.hasNext()) {  //for each spreadsheet file
        //         let file = zFiles.next();
        //         let ss = SpreadsheetApp.openById(file.getId());
        //         let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
        //             ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
        //         );
        //         if (CONFIG.fileSystem.log_fileShare) console.log('Updating ' + protections.length + ' protections in sheet');

        //         for (let protection of protections) {
        //             for (let editor of protection.getEditors()) {
        //                 if (!officeEmails.includes(editor)) {
        //                     protection.removeEditor(editor);
        //                 }
        //             }
        //             protection.addEditors(officeEmails);
        //         }
        //     }

        // }




        //District folders (for districts within this zone)




        for (const districtName in zoneOrgData.districts) {
            const distFolderData = allDistFolderData[districtName];
            const distFolderID = distFolderData.folderId;
            const distFolder = DriveApp.getFolderById(distFolderID);
            const distOrgData = zoneOrgData.districts[districtName];


            if (CONFIG.fileSystem.log_fileShare) console.log("Sharing folder for district '" + districtName + "'");


            //      Update folder access: everyone with zone level access, plus the DL


            //List of emails with limited editor access at the district level
            const dEmails = [];
            dEmails.push(distOrgData.dlArea.areaEmail);  //Add DL area email

            //Remove old editors (except for the ZLs and office emails), then add back the DL area email
            const editorEmails = distFolder.getEditors().map(editor => { return editor.getEmail(); }); //Get a list of Editor objects, then convert to list of emails
            for (const editor of editorEmails) {
                if (!dEmails.includes(editor)
                    && !zEmails.includes(editor)
                    && !officeEmails.includes(editor)) {
                    distFolder.removeEditor(editor);
                }
            }

            // distFolder.addEditors(dEmails);
            silentShareToGroup(distFolderID, dEmails);



            // if (CONFIG.fileSystem.updateSheetProtectionsOnLoad) {

            //     //      Update Spreadsheet page protections: officeEmails only

            //     let dFiles = distFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder

            //     while (dFiles.hasNext()) {  //for each spreadsheet file
            //         let ss = SpreadsheetApp.openById(dFiles.next().getId());
            //         let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
            //             ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
            //         );
            //         if (CONFIG.fileSystem.log_fileShare) console.log('Updating ' + protections.length + ' protections in sheet');

            //         for (let protection of protections) {
            //             for (let editor of protection.getEditors()) {
            //                 if (!officeEmails.includes(editor)) {
            //                     protection.removeEditor(editor);
            //                 }
            //             }
            //             protection.addEditors(officeEmails);
            //         }
            //     }
            // }




            //Area folders (for areas within this district)




            for (const areaName in distOrgData.areas) {
                const areaFolderData = allAreaFolderData[areaName];
                const areaFolderID = areaFolderData.folderId;
                const areaFolder = DriveApp.getFolderById(areaFolderID);
                const areaOrgData = distOrgData.areas[areaName];


                if (CONFIG.fileSystem.log_fileShare) console.log('Sharing folder for area ' + areaName);


                //      Update folder access: everyone with zone or district level access, plus the area email


                //List of emails with limited editor access at the area level
                const aEmails = [];
                aEmails.push(areaOrgData.areaEmail);  //Add area email

                //Remove old editors (except for the DL, ZLs, and office emails), then add back the DL area email
                const editorEmails = distFolder.getEditors().map(editor => { return editor.getEmail(); }); //Get a list of Editor objects, then convert to list of emails
                for (const editor of editorEmails) {
                    if (!aEmails.includes(editor)
                        && !dEmails.includes(editor)
                        && !zEmails.includes(editor)
                        && !officeEmails.includes(editor)) {
                        areaFolder.removeEditor(editor);
                    }
                }

                silentShareToGroup(areaFolderID, aEmails);



                // if (CONFIG.fileSystem.updateSheetProtectionsOnLoad) {
                //     //      Update Spreadsheet page protections: officeEmails only


                //     let aFiles = areaFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder

                //     while (aFiles.hasNext()) {  //for each spreadsheet file
                //         let ss = SpreadsheetApp.openById(aFiles.next().getId());
                //         let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                //             ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                //         );
                //         if (CONFIG.fileSystem.log_fileShare) console.log('Updating ' + protections.length + ' protections in sheet');

                //         for (let protection of protections) {
                //             for (let editor of protection.getEditors()) {
                //                 if (!officeEmails.includes(editor)) {
                //                     protection.removeEditor(editor);
                //                 }
                //             }
                //             protection.addEditors(officeEmails);
                //         }
                //     }
                // }




                //Finished sharing folder for this area
            }

            console.log('Finished sharing folders for district ' + districtName);
        }

        console.log('Finished sharing folders for zone ' + zoneName);
    }


    console.log('Completed read/write file sharing.');






}




/*
 * Adds the given user to the list of editors for the file or folder without sending them a notification email.
 * @param {string} fileId - The file or folder ID.
 * @param {string} recipient - The email address of the user to add.
 */
function silentShare(fileId, recipientEmail:string) {
    try {
        const file = DriveApp.getFileById(fileId);

        Drive.Permissions.insert(
            {
                'role': 'writer',
                'type': 'user',
                'value': recipientEmail
            },
            file.getId(),
            {
                'sendNotificationEmails': 'false'
            }
        );
    } catch (e) {
        console.log("Failed to share:\n" + e);
    }
}

/**
 * Adds all of the given users to the list of editors for the file or folder without sending them notification emails.
 * @param {string} fileId - The file or folder ID.
 * @param {string} recipients - An array of email address of the users to add.
 */
function silentShareToGroup(fileId, recipientEmails:string[]) {
    if (CONFIG.fileSystem.log_fileShare)
        console.log("Sharing file/folder '" + fileId.getName() + "' with " + recipientEmails);
    
    for (const recipient of recipientEmails) {
        silentShare(fileId, recipient);
    }
}






function testSharing() {
    const fileId = '1cH0FYX_JC9I-BYAbzWu9_D19Dr3ft0UMnZbXq6eIHe8';
    const editor = 'texas.mcallen@missionary.org';

    silentShare(fileId, editor);

}
