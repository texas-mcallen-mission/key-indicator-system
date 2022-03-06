//@ts-check
function getSheetOrSetUpFromOtherSource(sheetName, headerData, targetSpreadsheet) {
  // TODO No longer referenced.
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

function getSheetOrSetUp_(sheetName, headerData) {
  let ss; //Get currently Active sheet
  ss = SpreadsheetApp.getActiveSpreadsheet();

  // Checks to see if the sheet exists or not.
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headerData); // Creating Header
  }
  return sheet;
}

function splitToDataStruct(filesysData) {
    // TODO No longer referenced.
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
    // TODO No longer referenced.
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
