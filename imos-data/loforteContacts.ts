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
        let name1 = "IDKYet";
        let position1 = "IDK";
        let isTrainer1 = "IDK";
        let name2 = "IDKYet";
        let position2 = "IDK";
        let isTrainer2 = "IDK";
        let name3 = "IDKYet";
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
        

        console.log(vehicleMiles);

          
        

        
        //console.log(name3);
        //console.log(contact.getEmails()[2].getLabel());
        let district = contact.getNotes();
        //console.log(contact);
        let nameFull1 = contact.getFullName();
        let idk = contact.getHomeAddress();
        let contactEmail = contact.getEmailAddresses();
        // let email1 = contactEmail[1];
        // let email2 = contactEmail[2];
//name3 = getName3(contact, 3);


    } // end forLoop
} // end getContacts

function getMiles(hasCar, c) {
  if (hasCar) {

    for (i = 1; i < 15 ; i++) {

      if (c.getNotes().split("\n")[i].includes("Vehicle Allowance/Mo:")) {
        return (c.getNotes().split("\n")[i].toString().split(" ")[2]) * 1;
        
      } // end if
      
    } // end for

  } // end if

} //  end function



function getName3(contact) {
    if (isTreo(contact)) {
        return contact.getEmails()[3].getLabel();
    }
    else {
        return "";
    } // end else
}
function isTreo(contact) {
    if (contact.getEmails()[3] = !undefined) {
        false;
    }
    else {
        true;
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


function isSisterAreaFunc (c) {
  if (c.getNotes().includes("Junior Sister")) {return true} else {return false};
} // end isSisterArea

function isSeniorCoupleFunc (c) {
  if (c.getNotes().includes("Senior Couple")) {return true} else {return false};
} // end isSisterArea

function hasVehicleFunc (c) {
  if (c.getNotes().includes("Car")) {return true} else {return false};
} // end isSisterArea













// let obj1 = {
//     nameFull1: "123"
//   }
//console.log(obj1.nameFull1);
// function notes() {
// //console.log( ' contact.getFullName (): ', contact.getFullName ());
// // console.log( ' contact.getId (): ', contact.getId ());
// // console.log( ' contact.getAddresses (): ', contact.getAddresses ());
// // console.log( ' contact.getCompanies (): ', contact.getCompanies ());
// // console.log( ' contact.getContactGroups (): ', contact.getContactGroups ());
// // console.log( ' contact.getPrimaryEmail (): ', contact.getPrimaryEmail ());
// // console.log( ' contact.getGivenName (): ', contact.getGivenName ());
// // console.log( ' contact.getMiddleName (): ', contact.getMiddleName ());
// // console.log( ' contact.getFamilyName (): ', contact.getFamilyName ());
// // console.log( ' contact.getMaidenName (): ', contact.getMaidenName ());
// // console.log( ' contact.getNickname (): ', contact.getNickname ());
// // console.log( ' contact.getInitials (): ', contact.getInitials ());
// // console.log( ' contact.getEmailAddresses (): ', contact.getEmailAddresses ());
// // console.log( ' contact.getHomeAddress (): ', contact.getHomeAddress ());
// // console.log( ' contact.getWorkAddress (): ', contact.getWorkAddress ());
// // console.log( ' contact.getHomePhone (): ', contact.getHomePhone ());
// // console.log( ' contact.getWorkPhone (): ', contact.getWorkPhone ());
// // console.log( ' contact.getMobilePhone (): ', contact.getMobilePhone ());
// // console.log( ' contact.getDates (): ', contact.getDates ());
// // console.log( ' contact.getEmails (): ', contact.getEmails ());
// // console.log( ' contact.getNotes (): ', contact.getNotes ());
// // console.log( ' contact.getIMs (): ', contact.getIMs ());
// // console.log( ' contact.getPhones (): ', contact.getPhones ());
// // console.log( ' contact.getUrls (): ', contact.getUrls ());
// // console.log( ' contact.getPager (): ', contact.getPager ());
// // console.log( ' contact.getHomeFax (): ', contact.getHomeFax ());
// // console.log( ' contact.getWorkFax (): ', contact.getWorkFax ());
// // console.log( ' contact.getLastUpdated (): ', contact.getLastUpdated ());
// // console.log( ' contact.getCustomFields (): ', contact.getCustomFields ());
// // console.log( ' contact.getShortName (): ', contact.getShortName ());
// // console.log( ' contact.getPrefix (): ', contact.getPrefix ());
// // console.log( ' contact.getSuffix (): ', contact.getSuffix ());
// // console.log( ' contact.getTitle (): ', contact.getTitle ());
// // toString 
// // getFullName 
// // addDate 
// // getId 
// // setFullName 
// // setPrefix 
// // getAddresses 
// // setUserDefinedFields 
// // getCompanies 
// // deleteContact 
// // getContactGroups 
// // getPrimaryEmail 
// // setGivenName 
// // setFamilyName 
// // getGivenName 
// // getMiddleName 
// // setMiddleName 
// // getFamilyName 
// // getMaidenName 
// // setMaidenName 
// // getNickname 
// // setNickname 
// // setShortName 
// // getInitials 
// // setInitials 
// // removeFromGroup 
// // getEmailAddresses 
// // setPrimaryEmail 
// // setHomeAddress 
// // setWorkAddress 
// // getHomeAddress 
// // getWorkAddress 
// // setHomePhone 
// // setWorkPhone 
// // setMobilePhone 
// // getHomePhone 
// // getWorkPhone 
// // getMobilePhone 
// // getUserDefinedFields 
// // setUserDefinedField 
// // getUserDefinedField 
// // addCustomField 
// // getDates 
// // addIM 
// // setNotes 
// // addEmail 
// // addToGroup 
// // getEmails 
// // getNotes 
// // getIMs 
// // getPhones 
// // addPhone 
// // getUrls 
// // addUrl 
// // addCompany 
// // setPager 
// // setHomeFax 
// // setWorkFax 
// // getPager 
// // getHomeFax 
// // getWorkFax 
// // addAddress 
// // getLastUpdated 
// // setSuffix 
// // getCustomFields 
// // getShortName 
// // getPrefix 
// // getSuffix 
// // getTitle 
// // compareTo 
// what the heck
// }
