//@ts-check
// Written by Elder Lo Forte

function importContactsV2(allSheetData: manySheetDatas): void {

    console.time('Execution Time');

    //const allSheetData : manySheetDatas= constructSheetDataV3(["closedAreas", "contact"])

    const closedAreasSheet: SheetData = allSheetData.closedAreas;
    const contactDataSheet: SheetData = allSheetData.contact;

    // gets old data and new data
    const ogDataClass = new kiDataClass(contactDataSheet.getData());
    const newContactData: contactEntry[] = getArrayOfContacts();


    // if there are less than 5 contacts... (Thank you Elder Perez) it will throw an error
    if (newContactData.length <= 5) {
        console.error("Contacts Probably got deleted!!!!");
        throw "Oh Boy The Contacts Se fue!";
    }
    contactDataSheet.setData(newContactData); // sets the new data

    const newContactClass = new kiDataClass(newContactData);

    // pulls all of the closed areas
    const newAreaIDs: string[] = newContactClass.getDataFromKey("areaID");
    ogDataClass.removeMatchingByKey("areaID", newAreaIDs);
    ogDataClass.bulkAppendObject({
        "deletionDate": convertToSheetDate_(new Date())
    });
    const leftovers: kiDataEntry[] = ogDataClass.end;

    // if nothing changes dont push it
    if (leftovers.length > 0) {
        closedAreasSheet.appendData(leftovers);
    }

    console.timeEnd('Execution Time');

}

function testAllClosedAreas() {
    const allSheetData: manySheetDatas = constructSheetDataV3(["closedAreas", "contact", "data"]);
    getAllClosedAreas(allSheetData);
}
/**
 * one time thing you give it allSheetData and it gets all the closed areas... and appends it to Closed Area Sheet
 *
 * @param {*} allSheetData
 */
function getAllClosedAreas(allSheetData) {
    importContactsV2(allSheetData); // updates contact information

    // gets all of the data
    const newContactData = new kiDataClass(allSheetData.contact.getData()).getDataFromKey("areaID");
    const ogClosedData = new kiDataClass(allSheetData.closedAreas.getData()).getDataFromKey("areaID");
    const kiData = new kiDataClass(allSheetData.data.getData());

    // removes douplicate areaID's
    kiData.removeMatchingByKey("areaID", newContactData);
    kiData.removeMatchingByKey("areaID", ogClosedData);

    const groupedData: keyedKiDataEntries = kiData.groupByKey("areaID"); // groups it all

    const closedMostRecent: kiDataEntry[] = [];
    for (const entry in groupedData) { // loops through the groupedData and gets the newest kiDataEntry
        const mostRecent: kiDataEntry = getMostRecentKiEntryByDateKey_(groupedData[entry], "kiDate");
        mostRecent.deletionDate = mostRecent.kiDate;
        closedMostRecent.push(mostRecent);
    }

    allSheetData.closedAreas.appendData(closedMostRecent);
}

/**
 * gets the most recent kiDataEntry given an array and a key
 *
 * @param {kiDataEntry[]} kiData
 * @param {string} dateKey
 * @return {*}  {kiDataEntry}
 */
function getMostRecentKiEntryByDateKey_(kiData: kiDataEntry[], dateKey: string): kiDataEntry {
    let testVal: kiDataEntry = kiData[0];
    for (const entry of kiData) {
        const comparisonDate: Date = new Date(entry[dateKey]);
        const testDate: Date = new Date(testVal[dateKey]);

        if (comparisonDate.getTime() < testDate.getTime()) {
            testVal = entry;
        }

    }
    return testVal;

}

/*
pretty much just loops all of the contacts and pulls all of the data
*/
function getArrayOfContacts(): contactEntry[] {

    //Pull in contact data from Google Contacts
    const group: GoogleAppsScript.Contacts.ContactGroup = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
    const contacts: GoogleAppsScript.Contacts.Contact[] = group.getContacts(); // Fetches contact list of group 

    const arrayOfContacts: contactEntry[] = [];
    for (const contact of contacts) {
        arrayOfContacts.push(convertToContactData(contact));
    }
    return arrayOfContacts;

} // end wirteArray




