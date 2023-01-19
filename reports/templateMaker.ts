/**
 *  Step 0: load Filesystem Data
 *  Step 1: Iterate through the filesystem
 *      
 * 
 *  Step 3: Create A Single Template
 *      - Return sheet ID
 */

/**
 *  Creates templates that are missing from the guys.
 *   requires the config
 *
 */
function createMissingReports() {
    const localSheetData: manySheetDatas = constructSheetDataV2(sheetDataConfig.local);
    const fsDataEntries: manyFilesystemEntries = loadFilesystems_(localSheetData);
    const reportTemplates = {
        "Zone": CONFIG.reportCreator.docIDs.zoneTemplate,
        "District": CONFIG.reportCreator.docIDs.distTemplate,
        "Area": CONFIG.reportCreator.docIDs.areaTemplate
    }
    let newReportCounter = 0
    for (const fsDataEntry in fsDataEntries) {
        const fsData:filesystemEntry = fsDataEntries[fsDataEntry]
        for (const entry of fsData.sheetData) {
            if (entry.sheetID1 == "" || typeof entry.sheetID1 == null || typeof entry.sheetID1 == undefined) {
                entry.sheetID1 = makeCopyOfTemplate(reportTemplates[fsData.fsScope], entry.folderId, entry.folderName)
                newReportCounter += 1
            }
        }
        fsData.fsData.setData(fsData.sheetData)
        if (newReportCounter > 1)  { console.log("Created ", newReportCounter, "reports")}
        if (newReportCounter == 1) { console.log("Created ", newReportCounter, "report")}
    }
}

function makeCopyOfTemplate(templateID:string,reportFolderID:string,reportName:string) {
    const file = DriveApp.getFileById(templateID)
    const folder = DriveApp.getFolderById(reportFolderID)
    const newFile = file.makeCopy(reportName, folder)
    return newFile.getId()
}
