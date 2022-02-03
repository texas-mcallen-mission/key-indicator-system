//@ts-check
// I basically built a better way to load contactData... Now all I have to to is modify the importContacts thingy to use this system..... That'll happen much later tho


function getOrCreateReportFolder() {
    // looks for a folder named "Reports" in the folder this document is in or creates it, and returns a folderID for it.
    // ideally this function would let me have a reports folder that the filesystem generates inside of, but not sure what I need to do to get that working.
    // this is where I left off on 12/28/2021
    // completed on 12/29/2021

    let folderName = "Reports";
    let spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    let spreadsheetFile = DriveApp.getFileById(spreadsheetId);
    let parentFolder = spreadsheetFile.getParents();
    // let oneLinerParentFolderID = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next().getId()
    // Logger.log(oneLinerParentFolderID)
    // let parentFolderID = parentFolder.getId()
    // let parentFolderMatches = parentFolder.next()
    let nextFolder = parentFolder.next();
    let parentFolderID = nextFolder.getId();
    let matchingChildFolders = nextFolder.getFoldersByName(folderName);
    let reportsFolderID = "";
    if (matchingChildFolders.hasNext() == true) {
        reportsFolderID = matchingChildFolders.next().getId();
        Logger.log("reports folder found");
    } else {
        reportsFolderID = createNewFolderV3_(parentFolderID, folderName);
        Logger.log("reports folder not found, creating");
    }
    return reportsFolderID;
}

function createFilesysEntryV3_(name, parentFolder, scope) {
    /* This was originally going to have a lookup function in it, but Elder Gerlek convinced me to do nested for
     loops in the updateFilesys function instead (Honestly, it's a WAYYY better way to do it.)
    */
    let folderName = "";
    if (CONFIG.INCLUDE_SCOPE_IN_FOLDER_NAME) {
        folderName = name + " " + scope;
    } else {
        folderName = name;
    }


    let folder = "";
    let sheetReportID1 = "";
    let sheetReportID2 = "";
    folder = createNewFolderV3_(parentFolder, folderName);

    return new FilesystemEntry(folderName, parentFolder, folder, sheetReportID1, sheetReportID2);
}

class MissionaryData {
    constructor(name, pos, isTrainer) {
        this.name = name;
        this.pos = pos;
        this.isTrainer = isTrainer;
    }
}

class ContactObject {
    constructor(areaName, distName, zoneName, areaEmail, missionaryData, languageString, isSeniorCouple, isSisterArea, hasVehicle, vehicleMiles, vinLast8, apartmentAddress, dateGenerated, unitString, hasMultipleUnits) {
        this.areaName = areaName;
        this.distName = distName;
        this.zoneName = zoneName;
        this.areaEmail = areaEmail;
        this.missionaryData = missionaryData;
        this.languageString = languageString;
        this.isSeniorCouple = isSeniorCouple;
        this.isSisterArea = isSisterArea;
        this.hasVehicle = hasVehicle;
        this.vehicleMiles = vehicleMiles;
        this.vinLast8 = vinLast8;
        this.apartmentAddress = apartmentAddress;
        this.dateGenerated = dateGenerated;
        this.unitString = unitString;
        this.hasMultipleUnits = hasMultipleUnits;




    }

    toContactArray() {
        let missionaryDataArray = [];
        for (let i = 0; i < this.missionaryData.length; i++) {
            missionaryDataArray.push([this.missionaryData[i].name, this.missionaryData[i].pos, this.missionaryData[i].isTrainer]);
        }
        missionaryDataArray.push(["", "", ""]);
        // this has some weird breaking problems with third missionaries...


        return [
            this.dateGenerated, this.areaEmail, this.areaName,
            missionaryDataArray[0][0], missionaryDataArray[0][1], missionaryDataArray[0][2],
            missionaryDataArray[1][0], missionaryDataArray[1][1], missionaryDataArray[1][2],
            missionaryDataArray[2][0], missionaryDataArray[2][1], missionaryDataArray[2][2],
            // this.missionaryData[0].name, this.missionaryData[0].pos, this.missionaryData[0].isTrainer,
            // this.missionaryData[1].name, this.missionaryData[1].pos, this.missionaryData[1].isTrainer,
            // this.missionaryData[2].name, this.missionaryData[2].pos, this.missionaryData[2].isTrainer,
            this.distName, this.zoneName, this.unitString, this.languageString, this.isSeniorCouple, this.isSisterArea,
            this.hasVehicle, this.vehicleMiles, this.vinLast8
        ];
    }
}

