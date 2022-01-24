

function createFS() {
  createFilesystemV3()
  // updateZoneReports()
  // updateDistrictReports()
  // updateAreaReports()
}

const reportLevel = {
  zone: "ZONE",
  dist: "DISTRICT",
  area: "AREA"
  /*
  theoretically, since there's no difference between this anywhere you 
  should be able to change this to be whatever gibberish you want as 
  long as they're unique.  These strings also included in folder naming if 
  INCLUDE_SCOPE_IN_FOLDER_NAME is set to true, so don't make them too pithy.
  */
}


function verifyFilesystem(){
  let allSheetData = constructSheetData()
  Logger.log("initializing filesystem")
  let zoneMeta = dataLoader_(allSheetData,reportLevel.zone)
  let distMeta = dataLoader_(allSheetData,reportLevel.dist)
  let areaMeta = dataLoader_(allSheetData,reportLevel.area)

  Logger.log("Beginning Verification")
  let zoneFSupdated = verifySingleFilesysV3_(zoneMeta.fsObj)
  let distFSupdated = verifySingleFilesysV3_(distMeta.fsObj)
  let areaFSupdated = verifySingleFilesysV3_(areaMeta.fsObj)

  Logger.log("Converting FSobj to writeable data")
  let zoneOutData = getDataFromArray_(zoneFSupdated,zoneMeta.sheetData)
  let distOutData = getDataFromArray_(distFSupdated,distMeta.sheetData)
  let areaOutData = getDataFromArray_(areaFSupdated,areaMeta.sheetData)
  Logger.log("writing data")
  sendDataToDisplayV3_(zoneMeta.splitData.header,zoneOutData,zoneMeta.sheet)
  sendDataToDisplayV3_(distMeta.splitData.header,distOutData,distMeta.sheet)
  sendDataToDisplayV3_(areaMeta.splitData.header,areaOutData,areaMeta.sheet)
  
}


// function verifySingleFilesysWrapper(){
//   let allSheetData = constructSheetData()
//   Logger.log("Initializing filesystem for " + reportLevel.zone )
//   let zoneMeta = dataLoader_(allSheetData,reportLevel.zone)
//   Logger.log("Beginning Verification")
//   let updatedFSObj = verifySingleFilesysV3_(zoneMeta.fsObj)
//   Logger.log("Updating sheet")
//   let outData = getDataFromArray_(updatedFSObj,zoneMeta.sheetData)
//   sendDataToDisplayV3_(zoneMeta.splitData.header,outData,zoneMeta.sheet)
//   Logger.log("DONE")
// }

// this little one-liner gets the root folder of the drive in case the reports folder is not found.
var reportRootFolder = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next().getId()


function dataLoader_(allSheetData, scope) {
  let sheetDataClass

  switch (scope) {
    case reportLevel.zone:
      sheetDataClass = allSheetData.zoneFilesys
      break;
    case reportLevel.dist:
      sheetDataClass = allSheetData.distFilesys
      break;
    case reportLevel.area:
      sheetDataClass = allSheetData.areaFilesys
  }
  let sheetObj = sheetDataClass.getSheet()
  // split will have to get changed once Elder Gerlek updates his chunks; headerSplit_ won't need to exist for much longer.
  let split = headerSplit_(sheetObj.getDataRange().getValues())
  let fsObj = loadFSIntoClass_(split.data, sheetDataClass)

  return {
    sheetData: sheetDataClass,
    sheet: sheetObj,
    splitData: split,
    fsObj: fsObj
  }
}

function testOrgData() {
  let allSheetData = constructSheetData()

  let contacts = getContactData(allSheetData)
  let contactSheetData = allSheetData.contact

}

// NEXT STEP: MAKE A FS VERIFIER.  NOT SURE HOW TO DO THAT YET BUT SHOULD BE GOOD


