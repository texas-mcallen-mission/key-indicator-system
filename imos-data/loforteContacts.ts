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
    object.dateContactGenerated = c.getLastUpdated().toDateString();

    object.areaEmail = c.getEmails()[0].getAddress();
    
    object.name1 = c.getEmails()[1].getDisplayName();
    let pos1 =  c.getEmails()[1].getLabel().toString();
    
    object.position1 = pos1.slice(-1);
// .replace(/[^a-z]/gi, '')

    if (c.getEmails().length >= 3) {
    object.name2 = c.getEmails()[2].getDisplayName();
    object.position2 = c.getEmails()[2].getLabel().toString();
    }

    if (c.getEmails().length >= 4) {
    object.name3 = c.getEmails()[3].getDisplayName();
    object.position3 = c.getEmails()[3].getLabel().toString();
    }

    // everything from notes
    let getNotes = c.getNotes()
    let getNotesArray = getNotes.split("\n");


    for (let i = 0; i < getNotesArray.length; i++) {
    
    let objectNotes = getNotesArray[i].split(":");

      let type = objectNotes[0];
      let words = objectNotes[1];

      if (type.includes("Area")) object.areaName = words;
      if (type.includes("Zone")) object.zone = words;
      if (type.includes("District")) object.district = words;
      if (type.includes("Ecclesiastical Unit: ")) object.unitString = words;
        if (getNotes.includes(",")) object.hasMultipleUnits = true; // i really need to fix this!!! i dont know why but they arent on the same line or something!!
// still this ^^     



    //Vehicle stuff all right here
      if (type.includes("Vehicle")) object.hasVehicle = true;

      if (object.hasVehicle) {
        if (type.includes("Vehicle VIN Last 8")) object.vinLast8 = words;
        if (type.includes("Vehicle Allowance/Mo")) object.vehicleMiles = words;
      }

          // gets tells if its a sisters or elders area
      if (c.getNotes().includes("Junior Sister")) object.isSisterArea = true;
    }

return object
}

function stringCleanUp(s: string, type: string) {
  return s.replace(type, '').trim();
}




function noAddress (c) {
  if (c.getAddresses().length === 0) {
    return true;
  } else {
    return false; 
  }
}
function getAddress (noAddress, c:GoogleAppsScript.Contacts.Contact) {
  if (noAddress) {
    return "No Address On Record";
  } else {
    return c.getAddresses()[0].getAddress().toString().replace("\n", " ").replace("\n", " ");
  }
}

function ifMultipleUnitStrings(c) {
  if (c.getNotes().split("\n")[3].includes(",")) {
    return true;
  } else {
    return false;
  }
}

function howManyMissionarys(c) {
  switch (c.getEmail().length) {
        case "2":
          return 0;
        case "3":
          return 1;
        case "4":
          return 2;
    } // end switch
}

function isSolo(c) {
  if (c.getEmails().length === 2) {
    return true; 
  } else {
    return false;
  }
}
function isTreo(c) {
    if (c.getEmails().length >= 4) {
       return true;
    } else {
      return false;
    }
} // end isTreo

function getName(isSolo, c, i) {
  //console.log(c.getEmails()[i].getLabel())
  if (isSolo) {
    return c.getEmails()[1].getLabel().toString().split(" ").slice(0, -1).join(" ");
  } else {
    return c.getEmails()[i].getLabel().toString().split(" ").slice(0, -1).join(" "); // i = 1 for first person
  }
} // end getName

function getPosition3 (isTreo, c, i) {
  if (isTreo) {
    return c.getEmails()[3].getLabel().toString().split(" ").slice(-1).join(" ").split("(")[1].split(")")[0]; // i = 1 for first person
  }
}
function getName3(c) {
    if (isTreo(c)) {
        return getName(isSolo(c), c, 3);
    } // end if
} // end getName 3

function isTrainer(position) {
    switch (position) {
        case "TR":
        case "DT":
        case "ZLT":
            return true;
        default:
            return false;
    } // end switch
} // end isTrainer
function getPosition(isSolo, c, i) {
  if (isSolo) {
    return ""
  } else {
    return c.getEmails()[i].getLabel().toString().split(" ").slice(-1).join(" ").split("(")[1].split(")")[0]; // i = 1 for first person
  }    
}
function getWhere(c, i) {
    return c.getNotes().split("\n")[i];
}

function isSisterAreaFunc(getNotesString: string) {
    if (getNotesString.includes("Junior Sister")) return true;
} // end isSisterArea

function isSeniorCoupleFunc(getNotesString: string) {
    if (getNotesString.includes("Senior Couple")) return true;
} // end isSeniorCoupleFunc

function getMiles(hasCar, c) {
    if (hasCar) {
        for (let i = 1; i < 15; i++) {
            if (c.getNotes().split("\n")[i].includes("Vehicle Allowance/Mo:")) {
                return (c.getNotes().split("\n")[i].toString().split(" ")[2]) * 1;
            } // end if
        } // end for
    } // end if
} //  end function

//return c.getEmails()[i].getLabel().toString().split(" ").slice(-1).join(" ").split("(")[1].split(")")[0]; // i = 1 for first person

// function writeObject(contact:GoogleAppsScript.Contacts.Contact) {
//   let dateContactGenerated = contact.getLastUpdated();
//   let areaEmail = contact.getEmails()[0].getAddress();
//   let areaName = contact.getFamilyName();

//   let name1 = getName(isSolo(contact), contact, 1);
//   let position1 = getPosition(isSolo(contact), contact, 1);
//   let isTrainer1 = isTrainer(position1);

//   let name2 = getName(isSolo(contact),contact, 2)
//   let position2 = getPosition(isSolo(contact), contact, 2);
//   let isTrainer2 = isTrainer(position2);

//   let name3 = getName3(contact);
//   let position3 = getPosition3(isTreo(contact), contact, 3)
//   let isTrainer3 = isTrainer(position3);

//   let district = getWhere(contact, 1);
//   let zone = getWhere(contact, 2);

//   let unitString = getWhere(contact, 3);
//   let hasMultipleUnits = ifMultipleUnitStrings(contact);
//   //let languageString = ""

//   //let isSisterArea = isSisterAreaFunc(contact);
//   //let isSeniorCouple = isSeniorCoupleFunc(contact);

//   //let hasVehicle = hasVehicleFunc(contact);
//   //let vehicleMiles = getMiles(hasVehicle, contact);
//   //let vinLast8 = getVin(hasVehicle, contact);

//   let aptAddress = getAddress(noAddress(contact), contact) // this isnt working!!!!

//   console.log(convertToContactData(contact));

  
//   return {
//       dateContactGenerated: dateContactGenerated,
//       areaEmail: areaEmail,
//       areaName: areaName,

//       name1: name1,
//       position1: position1,
//       isTrainer1: isTrainer1,

//       name2: name2,
//       position2: position2,
//       isTrainer2: isTrainer2,

//       name3: name3,
//       position3: position3,
//       isTrainer3: isTrainer3,

//       zone: zone,
//       district: district,

//       unitString: unitString,
//       hasMultipleUnits: hasMultipleUnits,

//       //isSisterArea: isSisterArea,
//       //isSeniorCouple: isSeniorCouple,

//       //vehicleMiles: vehicleMiles,
//       //hasVehicle: hasVehicle,
//       //vinLast8: vinLast8,

//       aptAddress: aptAddress
//   };
// }