function makeSheet(): void {

  console.time('Execution Time');

  const closedAreasSheet = new SheetData(new RawSheetData(sheetDataConfig.local.closedAreas));
  const loForteContacts = new SheetData(new RawSheetData(sheetDataConfig.local.contact));

  // gets old data and new data
  const ogClass = new kiDataClass(loForteContacts.getData())
  const newContactData: contactEntry[] = getArrayOfContacts();
  loForteContacts.setData(newContactData); // sets the new data

  const newContactClass = new kiDataClass(newContactData);

  // pulls all of the closed areas
  const newAreaIds: string[] = newContactClass.getDataFromKey("areaId");
  ogClass.removeMatchingByKey("areaId", newAreaIds);
  ogClass.bulkAppendObject({
    "deletionDate": convertToSheetDate_(new Date())
  })
  const leftovers: kiDataEntry[] = ogClass.end

  // if nothing changes dont push it
  if (leftovers.length > 0) {
    closedAreasSheet.appendData(leftovers);
  }

  console.timeEnd('Execution Time');

}
/*
pretty much just loops all of the contacts and pulls all of the data
if there are less than 5 contacts... (Thank you Elder Perez) it will throw an error
*/
function getArrayOfContacts(): contactEntry[] {

  //Pull in contact data from Google Contacts
  const group: GoogleAppsScript.Contacts.ContactGroup = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
  const contacts: GoogleAppsScript.Contacts.Contact[] = group.getContacts(); // Fetches contact list of group 


  if (contacts.length <= 5) {
    console.error("Contacts Probably got deleted!!!!")
    throw "Oh Boy The Contacts Se fue!";
  } else {

    const arrayOfContacts: contactEntry[] = [];
    for (const contact of contacts) {
      arrayOfContacts.push(convertToContactData(contact))
    }
    return arrayOfContacts;

  }
} // end wirteArray


/*
Gets all of the data from the contact and retruns it as an object with the contactEntry interface.

*/
function convertToContactData(c: GoogleAppsScript.Contacts.Contact): contactEntry {
  const object: contactEntry = {
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
    areaId: '',

  }

  object.dateContactGenerated = c.getLastUpdated().toDateString(); // date last updates

  object.areaEmail = c.getEmails()[0].getAddress(); // getting areaEmail

  // getting names1
  object.name1 = c.getEmails()[1].getDisplayName();
  const pos1 : string = c.getEmails()[1].getLabel().toString();
  object.position1 = pos1.slice(-5).replace(/[^a-z0-9]/gi, ''); // .replace(/[^a-z]/gi, '') makes only letters and numbers
  object.isTrainer1 = isTrainer(object.position1);

  // getting names2
  if (c.getEmails().length >= 3) {
    object.name2 = c.getEmails()[2].getDisplayName();
    const pos2 : string = c.getEmails()[2].getLabel().toString();
    object.position2 = pos2.slice(-5).replace(/[^a-z0-9]/gi, '');
  }
  // getting names3
  if (c.getEmails().length >= 4) {
    object.name3 = c.getEmails()[3].getDisplayName();
    const pos3 : string = c.getEmails()[3].getLabel().toString();
    object.position3 = pos3.slice(-5).replace(/[^a-z0-9]/gi, '');
  }

  // everything from notes
  const getNotes : string = c.getNotes().toString().replaceAll(": ", ":");
  const getNotesArray : string[] = getNotes.split("\n");

  for (let i: number = 0; i < getNotesArray.length; i++) {

    const objectNotes : string[] = getNotesArray[i].split(":");

    const type : string = objectNotes[0];
    const words : string = objectNotes[1];

    if (type.includes("Area")) object.areaName = words;
    if (type.includes("Zone")) object.zone = words;
    if (type.includes("District")) object.district = words;
    if (type.includes("Ecclesiastical Unit")) object.unitString = words.trim();
    if (type.includes("Ecclesiastical Units")) object.hasMultipleUnits = true;

    //Vehicle stuff all right here
    if (type.includes("Vehicle")) object.hasVehicle = true;

    if (object.hasVehicle) {
      if (type.includes("Vehicle VIN Last 8")) object.vinLast8 = words;
      if (type.includes("Vehicle Allowance/Mo")) object.vehicleMiles = words;
    }

    // gets tells if its a sisters or elders area
    if (c.getNotes().includes("Junior Sister")) object.isSisterArea = true;

    // tells if its a senior or not
    if (c.getNotes().includes("Senior Couple")) object.isSeniorCouple = true;
  }

  // getting address of apt.
  if (c.getAddresses().length != 0) object.aptAddress = c.getAddresses()[0].getAddress().toString().replace("\n", " ").replace("\n", " ");
  // .replace("\n", " ").replace("\n", " ") makes it get rid of new lines and one line

  const areaIdNotDone : string = object.areaEmail.replace("@missionary.org", "");

  object.areaId = "A" + areaIdNotDone;

  return object
}

function isTrainer(position: string) : boolean {
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