function createFilesystemV3() {
  // WHERE YOU LEFT OFF:
  /*
    Elder Gerlek's Mission Org data thingy lets me do the triple-loop thingy the way I wanted to in the first place.
     All I've gotta do now is figure out how to iterate through it and check to see if a folder already exists
    This function is written but untested as of 1/15/2022 5:25pm
  */

  reportRootFolder = getOrCreateReportFolder()
  let allSheetData = constructSheetData()

  let contacts = getContactData(allSheetData)
  let contactSheetData = allSheetData.contact

  // let allSheetData = constructSheetData()
  // let contacts = getContactData(allSheetData)
  // let orgLeaderData = getMissionLeadershipData(contacts)
  // Logger.log(orgLeaderData)

  let orgData = getMissionOrgData(allSheetData)

  let zoneMeta = dataLoader_(allSheetData, reportLevel.zone)
  let distMeta = dataLoader_(allSheetData, reportLevel.dist)
  let areaMeta = dataLoader_(allSheetData, reportLevel.area)

  let returnedData = updateFilesysV3_(zoneMeta, distMeta, areaMeta, orgData, reportRootFolder)

  Logger.log(returnedData)

  // Logger.log(["SHEETIDTEST", zoneMeta.loader.getIndex("sheetID1")])

  let zoneOutData = getDataFromArray_(returnedData.zoneFilesys,zoneMeta.sheetData)
  sendDataToDisplayV3_(zoneMeta.splitData.header, zoneOutData, zoneMeta.sheet)

  let distOutData = getDataFromArray_(returnedData.distFilesys,distMeta.sheetData)
  sendDataToDisplayV3_(distMeta.splitData.header, distOutData, distMeta.sheet)

  let areaOutData = getDataFromArray_(returnedData.areaFilesys,areaMeta.sheetData)
  sendDataToDisplayV3_(areaMeta.splitData.header, areaOutData, areaMeta.sheet)



}
function updateFS_getCreateFolderObj_(preData, name, parentFolder, scope) {
  // WHERE YOU LEFT OFF:
  // the code directly below this needs to get used in three scopes and is easily generalizable, so do it
  let folderObj
  if (preData.names.includes(name + "" + scope) == true) {
    Logger.log("Folder already exists for " + name + " " + scope)
    let folderPosition = preData.names.indexOf(name)
    folderObj = preData.fileObjArray[folderPosition]
  } else if (preData.names.includes(name)) {
    Logger.log("Folder already exists for " + name)
    let folderPosition = preData.names.indexOf(name)
    folderObj = preData.fileObjArray[folderPosition]
  } else {
    folderObj = createFilesysEntryV3_(name, parentFolder, scope)
  }
  return folderObj
}
function testy() {
  let allSheetData = constructSheetData()
  let contacts = getContactData(allSheetData)
  let orgLeaderData = getMissionLeadershipData(contacts)
  Logger.log(orgLeaderData)
}

function getFilesAndNames(fsObject) {
  let folderNames = []
  let files = []
  for (file of fsObject) {
    folderNames.push(file.folderName)
    files.push(file)
  }
  return {
    names: folderNames,
    fileObjArray: files
  }
}

