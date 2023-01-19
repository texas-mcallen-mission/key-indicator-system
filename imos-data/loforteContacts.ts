// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// @ts-nocheck
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
let contacts = group.getContacts(); // Fetches contact list of group 
let name3 = "";


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
          aptAddress: 22,
      },
  }
  let loForteContacts = new SheetData(new RawSheetData(configData))

  let data = getContact();
  loForteContacts.setData(data);

}

function writeObject(contact) {

  let dateContactGenerated = contact.getLastUpdated();
        let areaEmail = contact.getEmails()[0].getAddress();
        let areaName = contact.getFamilyName();
        let name1 = getName(contact, 1);

  obj1 = {
      dateContactGenerated: dateContactGenerated,
      areaEmail: areaEmail,
      areaName: areaName,
      name1: name1
  };
  obj1.toString = function () {return "storp"}
return obj1;
}

function writeArray() {
    array1 = [];
    for (let contact of contacts) {
      array1 = array1 + writeObject(contact);
    }
    console.log(array1);
}
 // this is what i need to fix

function getContact() {
    for (let contact of contacts) {
        let dateContactGenerated = contact.getLastUpdated();
        let areaEmail = contact.getEmails()[0].getAddress();
        let areaName = contact.getFamilyName();
        let name1 = getName(contact, 1);
        //let name2 = getName(contact, 2);
        //let name3 = getName3(contact)

          console.log(areaEmail);
        let position1 = "IDK";
        let isTrainer1 = "IDK";
        let position2 = "IDK";
        let isTrainer2 = "IDK";
        let position3 = "IDK";
        let isTrainer3 = "IDK";
        let zone = contact.getNotes();
        let unitString = contact.getNotes();
        let hasMultipleUnits = "IDK";
        let languageString = "IDk";
        let isSeniorCouple = isSeniorCoupleFunc(contact);
        let isSisterArea = isSisterAreaFunc(contact);
        let hasVehicle = hasVehicleFunc(contact);
        let vehicleMiles = getMiles(hasVehicle, contact);
        let district = contact.getNotes();
        //console.log(contact);
        let nameFull1 = contact.getFullName();
        let idk = contact.getHomeAddress();
        let contactEmail = contact.getEmailAddresses();
        
    } // end forLoop
} // end getContacts


function getName(c, i) {
    if (isAreaContact(c)) {
        return c.getEmails()[i].getLabel().toString().split(" ").slice(0, -1).join(" "); // i = 1 for first person
    }
} // end getName
function getName3(c) {
    if (isTreo(c)) {
        return getName(c, 3);
    } // end if
} // end getName 3

function isAreaContact(c) {
    if (c.getEmails().length == 2) {
        return true;
    }
}
function isTreo(c) {
    if (c.getEmails().length >= 3) {
        return true;
    }
} // end isTreo
function getMissionaryRole() {
    let missionary1 = contact.getEmails()[1].getLabel();
    let missionary2 = contact.getEmails()[2].getLabel();
    let missionary3 = contact.getEmails()[3].getLabel();
    console.log(missionary1);
    console.log(missionary2);
    console.log(missionary3);
    console.log("end");
} // end getMissionaryRole
function isSisterAreaFunc(c) {
    if (c.getNotes().includes("Junior Sister")) {
        return true;
    }
} // end isSisterArea
function isSeniorCoupleFunc(c) {
    if (c.getNotes().includes("Senior Couple")) {
        return true;
    }
} // end isSeniorCoupleFunc
function hasVehicleFunc(c) {
    if (c.getNotes().includes("Car")) {
        return true;
    }
} // end hasVehicleFunc

function getMiles(hasCar, c) {
    if (hasCar) {
        for (i = 1; i < 15; i++) {
            if (c.getNotes().split("\n")[i].includes("Vehicle Allowance/Mo:")) {
                return (c.getNotes().split("\n")[i].toString().split(" ")[2]) * 1;
            } // end if
        } // end for
    } // end if
} //  end function
