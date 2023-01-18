// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
// @ts-nocheck
// Compiled using undefined undefined (TypeScript 4.9.4)
// Compiled using undefined undefined (TypeScript 4.9.4)
let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
let contacts = group.getContacts(); // Fetches contact list of group 
let name3 = "";



function getContact() {
    //console.log(contacts[1]);
    for (let contact of contacts) {
        let dateContactGenerated = contact.getLastUpdated();
        //let areaEmail = contactEmail[0];
        let areaName = contact.getFamilyName();
        let name1 = getName(contact, 1);
        let name2 = getName(contact, 2);
        //let name3 = getName3(contact)

          
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

        
        obj1 = {
          dateContactGenerated: dateContactGenerated,
          hasVehicle: hasVehicleFunc(contact)
        }

        console.log(obj1);
    } // end forLoop
} // end getContacts

function callObject() {
  
}

function writeObject() {
  return {
        dateContactGenerated: contact.getLastUpdated(),
        hasVehicle: hasVehicleFunc(contact)
    }
}





function getName(c, i) {
  if (isAreaContact(c)) {
    return c.getEmails()[i].getLabel().toString().split(" ").slice(0, -1).join(" "); // i = 1 for first person
  }
} // end getName

function getName3(c) {
    if (isTreo(c)) {
      return getName(c,3)
    } // end if
} // end getName 3

function getMiles(hasCar, c) {
    if (hasCar) {
        for (i = 1; i < 15; i++) {
            if (c.getNotes().split("\n")[i].includes("Vehicle Allowance/Mo:")) {
                return (c.getNotes().split("\n")[i].toString().split(" ")[2]) * 1;
            } // end if
        } // end for
    } // end if
} //  end function



function isAreaContact(c) {
  if (c.getEmails().length == 2) {
    return true;
  }
}

function isTreo(c) {
    if (c.getEmails().length >= 3) {
      return true
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
    else {
        return false;
    }
    ;
} // end isSisterArea

function isSeniorCoupleFunc(c) {
    if (c.getNotes().includes("Senior Couple")) {
        return true;
    }
    else {
        return false;
    }
    
} // end isSeniorCoupleFunc

function hasVehicleFunc(c) {
    if (c.getNotes().includes("Car")) {
        return true;
    }
} // end hasVehicleFunc