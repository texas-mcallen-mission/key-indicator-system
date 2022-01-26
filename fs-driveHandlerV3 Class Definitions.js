//@ts-check

class FilesystemEntry {
  constructor(name, parentFolderID, folderID, sheetReportID1, sheetReportID2) {
    this.folderName = name
    this.parentFolder = parentFolderID
    this.folder = folderID
    this.sheetID1 = sheetReportID1
    this.sheetID2 = sheetReportID2
    // updated on 12/28/2021 to bring into the same format as the setup in sheetData for filesys entries
  }
  toArray() {
    return [this.folderName, this.parentFolder, this.folder, this.sheetID1, this.sheetID2]
  }

  toArrayFancy(sheetData) {
    // this one gives data that matches up with the SheetData order
    // thus making it 100% compliant with changes that Elder Gerlek may make in the future to the formatting.
    let outArray = []
    outArray[sheetData.getIndex("folderName")] = this.folderName
    outArray[sheetData.getIndex("parentFolder")] = this.parentFolder
    outArray[sheetData.getIndex("folder")] = this.folder
    outArray[sheetData.getIndex("sheetID1")] = this.sheetID1
    outArray[sheetData.getIndex("sheetID2")] = this.sheetID2
    return outArray
  }
}

/*
      "folderName": 0,
      "parentFolder":1,
      "folder":2,
      "sheetID1":3,
      "sheetID2":4,
*/

function getDataFromArray_(fsObjArray, sheetData) {
  let outData = []
  for (let entry of fsObjArray) {
    outData.push(entry.toArrayFancy(sheetData))
  }
  return outData
}

function loadFSIntoClass_(data, sheetData) {
  // this function and the toArray function will need to be changed if the column order gets changed.
  let fsData = []

  for (let item of data) {
    // this is a basic loader doodad, it can become more smart in the future if I want it to by incorporating Elder Gerlek's sheetloader indexOf thingy.
    let entry = new FilesystemEntry(item[sheetData.getIndex("folderName")], item[sheetData.getIndex("parentFolder")], item[sheetData.getIndex("folder")], item[sheetData.getIndex("sheetID1")], item[sheetData.getIndex("sheetID2")])
    fsData.push(entry)
  }

  return fsData
}

