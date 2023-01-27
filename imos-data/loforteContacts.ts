/* eslint-disable prefer-const */
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)


//let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
//let contacts = group.getContacts(); // Fetches contact list of group 
//let name3 = "";



function wrapper_boi() {
    let configData = {
        tabName: "Contact Data LoFoort",
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
    //let data = getContact();
    loForteContacts.setData(writeArray());
}

// HEY LOOK HERE this needs a different type
function writeArray1(): any[] {
    let array1 = [];
    for (let contact of contacts) {
      array1.push(getAllWhere1(contact))  
      //array1.push(writeObject(contact));
    }
    return array1;
} // end wirteArray


interface contactEntry extends kiDataEntry {
  dateContactGenerated: string,
  areaEmail: string,
  areaName: string,

  name1: string,
  position1: string,
  isTrainer1: boolean,

  name2: string,
  position2: string,
  isTrainer2: boolean,

  name3: string,
  position3: string,
  isTrainer3: boolean,

  district: string,
  zone: string,

  unitString: string,
  hasMultipleUnits: boolean,
  languageString: string,

  isSeniorCouple: boolean,
  isSisterArea: boolean,

  hasVehicle?: boolean,
  vehicleMiles: string,
  vinLast8: string,

  aptAddress: string,
}

function getAllWhere1(c:GoogleAppsScript.Contacts.Contact)  {
    let object:contactEntry = {
      dateContactGenerated: "",
      areaEmail: "",
      areaName: "",
      name1: "",
      position1: "",
      isTrainer1: false,
      name2: "",
      position2: "",
      isTrainer2: false,
      name3: "",
      position3: "",
      isTrainer3: false,
      district: "",
      zone: "",
      unitString: "",
      hasMultipleUnits: false,
      languageString: "",
      isSeniorCouple: false,
      isSisterArea: false,
      vehicleMiles: "",
      vinLast8: "",
      aptAddress: "",
  }


  let array1 = c.getNotes().split("\n");
  for (let i = 0; i < array1.length; i++) {
       if (array1[i].includes("Zone: ")) object.zone = array1[i];
       else if (array1[i].includes("District: ")) object.district = array1[i];
       else if (array1[i].includes("Ecclesiastical Unit: ")) object.unitString = array1[i];
  }

return object
}


function writeObject(contact:GoogleAppsScript.Contacts.Contact) {
    let dateContactGenerated = contact.getLastUpdated();
    let areaEmail = contact.getEmails()[0].getAddress();
    let areaName = contact.getFamilyName();

    let name1 = getName(isSolo(contact), contact, 1);
    let position1 = getPosition(isSolo(contact), contact, 1);
    let isTrainer1 = isTrainer(position1);

    let name2 = getName(isSolo(contact),contact, 2)
    let position2 = getPosition(isSolo(contact), contact, 2);
    let isTrainer2 = isTrainer(position2);

    let name3 = getName3(contact);
    let position3 = getPosition3(isTreo(contact), contact, 3)
    let isTrainer3 = isTrainer(position3);

    let district = getWhere(contact, 1);
    let zone = getWhere(contact, 2);

    let unitString = getWhere(contact, 3);
    let hasMultipleUnits = ifMultipleUnitStrings(contact);
    //let languageString = ""

    let isSisterArea = isSisterAreaFunc(contact);
    let isSeniorCouple = isSeniorCoupleFunc(contact);

    let hasVehicle = hasVehicleFunc(contact);
    let vehicleMiles = getMiles(hasVehicle, contact);
    let vinLast8 = getVin(hasVehicle, contact);

    let aptAddress = getAddress(noAddress(contact), contact) // this isnt working!!!!

    console.log(getAllWhere1(contact));

    
    return {
        dateContactGenerated: dateContactGenerated,
        areaEmail: areaEmail,
        areaName: areaName,

        name1: name1,
        position1: position1,
        isTrainer1: isTrainer1,

        name2: name2,
        position2: position2,
        isTrainer2: isTrainer2,

        name3: name3,
        position3: position3,
        isTrainer3: isTrainer3,

        zone: zone,
        district: district,

        unitString: unitString,
        hasMultipleUnits: hasMultipleUnits,

        isSisterArea: isSisterArea,
        isSeniorCouple: isSeniorCouple,

        vehicleMiles: vehicleMiles,
        hasVehicle: hasVehicle,
        vinLast8: vinLast8,

        aptAddress: aptAddress
    };
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
// this is what i need to fix
function getContact() {
    for (let contact of contacts) {
        let unitString = contact.getNotes();
        let hasMultipleUnits = "IDK";
        let languageString = "IDk";
    } // end forLoop
} // end getContacts
function hasVehicleFunc(c) {
    if (c.getNotes().includes("Car")) {
        return true;
    }
} // end hasVehicleFunc

function isSisterAreaFunc(c) {
    if (c.getNotes().includes("Junior Sister"))
        return true;
} // end isSisterArea

function isSeniorCoupleFunc(c) {
    if (c.getNotes().includes("Senior Couple"))
        return true;
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
function getVin(hasCar, c) {
    if (hasCar) {
        for (let i = 1; i < 15; i++) {
            if (c.getNotes().split("\n")[i].includes("Vehicle VIN Last 8: ")) {
                return (c.getNotes().split("\n")[i].toString().split(" ")[4]);
            } // end if
        } // end for
    } // end if
} //  end function

//return c.getEmails()[i].getLabel().toString().split(" ").slice(-1).join(" ").split("(")[1].split(")")[0]; // i = 1 for first person
