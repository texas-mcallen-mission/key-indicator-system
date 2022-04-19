/**
 *  Step 0: load Filesystem Data
 *  Step 1: Iterate through the filesystem
 *      
 * 
 *  Step 3: Create A Single Template
 *      - Return sheet ID
 */


function createMissingTemplates() {
    let localSheetData: manySheetDatas = constructSheetDataV2(sheetDataConfig.local);
    let fsDataEntries: manyFilesystemEntries = loadFilesystems_(localSheetData);
    let reportTemplates = {
        "Zone": INTERNAL_CONFIG.reportCreator.docIDs.zoneTemplate,
        "District": INTERNAL_CONFIG.reportCreator.docIDs.distTemplate,
        "Area": INTERNAL_CONFIG.reportCreator.docIDs.areaTemplate
    }
    let newReportCounter = 0
    for (let fsDataEntry in fsDataEntries) {
        let fsData:filesystemEntry = fsDataEntries[fsDataEntry]
        for (let entry of fsData.sheetData) {
            if (entry.sheetID1 == "" || typeof entry.sheetID1 == null || typeof entry.sheetID1 == undefined) {
                entry.sheetID1 = makeCopyOfTemplate(reportTemplates[fsData.fsScope], entry.folderId, entry.folderName)
                newReportCounter += 1
            }
        }
        fsData.fsData.setData(fsData.sheetData)
        if (newReportCounter > 1) { console.log("Created ", newReportCounter, "reports")}
        if (newReportCounter = 1) { console.log("Created ", newReportCounter, "report")}
    }
}

function makeCopyOfTemplate(templateID:string,reportFolderID:string,reportName:string) {
    let file = DriveApp.getFileById(templateID)
    let folder = DriveApp.getFolderById(reportFolderID)
    let newFile = file.makeCopy(reportName, folder)
    return newFile.getId()
}
