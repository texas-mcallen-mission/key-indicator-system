/*
        accessControl.gs
        Functions managing file sharing and read/write access
*/

/**
 * Shares folders in the file structure with the appropriate area emails.
 * Pulls contact data from the Contacts sheet and file structure data from the Filesys sheets.
 */
function shareFileSys() {
  Logger.log(`Beginning read/write file sharing...`)

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
    for (let i=0; i < allFoldersList.length; i++) {
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

    if (LOG_FILE_SHARING) Logger.log(`Sharing folder for zone '${zoneName}'`);


    //      Update folder access: zEmails, officeEmails


    //List of emails with limited editor access at the zone level
    let zEmails = [];
    zEmails.push(zoneOrgData.zlArea.areaEmail);  //Add ZL area email
    if (zoneOrgData.hasStlArea) zEmails.push(zoneOrgData.stlArea.areaEmail);  //Add STL area email if it exists

    if (LOG_FILE_SHARING) Logger.log(`zEmails: ${zEmails}`);

    //Remove old editors, then add new ones
      let editorEmails = zoneFolder.getEditors().map(editor => {return editor.getEmail()}); //Get a list of Editor objects, then convert to list of emails
      for (let editor of editorEmails) {
        if (!zEmails.includes(editor) && !officeEmails.includes(editor)) {
          zoneFolder.removeEditor(editor);
        }
      }

    zoneFolder.addEditors(zEmails);
    
    
    
    zoneFolder.addEditors(officeEmails);
    Drive.Permissions.insert(
      {
        'role': 'writer',
        'type': 'user',
        'value': 'cosa'
      },
      '',
      {
        'sendNotificationEmails': 'false'
      }
    );



    if (LOG_FILE_SHARING) Logger.log(`Removed and re-added zone folder editors: ${zoneFolder.getEditors().map(e => {return e.getName()})}`);


    if (UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD) {

      //      Update Spreadsheet page protections: officeEmails only

      zFiles = zoneFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder


      while (zFiles.hasNext()) {  //for each spreadsheet file
        let file = zFiles.next();
        let ss = SpreadsheetApp.openById(file.getId());
        let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                          ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                          );
        if (LOG_FILE_SHARING) Logger.log(`Updating ${protections.length} protections in sheet`);

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


      if (LOG_FILE_SHARING) Logger.log(`Sharing folder for district '${districtName}'`);


      //      Update folder access: everyone with zone level access, plus the DL


      //List of emails with limited editor access at the district level
      let dEmails = [];
      dEmails.push(distOrgData.dlArea.areaEmail);  //Add DL area email

      //Remove old editors (except for the ZLs and office emails), then add back the DL area email
      let editorEmails = distFolder.getEditors().map(editor => {return editor.getEmail()}); //Get a list of Editor objects, then convert to list of emails
      for (let editor of editorEmails) {
        if (!dEmails.includes(editor)
         && !zEmails.includes(editor)
         && !officeEmails.includes(editor)) {
          distFolder.removeEditor(editor);
        }
      }

      distFolder.addEditors(dEmails);



      if (UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD) {

        //      Update Spreadsheet page protections: officeEmails only

        let dFiles = distFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder
        
        while (dFiles.hasNext()) {  //for each spreadsheet file
          let ss = SpreadsheetApp.openById(dFiles.next().getId());
          let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                          ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                          );
          if (LOG_FILE_SHARING) Logger.log(`Updating ${protections.length} protections in sheet`);

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


        if (LOG_FILE_SHARING) Logger.log(`Sharing folder for area '${areaName}'`);


        //      Update folder access: everyone with zone or district level access, plus the area email


        //List of emails with limited editor access at the area level
        let aEmails = [];
        aEmails.push(areaOrgData.areaEmail);  //Add area email

        //Remove old editors (except for the DL, ZLs, and office emails), then add back the DL area email
        let editorEmails = distFolder.getEditors().map(editor => {return editor.getEmail()}); //Get a list of Editor objects, then convert to list of emails
        for (let editor of editorEmails) {
          if (!aEmails.includes(editor)
           && !dEmails.includes(editor)
           && !zEmails.includes(editor)
           && !officeEmails.includes(editor)) {
            areaFolder.removeEditor(editor);
          }
        }

        areaFolder.addEditors(aEmails);


        if (UPDATE_SHEET_PROTECTIONS_ON_FILESYS_LOAD) {
          //      Update Spreadsheet page protections: officeEmails only


          let aFiles = areaFolder.getFilesByType("application/vnd.google-apps.spreadsheet"); //Get all the spreadsheet files in this folder
          
          while (aFiles.hasNext()) {  //for each spreadsheet file
            let ss = SpreadsheetApp.openById(aFiles.next().getId());
            let protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).concat(
                              ss.getProtections(SpreadsheetApp.ProtectionType.SHEET)
                              );
            if (LOG_FILE_SHARING) Logger.log(`Updating ${protections.length} protections in sheet`);

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

      Logger.log(`Finished sharing folders for district ${districtName}`);
    }

    Logger.log(`Finished sharing folders for zone ${zoneName}`);
  }


  Logger.log(`Completed read/write file sharing.`)






}






/**
 * Adds the given list of users to the editors list of the file with the given id, without sending notification emails.
 */
function silentAddEditorSE_(email, fileId) {

 Drive.Permissions.insert(
   {
     'role': 'writer',
     'type': 'user',
     'value': email
   },
   fileId,
   {
     'sendNotificationEmails': 'false'
   });


}












/**
 * Adds the given list of users to the editors list of the file with the given id, without sending notification emails.
 */
function silentAddEditors_(emails, fileId) {
  let type = 'user';
  let role = 'writer';

  for (var i = 0; i < emails.length; i++) {

    var body = {
      'value': emails[i],
      'type': type,
      'role': role
    };

    Drive.Permissions.insert({'fileID':fileId, 'resource':body, 'sendNotificationEmails': 'false'});

  }
}

function insertPermission(fileId, value, type, role) {
  var body = {
    'value': value,
    'type': type,
    'role': role
  };
  var request = gapi.client.drive.permissions.insert({
    'fileId': fileId,
    'resource': body
  });
  request.execute(function(resp) { });
}





function testSharing() {
  let fileId = '1cH0FYX_JC9I-BYAbzWu9_D19Dr3ft0UMnZbXq6eIHe8';
  let editors = ['nathaniel.gerlek@missionary.org', '20929917@missionary.org'];

  silentAddEditorSE_('nathaniel.gerlek@missionary.org', fileId);

return;
  let folderId = '1EfyfR5fdG1SP_z5Z3pFUG-ms4DokRWFB';

  silentAddEditors_(folderId, editors);




}


















// THIS IS UNIMPLEMENTED RIGHT NOW, BECAUSE I DUNNO HOW TO DO IT PROPERLY YET & ELDER GERLEK IS PROBABLY GOING TO MAKE IT ANYWAYS :P

function returnMatchingInArray(array,testString,testPosition){
  let output = []
  for(item of array){
    if(item[testPosition].includes(testString) == true){
      output.push(item)
    }
  }
  return output
}



function testReturnMatchingInArray(){
  Logger.log(returnMatchingInArray([["1","1"],["1","1"],["1","1"],["1","2"],["1","2"],["1","2"],["2","2"],["2","2"],["2","2"],["3","4"]],"1",0))
  Logger.log(returnMultiplePartialMatchInArray([["1","1","1","1"],["1","1","1","2"],["1","2","1","2"],["2","2","2","2"],["2","2","3","4"]],"1",0,"4",3,"1",0))
}





function splitRelevantContactDataAndGetLeaderEmails(contactDataArray){
  ///  let relevantContactDataHeader = ["Area Email","Area","District","Zone"]
  // for the big fat lookup function, whooooo
  //basically we're going to return a custom contact data structure thingy that has leader emails in it because that seems like a good idea to do
  // This was originally going to be a "passthrough" function that would modify splitContactData and add on the leader area emails to the thingy for getEmail to work with.

  let areaEmail = []
  let area = []
  let district = []
  let zone = []
  let role1 = []
  let role2 = []
  let role3 = []
  for(contact of contactDataArray){
    areaEmail.push(contact[0])
    area.push(contact[1])
    district.push(contact[2])
    zone.push(contact[3])
    role1.push(contact[4])
    role2.push(contact[7])
    role3.push(contact[10])
  }

  let uniqueDistrictNames = getUnique_(district)
  let uniqueZoneNames = getUnique_(zone)


  return {
    areaEmailAddress:areaEmail,
    areaName:area,
    districtName:district,
    zoneName:zone,
    dlEmail:"dl email",
    zlEmail:"ZL email",
  }
}


function returnMultiplePartialMatchInArray(arrayData,tS1,tP1,tS2,tP2,tS3,tP3){
  // this will basically be for figuring out who has what role and collapsing it down.  NOT QUITE DONE YET>>>>>>>
  let output = []
  for(item of arrayData){
    if(item[tP1].includes(tS1) == true || item[tP1].includes(tS2) || item[tP1].includes(tS3)){
      output.push(item)
    } else if(item[tP2].includes(tS1) == true || item[tP2].includes(tS2) == true || item[tP2].includes(tS3) == true){
      output.push(item)
    } else if(item[tP3].includes(tS1) == true || item[tP3].includes(tS2) == true || item[tP3].includes(tS3) == true){
      output.push(item)    
  } else {
    if(functionGUBED == false){Logger.log(["NO MATCH FOR:",item])}
  }
  }
  return output
}
function testForRoleThings(){
  let contactDataSheet = getSheetOrSetUp_(contactDataSheetName,headerStuff)
    let storedContactData = getSheetDataWithHeader_(contactDataSheet)
  let relevantContactData = []
  for(let i=0;i<storedContactData.data.length;i++){
    relevantContactData.push([storedContactData.data[i][1],storedContactData.data[i][2],storedContactData.data[i][12],storedContactData.data[i][13]])

  }
  let zl1 = ["(ZL1)","ZL1"]
  let zl2 = ["(ZL2)","ZL2"]
  let zl3 = ["(ZL3)","ZL3"]
  Logger.log(relevantContactData[2])
  let listOfZLs = returnMultiplePartialMatchInArray(storedContactData,zl1[1],4,zl2[1],7,zl3[1],10)
  Logger.log(listOfZLs)
  
  let relevantContactDataSplit = splitRelevantContactData_(relevantContactData)


}


function getEmail(name,splitContactData){ 

  Logger.log("THIS SHOULDNT BE RUNNING RIGHT NOWWWWWW")
  // PART OF HOW ACCESS CONTROL WILL BE IMPLEMENTED
  //splitContactData's Format
  //{areaEmailAddress:areaEmail,areaName:area,districtName:district,zoneName:zone,role1:role,role2:role,role3:role}
  let index = -1
  let email = ""
  Logger.log(splitContactData)
  if(splitContactData != null){
    if(splitContactData.areaName.includes(name)==true){
      //IT's AREA LEVEL, EZPZ
        index = splitContactData.areaName.indexOf(name)
        email = splitContactData.areaEmailAddress[index]
    } else if(splitContactData.districtName.includes(name)==true){
      //IT'S DISTRICT LEVEL, WHICH MEANS WE NEED ROLES
        
        email = "DL EMAIL, UNIMPLEMENTED"
    } else if(splitContactData.zoneName.includes(name)==true){
      // IT'S ZONE LEVEL, WHICH IS EVEN BETTER
        email = "ZL EMAIL, UNIMPLEMENTED!!!"
    } else {
      // THERE BETTER NOT BE ANYTHING THAT MAKES IT DOWN HERE
    }
  } else {
    return "HAHA NOT TODAY"
  }
  return email
}
