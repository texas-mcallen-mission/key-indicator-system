//@ts-check
function whileDebugging() {
  updateZoneReports()
}



// function verifySingleFilesys_(data) {

//   let fsObj = loadFSIntoObject_(data)
//   let newFsObj = fsObj
//   Logger.log(fsObj)
//   for (let i = 0; i < fsObj.name.length; i++) {
//     let nuke = false

//     if(isFolderReal_(fsObj.cFolderID[i]) == false){ nuke = true }
//     if(isFolderReal_(fsObj.pFolderID[i]) == false){ nuke = true }



//     for (document of fsObj.sheetsIDs[i]) {
//       if (isSheetReal_(document) == true) {
//         // Logger.log(["Document Exists for",fsObj.name[i],": ",document])
//       } else {
//         document = ""
//         newFsObj.sheetsIDs[i] = ""
//       }
//     }

//     if (nuke == true) {
//       Logger.log(["NUUUUKE", fsObj.name[i], fsObj.emails[i], fsObj.pFolderID[i], fsObj.cFolderID[i], fsObj.sheetsIDs[i]])
//       newFsObj.sheetsIDs.splice(i, 1)
//       newFsObj.emails.splice(i, 1)
//       newFsObj.pFolderID.splice(i, 1)
//       newFsObj.cFolderID.splice(i,1)
//       newFsObj.name.splice(i, 1)
//       // this is where we go and remove the whole line from the data.
//     }
//   }

//   Logger.log(newFsObj)
//   let newData = loadFSObjectIntoData_(newFsObj)
//   Logger.log(newData)

//   return newData
// }



function loadVerifyAndStoreFS_(dataSheetName, dataSheetHeaders, scopeStringForDebug) {
  let dataSheet = getSheetOrSetUp_(dataSheetName, dataSheetHeaders)
  let fsData = getSheetDataWithHeader_(dataSheet)
  let fsHeader = fsData.header
  let verifiedData = verifySingleFilesys_(fsData.data)

  if (fsData.data.length == 0) {
    let fsData = getSheetDataWithHeader_(dataSheet)
    let fsHeader = fsData.header
    let verifiedData = verifySingleFilesys_(fsData.data)



    if (verifiedData.length == 0) {
      let debugString = "⚠⚠⚠ No data at the " + scopeStringForDebug.toString() + " level ⚠⚠⚠"
      Logger.log(debugString)
    } else {
      Logger.log("displaying Data")
      sendDataToDisplayV3_(fsHeader, verifiedData, dataSheet)
    }
  }
}



function loadFSIntoObject_(data) {
  let name = []
  let emails = []
  let parentFolderIDs = []
  let childFolderIDs = []
  let sheetsIDs = []

  for (let item of data) {
    name.push(item[0])
    let email = []
    Logger.log([item[1], item[2]])
    email.push(item[5])
    email.push(item[6])
    emails.push(email)
    let folders = []
    let parentFolderID = item[1]
    let folderID = item[2]
    parentFolderIDs.push(item[1])
    childFolderIDs.push(item[2])
    // folders.push(item[1])
    // folders.push(item[2])
    // folderIDs.push(folders)
    let sheetIDs = []
    sheetIDs.push(item[3])
    sheetIDs.push(item[4])
    sheetsIDs.push(sheetIDs)
  }

  return {
    name: name,
    emails: emails,
    pFolderID: parentFolderIDs,
    cFolderID: childFolderIDs,
    // folderIDs,folderIDs,
    sheetsIDs: sheetsIDs
  }
}





function loadFSObjectIntoData_(fsObject) {
  let output = []
  for (let i = 0; i < fsObject.name.length; i++) {
    let outputPrototype = [fsObject.name[i]]


    outputPrototype.push(fsObject.pFolderID)
    outputPrototype.push(fsObject.cFolderID)
    let reportSheets = fsObject.sheetsIDs[i]
    if (typeof reportSheets == 'string') {
      outputPrototype.push(reportSheets)
    } else {
      for (let sheet of reportSheets) {
        outputPrototype.push(sheet)
      }
    }
    let emails = fsObject.emails[i]
    if (typeof emails == 'string') {
      outputPrototype.push(emails)
    } else {
      for (let email of emails) {
        outputPrototype.push(email)
      }
    }

    output.push(outputPrototype)

  }
  return output
} // Irrelevant in V3, because there's a METHOD that does that for me.  :)





function createNewFolder_(parentFolderId, name) {
  // creates new folder in parent folder, and then returns that folder's ID.
  if (isFolderAccessible_(parentFolderId) == false) {
    if (functionGUBED) { Logger.log(["folder Doesn't exist!", DriveApp.getRootFolder(), parentFolderId]) }
    // Logger.log()

    let parentFolderID = DriveApp.getFolderById(getParentFolderID_())
    let newFolderID = parentFolderID.createFolder(name).getId()
    return newFolderID
  } else {
    let parentFolder = DriveApp.getFolderById(parentFolderId)
    let newFolder = parentFolder.createFolder(name)
    let newFolderID = newFolder.getId()
    if (functionGUBED == true) { Logger.log(["FOLDER EXISTS", parentFolderId, newFolderID]) }
    return newFolderID

  }
  //return parentFolderId  // this was a test because my parent folder id's are kinda just junk strings right now.
}


