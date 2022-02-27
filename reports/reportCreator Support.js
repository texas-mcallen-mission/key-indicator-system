//@ts-check
function getSheetOrSetUpFromOtherSource(
  sheetName,
  headerData,
  targetSpreadsheet
) {
  let ss; //Get currently Active sheet
  ss = targetSpreadsheet;

  // Checks to see if the sheet exists or not.
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headerData); // Creating Header
  }
  return sheet;
}

function getReportFromOtherSource(sheetName, targetSpreadsheet) {
  let ss; //Get currently Active sheet
  ss = targetSpreadsheet;

  // Checks to see if the sheet exists or not.
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // sheet.appendRow(headerData);// Creating Header
  }
  return sheet;
}

function splitToDataStruct(filesysData) {
  //Zone Name String, ZL Email, Parent Folder ID, Zone Folder ID, Document ID
  let name = [];

  let parentFolderId = [];
  let docId = [];
  let folderId = [];

  for (let data of filesysData) {
    name.push(data[0]);

    parentFolderId.push(data[1]);
    Logger.log(["FolderID:", data[2]]);
    folderId.push(data[2]);
    docId.push(data[3]);
  }
  Logger.log(folderId);
  Logger.log(filesysData[3]);
  return {
    name: name,

    parentFolderID: parentFolderId,
    folderID: folderId,
    docID: docId,
  };
}

function filterLine_(data, dataHeader) {
  // dataheader is a feature for the future, I guess
  // in the future the positions should be un-hard-coded
  let outData = data;
  let vehicleMilesPos = 21;
  let vehicleVinPos = 22;
  let aptAddressPos = 23;
  // this is hardcoded and simple because that makes it faster.

  outData[vehicleMilesPos] = "";
  outData[vehicleVinPos] = "";
  outData[aptAddressPos] = "";

  return outData;
}

// function testFilterLine() {
//   let testData = ["BIG.AREA", "WIP - log is unimplemented", "000000@missionary.org", "FALSE", "1/8/2022 15:52:59", "A000000", "1/2/2022", "0", "1", "1", "0", "1", "3", "1", "Ronald McDonald", "SC", "FALSE", "Joaquin Phoenix", "JC", "FALSE", "", "", "", "Big McDL", "Hyper ZL 2", "", "Mellow ZL1", "", "", "", "", "", "", "APE2", "APE1", "", "Dorito", "Zona", "small.UNIT", "FALSE", "Spanish", "FALSE", "TRUE", "TRUE", "1000", "AZ012345", "Some Street", "Y'ALL ARE THE BEST", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "1", "Defensive moderator", ""]
//   // Logger.log(testData.length)
//   let test = filterLine_(testData, mainDataSheetHeader)
//   // Logger.log(test)
// }

// function testSplit() {
//   let kicDataSheet = getSheetOrSetUp_(kicDataStoreSheetName, ["", ""])
//   let kicData = kicDataSheet.getDataRange().getValues()
//   let kicHeader = kicData[0]
//   kicData.shift()
//   let splitDataByZone = splitDataByTagEliminateDupes(kicData)
//   // Logger.log(splitDataByZone)
// }