/*
Gets all of the data from the contact and retruns it as an object with the contactEntry interface.

*/
function convertToContactData(c: GoogleAppsScript.Contacts.Contact): contactEntry {

    // declares cDataObject as a contactEntry
    const cDataObject: contactEntry = {
        dateContactGenerated: '',
        areaEmail: '',
        areaName: '',
        name1: '',
        position1: '',
        isTrainer1: false,
        name2: '',
        position2: '',
        isTrainer2: false,
        name3: '',
        position3: '',
        isTrainer3: false,
        district: '',
        zone: '',
        unitString: '',
        hasMultipleUnits: false,
        languageString: '',
        isSeniorCouple: false,
        isSisterArea: false,
        hasVehicle: false,
        vehicleMiles: '',
        vinLast8: '',
        aptAddress: '',
        areaID: '',
        phoneNumber: '',
        missionaryEmail1: '',
        missionaryEmail2: '',
        missionaryEmail3: '',
    };

    const allEmails = c.getEmails();

    // Array.shift() returns the top entry in an array and removes it.
    const areaEmail = allEmails.shift();
    cDataObject["areaEmail"] = areaEmail.getAddress();
    cDataObject["areaName"] = areaEmail.getDisplayName();
    // loops through each email and sets the name, position and, isTrainer
    for (let i = 0; i < allEmails.length; i++) {
        const entry = allEmails[i];
        const epos = i + 1; // Position
        cDataObject["name" + epos] = entry.getDisplayName();
        const label = entry.getLabel().toString();
        cDataObject["position" + epos] = label.slice(-5).replace(/[^a-z0-9]/gi, ''); // .replace(/[^a-z]/gi, '') makes only letters and numbers
        cDataObject["isTrainer" + epos] = isTrainer(cDataObject["position" + epos]);
        cDataObject["missionaryEmail" + epos] = entry.getAddress().toString();
    }

    cDataObject.dateContactGenerated = c.getLastUpdated().toDateString(); // date last updates

    cDataObject.areaEmail = c.getEmails()[0].getAddress(); // getting areaEmail


    // everything from notes
    const getNotes: string = c.getNotes().toString().replaceAll(": ", ":");
    const getNotesArray: string[] = getNotes.split("\n");


    /*
    every contact has a note section
    this gets the notes and splits it by new line
    Then it splits it all by ":" then it looks up the data and sets it based on all of that...
    */
    for (let i = 0; i < getNotesArray.length; i++) {

        const objectNotes: string[] = getNotesArray[i].split(":");

        const type: string = objectNotes[0];
        const words: string = objectNotes[1];

        if (type.includes("Area")) cDataObject.areaName = words;
        if (type.includes("Zone")) cDataObject.zone = words;
        if (type.includes("District")) cDataObject.district = words;
        if (type.includes("Ecclesiastical Unit")) cDataObject.unitString = words.trim();
        if (type.includes("Ecclesiastical Units")) cDataObject.hasMultipleUnits = true;

        //Vehicle stuff all right here
        if (type.includes("Vehicle")) cDataObject.hasVehicle = true;

        if (cDataObject.hasVehicle) {
            if (type.includes("Vehicle VIN Last 8")) cDataObject.vinLast8 = words;
            if (type.includes("Vehicle Allowance/Mo")) cDataObject.vehicleMiles = words;
        }

        // gets tells if its a sisters or elders area
        if (c.getNotes().includes("Junior Sister")) cDataObject.isSisterArea = true;

        // tells if its a senior or not
        if (c.getNotes().includes("Senior Couple")) cDataObject.isSeniorCouple = true;
    }

    // getting address of apt.
    if (c.getAddresses().length != 0) cDataObject.aptAddress = c.getAddresses()[0].getAddress().toString().replace("\n", " ").replace("\n", " ");
    // .replace("\n", " ").replace("\n", " ") makes it get rid of new lines and one line

    // gets the area id's
    const areaID: string = "A" + cDataObject.areaEmail.replace("@missionary.org", "");
    cDataObject.areaID = areaID;

    // gets phone number
    const phones: GoogleAppsScript.Contacts.PhoneField[] = c.getPhones();
    const phoneNumbers: string[] = [];
    for (const entry of phones) {
        phoneNumbers.push(entry.getPhoneNumber());
    }
    cDataObject.phoneNumber = phoneNumbers.join(", ");

    return cDataObject;
}

// put in the position and tells me if its a trainer or not... that is all
function isTrainer(position: string): boolean {
    switch (position) {
        case "TR":
        case "DT":
        case "ZLT":
        case "STLT":
            return true;
        default:
            return false;
    } // end switch
} // end isTrainer