// function sendDataToDisplayV3_(header, finalData, sheet) {
//   // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
//   sheet.clearContents()
//   sheet.appendRow(header)
//   if (functionGUBED == true) { Logger.log(finalData.length) }
//   Logger.log("adding Header")
//   Logger.log(header)
//   sheet.getRange(1, 1, 1, header.length).setValues([header])
//   Logger.log("added header, adding data")
//   sheet.getRange(2, 1, finalData.length, finalData[0].length).setValues(finalData)
//   Logger.log("Data added, sorting")
//   sheet.getRange(2, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }])
//   // Logger.log("data added")
// }

// function sendReportToDisplayV3_(header, finalData, sheet) {
//   // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
//   sheet.clearContents()
//   sheet.appendRow(header)
//   if (functionGUBED == true) { Logger.log(finalData.length) }
//   Logger.log("adding Header")
//   sheet.getRange(2, 1, 1, header.length).setValues([header])
//   Logger.log("added header, adding data")
//   sheet.getRange(3, 1, finalData.length, finalData[0].length).setValues(finalData)
//   Logger.log("data added, sorting")
//   sheet.getRange(3, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }])
//   // going to run this one more time without a flush to see what happens when this changes.
//   // SpreadsheetApp.flush()
//   // Logger.log("data added")
// }

function getUniqueFromPositionAndReturnArray_(gimmeDatArray, position) {  // this does the same thing as above, but keeps me from needing to iterate through everything twice. 
  let uniqueDataFromPosition = []
  let uniqueData = []
  for (let i = 0; i < gimmeDatArray.length; i++) {
    if (uniqueDataFromPosition.includes(gimmeDatArray[i][position]) == false) {
      uniqueData.push(gimmeDatArray[i])
      uniqueDataFromPosition.push(gimmeDatArray[i][position]) // if it's a match, then we do the thing, otherwise no.
    }
  }
  return {
    testForStringArray: uniqueDataFromPosition,
    uniquedData: uniqueData
  }
}

function splitRelevantContactData_(contactDataArray) {
  ///  let relevantContactDataHeader = ["Area Email","Area","District","Zone"]
  // for the big fat lookup function, whooooo
  let areaEmail = []
  let area = []
  let district = []
  let zone = []
  for (let contact of contactDataArray) {
    areaEmail.push(contact[0])
    area.push(contact[1])
    district.push(contact[2])
    zone.push(contact[3])
    // role1.push(contact[4])
    // role2.push(contact[7])
    // role3.push(contact[10])
  }
  return {
    areaEmailAddress: areaEmail,
    areaName: area,
    districtName: district,
    zoneName: zone,
    // role1:role1,
    // role2:role2,
    // role3:role3
  }
}

function splitParentData_(parentDataArray) {
  let area = []
  let areaEmail = []
  let areaParentFolder = []
  let areaFolderID = []
  let documentID = []

  for (let data of parentDataArray) {
    area.push(data[0])
    areaEmail.push(data[1])
    areaParentFolder.push(data[2])
    areaFolderID.push(data[3])
    documentID.push(data[4])
  }
  return {
    parentArea: area,
    parentEmail: areaEmail,
    grandparentFolder: areaParentFolder,
    parentFolder: areaFolderID,
    parentDocID: documentID
  }
}

function getParentFolderID_() {
  // from https://stackoverflow.com/questions/17582161/google-apps-spreadsheet-parents-folder-id
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let ssid = ss.getId();
  let fileInDrive = DriveApp.getFolderById(ssid);
  let folderinDrive = fileInDrive.getParents().next().getId();
  // Logger.log(folderinDrive)
  return folderinDrive
}





function isSheetReal_(docID) {
  // This just try catches to see if there's a folder, because for some reason this is the most effective way to do it...
  let output = true
  try {
    SpreadsheetApp.openById(docID)
  } catch (e) {
    output = false
  }
  return output
}

function getSheetOrSetUp_(sheetName, headerData) {

  let ss //Get currently Active sheet
  ss = SpreadsheetApp.getActiveSpreadsheet();

  // Checks to see if the sheet exists or not.
  let sheet = ss.getSheetByName(sheetName)
  if (!sheet) {
    sheet = ss.insertSheet(sheetName)
    sheet.appendRow(headerData);// Creating Header
  }
  return sheet
}

function getSheetDataWithHeader_(sheet) {
  let dataRows = sheet.getDataRange().getValues()
  let dataHeader = dataRows[0]

  dataRows.shift()

  return {
    data: dataRows,
    header: dataHeader
  }
}

function getUnique_(gimmeDatArray) {
  let uniqueData = []
  for (let i = 0; i < gimmeDatArray.length; i++) {
    if (uniqueData.includes(gimmeDatArray[i]) == false) {
      uniqueData.push(gimmeDatArray[i]) // if it's a match, then we do the thing, otherwise no.
    }
  }
  return uniqueData
}

function getUniqueFromPosition_(gimmeDatArray, position) {  // this does the same thing as above, but keeps me from needing to iterate through everything twice. 
  let uniqueDataFromPosition = []
  for (let i = 0; i < gimmeDatArray.length; i++) {
    if (uniqueDataFromPosition.includes(gimmeDatArray[i][position]) == false) {
      uniqueDataFromPosition.push(gimmeDatArray[i][position]) // if it's a match, then we do the thing, otherwise no.
    }
  }
  return uniqueDataFromPosition
}