function updateFilesysV3_(zoneMetaObj, distMetaObj, areaMetaObj, orgData, reportBaseFolder) {
  // returns an array of filesys objects





  // let zoneRequiredEntries = getRequiriedEntries_(contactInfo, reportLevel.zone)

  let anyUpdates = false
  let preZoneData = { names: [], fileObjArray: [] }
  let preDistData = { names: [], fileObjArray: [] }
  let preAreaData = { names: [], fileObjArray: [] }
  if (zoneMetaObj.fsObj.length > 0) { preZoneData = getFilesAndNames(zoneMetaObj.fsObj) }
  if (areaMetaObj.fsObj.length > 0) { preAreaData = getFilesAndNames(areaMetaObj.fsObj) }
  if (distMetaObj.fsObj.length > 0) { preDistData = getFilesAndNames(distMetaObj.fsObj) }

  zFolderObjs = []
  dFolderObjs = []
  aFolderObjs = []




  for (let zone in orgData) {
    Logger.log(zone)
    // pre-check to see if folder already exists
    // let zFolderID = ""  // Originally was going to need this but realized if I use the folderObj I'll probably have less problems
    let zFolderObj = updateFS_getCreateFolderObj_(preZoneData, zone, reportBaseFolder, reportLevel.zone)
    zFolderObjs.push(zFolderObj)
    Logger.log(orgData[zone])
    Logger.log(zFolderObj)

    for (district in orgData[zone]) {
      Logger.log(district)
      let dFolderObj = updateFS_getCreateFolderObj_(preDistData,district,zFolderObj.folder,reportLevel.dist)
      dFolderObjs.push(dFolderObj)
      for (area of orgData[zone][district]) {
        let aFolderObj = updateFS_getCreateFolderObj_(preAreaData,area,dFolderObj.folder,reportLevel.area)
        aFolderObjs.push(aFolderObj)
        Logger.log(area)
      }
    }
  }
  return {
    zoneFilesys: zFolderObjs,
    distFilesys: dFolderObjs,
    areaFilesys: aFolderObjs
  }
}

  

function createNewFolderV3_(parentFolderId, name) {
  // creates new folder in parent folder, and then returns that folder's ID.
  // if (isFolderReal_(parentFolderId) == false) {
  //   // this was basically  a workaround to make sure that I could create folders while the subdirectory handler wasn't implemented, but I stand by the design decision and it stays.  -JR 12/30/2021
  //   if (functionGUBED == true) { Logger.log(["folder Doesn't exist!", DriveApp.getRootFolder(), parentFolderId]) }
  //   // Logger.log()

  //   // let parentFolderID = DriveApp.getFolderById(getParentFolderID_())
  //   let newFolderID = parentFolderID.createFolder(name).getId()
  //   return newFolderID
  // } else {
    Logger.log(parentFolderId)
    let parentFolder = DriveApp.getFolderById(parentFolderId)
    let newFolder = parentFolder.createFolder(name)
    let newFolderID = newFolder.getId()
    if (functionGUBED == true) { Logger.log(["FOLDER EXISTS", parentFolderId, newFolderID]) }
    return newFolderID

  // }
  //return parentFolderId  // this was a test because my parent folder id's are kinda just junk strings right now.
}

function getRequiriedEntries_(contactInfo, scope) {
  // this is a generalized version of a thing I wrote like four times the exact same way.  HAHA
  let output = []
  for (let areaID in contactInfo) {
    let contactData = contactInfo[areaID]
    switch (scope) {
      case reportLevel.zone:
        output.push(contactData.areaData.zone)
        break;
      case reportLevel.dist:
        output.push(contactData.areaData.district)
        break;
      case reportLevel.area:
        output.push(contactData.areaData.areaName)
    }
  }
  output = getUniqueV3_(output)
  return output
}

function getUniqueV3_(gimmeDatArray) {
  let uniqueData = []
  for (let i = 0; i < gimmeDatArray.length; i++) {
    if (uniqueData.includes(gimmeDatArray[i]) == false) {
      uniqueData.push(gimmeDatArray[i]) // if it's a match, then we do the thing, otherwise no.
    }
  }
  return uniqueData
}

function isFolderReal_(folderID) {
  // This just try catches to see if there's a folder, because for some reason this is the most effective way to do it...
  let output = true
  try {
    DriveApp.getFolderById(folderID)
  } catch (e) {
    output = false
  }
  return output
}


function headerSplit_(data) {
  let outData = data
  let header = outData.shift()
  return {
    data: outData,
    header: header
  }
}

function loadFSIntoClass_(data) {

  let fsData = []

  for (item of data) {
    let email = []
    email.push(item[5])
    email.push(item[6])
    // this is a basic loader doodad, it can become more smart in the future if I want it to by incorporating Elder Gerlek's sheetloader indexOf thingy.
    let entry = new FilesystemEntry(item[0], item[1], item[2], item[3], item[4], email)
    fsData.push(entry)
  }

  return fsData
}

