// I'm going to compile the functions I've wound up using a lot here so that they're easier to find
// created by Bert

function sendDataToDisplayV3_(header, finalData, sheet) {
  // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
  sheet.clearContents()
  sheet.appendRow(header)
  if (functionGUBED == true) { Logger.log(finalData.length) }
  Logger.log("adding Header")
  Logger.log(header)
  sheet.getRange(1, 1, 1, header.length).setValues([header])
  Logger.log("added header, adding data")
  sheet.getRange(2, 1, finalData.length, finalData[0].length).setValues(finalData)
  Logger.log("Data added, sorting")
  sheet.getRange(2, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }])
  // Logger.log("data added")
}

function sendReportToDisplayV3_(header, finalData, sheet) {
  // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
  sheet.clearContents()
  sheet.appendRow(header)
  if (functionGUBED == true) { Logger.log(finalData.length) }
  Logger.log("adding Header")
  sheet.getRange(2, 1, 1, header.length).setValues([header])
  Logger.log("added header, adding data")
  sheet.getRange(3, 1, finalData.length, finalData[0].length).setValues(finalData)
  Logger.log("data added, sorting")
  sheet.getRange(3, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }])
  // going to run this one more time without a flush to see what happens when this changes.
  // SpreadsheetApp.flush()
  // Logger.log("data added")
}




function splitDataByTagEliminateDupes(referenceData, tagColumn, dupeColumn) {
  //currently just for zones, but we'll change that once I know this thing actually works.
  let checkPosition = tagColumn // for zones
  let tagList = getUniqueFromPosition_(referenceData, checkPosition)
  // Logger.log(tagList)
  let splitData = {}//[tagList.length]
  // set up splitData
  for (tag of tagList) {
    splitData[tag] = []
  }
  for (data of referenceData) {
    let refTag = data[checkPosition]
    // Logger.log(refTag)
    if (tagList.includes(refTag) == true && (data[dupeColumn] == false || dupeColumn == null /*typeof dupeColumn == "undefined" (ONLY IF THAT DOESN'T WORK)*/)) {
      currentTag = tagList[tagList.indexOf(refTag)]
      // Logger.log(currentTag)
      // Logger.log(tagList.indexOf(refTag))
      splitData[currentTag].push(data)
    }
  }
  return { data: splitData, tagArray: tagList }
}

function splitDataByTag(referenceData, tagColumn) {
  //currently just for zones, but we'll change that once I know this thing actually works.
  let checkPosition = tagColumn // for zones
  let tagList = getUniqueFromPosition_(referenceData, checkPosition)
  // Logger.log(tagList)
  let splitData = {}//[tagList.length]
  // set up splitData
  for (tag of tagList) {
    splitData[tag] = []
  }
  for (data of referenceData) {
    let refTag = data[checkPosition]
    // Logger.log(refTag)
    if (tagList.includes(refTag) == true) {
      currentTag = tagList[tagList.indexOf(refTag)]
      splitData[currentTag].push(data)
    }
  }
  return { data: splitData, tagArray: tagList }
}