function loadContactsIntoObj_(allSheetData) {
    let csd = allSheetData.contact; // contact sheet data
    let contactDataSheetName = csd.getTabName();
    let contactDataHeader = csd.getHeaders();

    console.info(`TODO: replace getSheetOrSetUp() with SheetData functions`);
    let loadedData = getSheetOrSetUp_(contactDataSheetName, contactDataHeader);
    let cData = getSheetDataWithHeader_(loadedData).data;

    let contacts = [];

    // THIS FUNCTION REQUIRES IMPORTCONTACTS TO WORK PROPERLY in order for this part to work at all

    for (let cl of cData) {

        let compaData = [];
        let dateGenerated = cl[csd.getIndex("dateContactGenerated")];    // let dateGenerated = cl[csd.getIndex("dateContactGenerated")]
        let areaEmail = cl[csd.getIndex("areaEmail")];                   // let areaEmail = cl[csd.getIndex("areaEmail")]
        let areaName = cl[csd.getIndex("areaName")];                     // let areaName = cl[2]
        let missionary1 = new MissionaryData(cl[csd.getIndex("name1")], cl[csd.getIndex("position1")], cl[csd.getIndex("isTrainer1")]);    // let missionary1 = new MissionaryData(cl[3], cl[4], cl[5])
        let missionary2 = new MissionaryData(cl[csd.getIndex("name2")], cl[csd.getIndex("position2")], cl[csd.getIndex("isTrainer2")]);    // let missionary2 = new MissionaryData(cl[6], cl[7], cl[8])
        let missionary3 = new MissionaryData(cl[csd.getIndex("name3")], cl[csd.getIndex("position3")], cl[csd.getIndex("isTrainer3")]);    // let missionary3 = new MissionaryData(cl[9], cl[10], cl[11])

        let distName = cl[csd.getIndex("district")];                     // let distName = cl[12]
        let zoneName = cl[csd.getIndex("zone")];                         // let zoneName = cl[13]
        let unitString = cl[csd.getIndex("unitString")];                 // let unitString = cl[14]
        let hasMultipleUnits = cl[csd.getIndex("hasMultipleUnits")];     // let hasMultipleUnits = cl[15]
        let languageString = cl[csd.getIndex("languageString")];         // let languageString = cl[16]
        let isSeniorCouple = cl[csd.getIndex("isSeniorCouple")];         // let isSeniorCouple = cl[17]
        let isSisterArea = cl[csd.getIndex("isSisterArea")];             // let isSisterArea = cl[18]
        let hasVehicle = cl[csd.getIndex("hasVehicle")];                 // let hasVehicle = cl[19]
        let vehicleMiles = cl[csd.getIndex("vehicleMiles")];             // let vehicleMiles = cl[20]
        let vinLast8 = cl[csd.getIndex("vinLast8")];                     // let vinLast8 = cl[21]
        let apartmentAddress = cl[csd.getIndex("aptAddress")];           // let apartmentAddress = cl[22]


        if (cl[csd.getIndex("name1")] != "") {/*Logger.log(cl[3])*/; compaData.push(missionary1); }
        if (cl[csd.getIndex("name2")] != "") {/*Logger.log(cl[6])*/; compaData.push(missionary2); }
        if (cl[csd.getIndex("name3")] != "") {/*Logger.log(cl[9])*/; compaData.push(missionary3); }
        // Logger.log(compaData)

        let iC = new ContactObject(areaName, distName, zoneName, areaEmail, compaData, languageString, isSeniorCouple, isSisterArea, hasVehicle, vehicleMiles, vinLast8, apartmentAddress, dateGenerated, unitString, hasMultipleUnits);
        contacts.push(iC);
    }
    // Logger.log(contacts[1])
    // Logger.log(contacts)
    return contacts;
}


