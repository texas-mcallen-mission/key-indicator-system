/*
        accessControl.gs
        Functions managing file sharing and read/write access
*/

/**
 * Shares folders in the file structure with the appropriate area emails.
 * Pulls contact data from the Contacts sheet and file structure data from the Filesys sheets.
 */
function shareFileSys() {
    Logger.log('Beginning read/write file sharing...');

    let allSheetData = constructSheetData();
    let contacts = getContactData(allSheetData);
    let missionOrgData = getMissionLeadershipData(contacts);

    //List of emails with full access
    let officeEmails = [];
    officeEmails.push(missionOrgData.apArea.areaEmail); //Add AP email
    if (missionOrgData.hasStltArea) officeEmails.push(missionOrgData.stltArea.areaEmail); //Add STLT email if it exists




    //Pull and sort area, dist, zone file data


    function getFolders(sheetData) {
        let allFoldersList = sheetData.getData(); //List of objects containing the folder data for each folder
        let allFolders = {};                      //Turn allFoldersList into an object keyed by name, rather than a list
        //i.e. allZoneFolders["BROWNSVILLE"] returns Brownsville zone's folder data
        for (let i = 0; i < allFoldersList.length; i++) {
            let folder = allFoldersList[i];
            let name = folder.folderName;
            allFolders[name] = folder;
        }
        return allFolders;
    }

    let allZoneFolderData = getFolders(allSheetData.zoneFilesys);
    let allDistFolderData = getFolders(allSheetData.distFilesys);
    let allAreaFolderData = getFolders(allSheetData.areaFilesys);




    //Zone folders




    for (let zoneName in missionOrgData.zones) {
        let zoneFolderData = allZoneFolderData[zoneName];
        let zoneFolderID = zoneFolderData.folder;
        let zoneFolder = DriveApp.getFolderById(zoneFolderID);

        let zoneOrgData = missionOrgData.zones[zoneName];

        if (DBCONFIG.LOG_FILE_SHARING) Logger.log("Sharing folder for zone '" + zoneName + "'");


        //      Update folder access: zEmails, officeEmails


        //List of emails with limited editor access at the zone level
        let zEmails = [];
        zEmails.push(zoneOrgData.zlArea.areaEmail);  //Add ZL area email
        if (zoneOrgData.hasStlArea) zEmails.push(zoneOrgData.stlArea.areaEmail);  //Add STL area email if it exists

        if (DBCONFIG.LOG_FILE_SHARING) Logger.log('zEmails: ' + zEmails);

        //Remove old editors, then add new ones
        let editorEmails = zoneFolder.getEditors().map(editor => { return editor.getEmail(); }); //Get a list of Editor objects, then convert to list of emails
        for (let editor of editorEmails) {
            if (!zEmails.includes(editor) && !officeEmails.includes(editor)) {
                zoneFolder.removeEditor(editor);
            }
        }

        // zoneFolder.addEditors(zEmails);
        // zoneFolder.addEditors(officeEmails);
        silentAddEditors_(zoneFolderID, zEmails);
        silentAddEditors_(zoneFolderID, officeEmails);

        let editorNames = zoneFolder.getEditors().map(e => { return e.getName(); });
        if (DBCONFIG.LOG_FILE_SHARING) Logger.log('Removed and re-added zone folder editors: ' + editorNames);


        if (DBCONFIG.UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD) {

            //      Update Spreadsheet page protections: officeEmails only

            let zFiles = zoneFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder


            while (zFiles.hasNext()) {  //for each spreadsheet file
                let file = zFiles.next();
                let ss = SpreadsheetApp.openById(file.getId());
                let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                    ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                );
                if (DBCONFIG.LOG_FILE_SHARING) Logger.log('Updating ' + protections.length + ' protections in sheet');

                for (let protection of protections) {
                    for (let editor of protection.getEditors()) {
                        if (!officeEmails.includes(editor)) {
                            protection.removeEditor(editor);
                        }
                    }
                    protection.addEditors(officeEmails);
                }
            }

        }




        //District folders (for districts within this zone)




        for (let districtName in zoneOrgData.districts) {
            let distFolderData = allDistFolderData[districtName];
            let distFolderID = distFolderData.folder;
            let distFolder = DriveApp.getFolderById(distFolderID);
            let distOrgData = zoneOrgData.districts[districtName];


            if (DBCONFIG.LOG_FILE_SHARING) Logger.log("Sharing folder for district '" + districtName + "'");


            //      Update folder access: everyone with zone level access, plus the DL


            //List of emails with limited editor access at the district level
            let dEmails = [];
            dEmails.push(distOrgData.dlArea.areaEmail);  //Add DL area email

            //Remove old editors (except for the ZLs and office emails), then add back the DL area email
            let editorEmails = distFolder.getEditors().map(editor => { return editor.getEmail(); }); //Get a list of Editor objects, then convert to list of emails
            for (let editor of editorEmails) {
                if (!dEmails.includes(editor)
                    && !zEmails.includes(editor)
                    && !officeEmails.includes(editor)) {
                    distFolder.removeEditor(editor);
                }
            }

            // distFolder.addEditors(dEmails);
            silentAddEditors_(distFolderID, dEmails);



            if (DBCONFIG.UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD) {

                //      Update Spreadsheet page protections: officeEmails only

                let dFiles = distFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder

                while (dFiles.hasNext()) {  //for each spreadsheet file
                    let ss = SpreadsheetApp.openById(dFiles.next().getId());
                    let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                        ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                    );
                    if (DBCONFIG.LOG_FILE_SHARING) Logger.log('Updating ' + protections.length + ' protections in sheet');

                    for (let protection of protections) {
                        for (let editor of protection.getEditors()) {
                            if (!officeEmails.includes(editor)) {
                                protection.removeEditor(editor);
                            }
                        }
                        protection.addEditors(officeEmails);
                    }
                }
            }




            //Area folders (for areas within this district)




            for (let areaName in distOrgData.areas) {
                let areaFolderData = allAreaFolderData[areaName];
                let areaFolderID = areaFolderData.folder;
                let areaFolder = DriveApp.getFolderById(areaFolderID);
                let areaOrgData = distOrgData.areas[areaName];


                if (DBCONFIG.LOG_FILE_SHARING) Logger.log('Sharing folder for area ' + areaName);


                //      Update folder access: everyone with zone or district level access, plus the area email


                //List of emails with limited editor access at the area level
                let aEmails = [];
                aEmails.push(areaOrgData.areaEmail);  //Add area email

                //Remove old editors (except for the DL, ZLs, and office emails), then add back the DL area email
                let editorEmails = distFolder.getEditors().map(editor => { return editor.getEmail(); }); //Get a list of Editor objects, then convert to list of emails
                for (let editor of editorEmails) {
                    if (!aEmails.includes(editor)
                        && !dEmails.includes(editor)
                        && !zEmails.includes(editor)
                        && !officeEmails.includes(editor)) {
                        areaFolder.removeEditor(editor);
                    }
                }

                areaFolder.addEditors(aEmails);
                silentAddEditors_(areaFolderID, aEmails);



                if (DBCONFIG.UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD) {
                    //      Update Spreadsheet page protections: officeEmails only


                    let aFiles = areaFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder

                    while (aFiles.hasNext()) {  //for each spreadsheet file
                        let ss = SpreadsheetApp.openById(aFiles.next().getId());
                        let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                            ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                        );
                        if (DBCONFIG.LOG_FILE_SHARING) Logger.log('Updating ' + protections.length + ' protections in sheet');

                        for (let protection of protections) {
                            for (let editor of protection.getEditors()) {
                                if (!officeEmails.includes(editor)) {
                                    protection.removeEditor(editor);
                                }
                            }
                            protection.addEditors(officeEmails);
                        }
                    }
                }




                //Finished sharing folder for this area
            }

            Logger.log('Finished sharing folders for district ' + districtName);
        }

        Logger.log('Finished sharing folders for zone ' + zoneName);
    }


    Logger.log('Completed read/write file sharing.');






}






/**
 * Adds the given user to the list of editors for the file or folder without sending a notification email.
 * @param {string} fileId The file or folder ID.
 * @param {string} emailAddress The email address of the user to add.
 */
function silentAddEditor_(fileId, emailAddress) {

    Drive.Permissions.insert(
        {
            'role': 'writer',
            'type': 'user',
            'value': emailAddress
        },
        fileId,
        {
            'sendNotificationEmails': 'false'
        });


}

/**
 * Adds the given array of users to the list of editors for the file or folder without sending notification emails.
 * @param {string} fileId The ID of the file or folder to be edited.
 * @param {string[]} emailAddresses An array of email addresses of the users to add.
 */
function silentAddEditors_(fileId, emailAddresses) {
    for (let email of emailAddresses)
        silentAddEditor_(fileId, email);
}





function testSharing() {
    let fileId = '1cH0FYX_JC9I-BYAbzWu9_D19Dr3ft0UMnZbXq6eIHe8';
    let editors = ['nathaniel.gerlek@gmail.com', '20929917@missionary.org'];

    silentAddEditorSE_('nathaniel.gerlek@missionary.org', fileId);

    return;

}













