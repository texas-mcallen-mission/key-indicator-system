/* eslint-disable prefer-const */
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)

function makeSheet() : void {

console.time('Execution Time');
    let configData = {
        tabName: "ContactDataLoForte",
        headerRow: 0,
        includeSoftcodedColumns: true,
        initialColumnOrder: {
            dateContactGenerated: 0,
            areaEmail: 1,
            areaName: 2,

            name1: 3,
            position1: 4,
            isTrainer1: 5,

            name2: 6,
            position2: 7,
            isTrainer2: 8,

            name3: 9,
            position3: 10,
            isTrainer3: 11,

            district: 12,
            zone: 13,

            unitString: 14,
            hasMultipleUnits: 15,
            languageString: 16,

            isSeniorCouple: 17,
            isSisterArea: 18,

            hasVehicle: 19,
            vehicleMiles: 20,
            vinLast8: 21,

            aptAddress: 22
        },
    };

    let loForteContacts = new SheetData(new RawSheetData(configData));
    loForteContacts.setData(getArrayOfContacts());
 
console.timeEnd('Execution Time');
   
}

function getArrayOfContacts(): contactEntry[] {

  let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
  let contacts = group.getContacts(); // Fetches contact list of group 

    let arrayOfContacts:contactEntry[] = [];
    for (let contact of contacts) {
      arrayOfContacts.push(convertToContactData(contact))
    }
    return arrayOfContacts;
} // end wirteArray


function convertToContactData(c:GoogleAppsScript.Contacts.Contact)  {
    let object:contactEntry = {
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
        aptAddress: ''
    }

    object.dateContactGenerated = c.getLastUpdated().toDateString(); // date last updates

    object.areaEmail = c.getEmails()[0].getAddress(); // getting areaEmail
    
    // getting names1
    object.name1 = c.getEmails()[1].getDisplayName();
    let pos1 =  c.getEmails()[1].getLabel().toString();
      object.position1 = pos1.slice(-5).replace(/[^a-z0-9]/gi, ''); // .replace(/[^a-z]/gi, '') makes only letters and numbers
      object.isTrainer1 = isTrainer(object.position1);

    // getting names2
    if (c.getEmails().length >= 3) {
      object.name2 = c.getEmails()[2].getDisplayName();
      let pos2 =  c.getEmails()[1].getLabel().toString();
        object.position2 = pos2.slice(-5).replace(/[^a-z0-9]/gi, '');
    }
    // getting names3
    if (c.getEmails().length >= 4) {
      object.name3 = c.getEmails()[3].getDisplayName();
      let pos3 =  c.getEmails()[1].getLabel().toString();
        object.position3 = pos3.slice(-5).replace(/[^a-z0-9]/gi, '');
    }

    // everything from notes
    let getNotes = c.getNotes()
    let getNotesArray = getNotes.split("\n");

    for (let i = 0; i < getNotesArray.length; i++) {
      
      let objectNotes = getNotesArray[i].split(":");

        let type = objectNotes[0];
        let words = objectNotes[1].toString().trim();

        if (type.includes("Area")) object.areaName = words;
        if (type.includes("Zone")) object.zone = words;
        if (type.includes("District")) object.district = words;
        if (type.includes("Ecclesiastical Unit")) object.unitString = words;
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

return object
}

function isTrainer(position: string) {
    switch (position) {
        case "TR":
        case "DT":
        case "ZLT":
            return true;
        default:
            return false;
    } // end switch
} // end isTrainer