function makeSheet(): void {

  console.time('Execution Time');
  
  const closedAreasSheet = new SheetData(new RawSheetData(sheetDataConfig.local.closedAreas));

  const loForteContacts = new SheetData(new RawSheetData(sheetDataConfig.local.contact));
  

  
  const ogClass = new kiDataClass(loForteContacts.getData())
 
  
  
  const newContactsArray = loForteContacts.getAllOfKey("areaEmail");
  const goodOldData : kiDataEntry = loForteContacts.getData();
    const allData = goodOldData.getAllOfKey("areaEmail")
  const newContactData :contactEntry[] = getArrayOfContacts()
  loForteContacts.setData(newContactData);

  const newContactClass = new kiDataClass(newContactData);

  const newAreaIds = newContactClass.getDataFromKey("areaId");
  ogClass.removeMatchingByKey("areaId",newAreaIds);
  ogClass.bulkAppendObject({"deletionDate":convertToSheetDate_(new Date())})
  const leftovers : kiDataEntry[] = ogClass.end
  if(leftovers.length >0){
    closedAreasSheet.appendData(leftovers);
  }

  console.timeEnd('Execution Time');

}

function getOldData() {
  const activeSheet = SpreadsheetApp.getActive().getSheetByName("Contact Data");
  const array = [];
    for (let i = 2; !activeSheet.getRange(i,2).isBlank(); i++) {
        const cell = activeSheet.getRange(i,2).getValue();
        array.push(cell);
    }
  return array;
}

function resetObject() : closedAreas {
  return {
      areaName: "",
      areaEmail: "",
      formTimestamp: "",
      areaId: "",
    } 
}

function compareAreas(oldData : kiDataEntry,newAreas) : closedAreas[] {
  const oldAreas = oldData.getAllOfKey("areaEmail")
  const arrayOfObjects : closedAreas[] = [];
  let differenceArray = oldData.filter(oldData.getKey() => !newAreas.includes(areaId));


  let object = resetObject();
  for (let i = 0; i < differenceArray.length; i++) {
    object.areaEmail = differenceArray[i];
    object.areaId = 
    arrayOfObjects.push(object);
    object = resetObject();
  }

return arrayOfObjects;

}



function getArrayOfContacts(): contactEntry[] {

  //Pull in contact data from Google Contacts
  const group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
  const contacts = group.getContacts(); // Fetches contact list of group 

  const arrayOfContacts: contactEntry[] = [];
  for (const contact of contacts) {
    arrayOfContacts.push(convertToContactData(contact))
  }
  return arrayOfContacts;
} // end wirteArray


function convertToContactData(c: GoogleAppsScript.Contacts.Contact) {
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
  const pos1 = c.getEmails()[1].getLabel().toString();
  object.position1 = pos1.slice(-5).replace(/[^a-z0-9]/gi, ''); // .replace(/[^a-z]/gi, '') makes only letters and numbers
  object.isTrainer1 = isTrainer(object.position1);

  // getting names2
  if (c.getEmails().length >= 3) {
    object.name2 = c.getEmails()[2].getDisplayName();
    const pos2 = c.getEmails()[2].getLabel().toString();
    object.position2 = pos2.slice(-5).replace(/[^a-z0-9]/gi, '');
  }
  // getting names3
  if (c.getEmails().length >= 4) {
    object.name3 = c.getEmails()[3].getDisplayName();
    const pos3 = c.getEmails()[3].getLabel().toString();
    object.position3 = pos3.slice(-5).replace(/[^a-z0-9]/gi, '');
  }

  // everything from notes
  const getNotes = c.getNotes().toString().replaceAll(": ", ":");
  const getNotesArray = getNotes.split("\n");

  for (let i = 0; i < getNotesArray.length; i++) {


    const objectNotes = getNotesArray[i].split(":");


    const type = objectNotes[0];
    const words = objectNotes[1];

    if (type.includes("Area")) object.areaName = words;
    if (type.includes("Zone")) object.zone = words;
    if (type.includes("District")) object.district = words;
    if (type.includes("Ecclesiastical Unit")) object.unitString = words.replaceAll(" ",""); // cant do this need to fix
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



  const areaIdNotDone = object.areaEmail.replace("@missionary.org", "");

  object.areaId = "A" + areaIdNotDone;

  return object
}
// not right i need to put in the array of them all but UGHHHH


function isTrainer(position: string) {
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