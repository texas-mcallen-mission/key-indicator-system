/*
        importContacts
        Main functions for importing data into the Contact Data sheet from Google Contacts.
*/

function importContacts(allSheetData)
{
  if (DBCONFIG.FREEZE_CONTACT_DATA) return;

  Logger.log("Importing Contact data from Google Contacts...")


  let effectiveEmail = Session.getEffectiveUser().getEmail();
  if (effectiveEmail != "texas.mcallen@missionary.org") {
    throw `Tried to import contacts from an email other than the TMM office email! Email was: ${effectiveEmail}. If being used by a mission other than the Texas McAllen Mission, this needs to be manually changed by the developers. Please contact Nathaniel Gerlek at nathaniel.gerlek@gmail.com`;
  }



  //Pull in contact data from Google Contacts
  let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
  let contacts = group.getContacts();                     // Fetches contact list of group 


  let data = [];
  let values = [];

  for (let  contact of contacts) {

    // I basically built this as a big single function and then broke it up into a bunch of little ones.

    //Note Parser
    let noteData = parseNotes(contact.getNotes());

    //Email Parser
    let  contactEmailList = contact.getEmails();
    emailData = emailParser(contactEmailList)

    //Role Parser
    let roleData = roleParser(emailData.emailLabelNames,contactEmailList);

    //Address Puller
    let apartmentAddressObject = contact.getAddresses()
    let apartmentAddress = ""
    if(apartmentAddressObject.length>=1){
      apartmentAddress = apartmentAddressObject[0].getAddress()
    }

    //Language Parser
    let languageData = languageParser(noteData.hasMultipleUnits,noteData.unitString)

    
    if(!noteData.isSeniorCouple || false){
      
      let contactObject = 
      {
        'dateContactGenerated': new Date(),
        'areaEmail': emailData.emailAddresses[0],
        'areaName': noteData.area,

        'name1': emailData.emailDisplayNames[1],
        'position1': roleData.compRoles[1],
        'isTrainer1': roleData.isTrainer[1],

        'name2': emailData.emailDisplayNames[2],
        'position2': roleData.compRoles[2],
        'isTrainer2': roleData.isTrainer[2],

        'name3': emailData.emailDisplayNames[3],
        'position3': roleData.compRoles[3],
        'isTrainer3': roleData.isTrainer[3],

        'district': noteData.district,
        'zone': noteData.zone,
        'unitString': noteData.unitString,
        'hasMultipleUnits': noteData.hasMultipleUnits,
        'languageString': languageData.languageString,
        'isSeniorCouple': noteData.isSeniorCouple,
        'isSisterArea': noteData.isSisterArea,
        'hasVehicle': noteData.hasVehicle,
        'vehicleMiles': noteData.vehicleMiles,
        'vinLast8': noteData.vinLast8,

        'aptAddress': apartmentAddress,
      }


      data.push(contactObject);
    }
  }

  
  allSheetData.contact.insertData(data);

  Logger.log("Finished importing Contact data.")

}










/**
 * Returns true if Contact Data was not imported recently and needs to be refreshed.
 */
function isContactDataOld(allSheetData) {
  let msOffset = 86400000; //Number of milliseconds in 24 hours
  let nowTime = new Date();
  let genTime = allSheetData.contact.getSheet().getRange("A2").getValue();
  let out;

  try {
    out = genTime.getTime() < nowTime.getTime() - msOffset;
  } catch (e) {
    out = true;
  }

  return out;
}









/**
 * [UNIMPLEMENTED] Parses phone number data for importContacts()
 */
function phoneParser(phoneData) {
    // for(phoneData)
  }
// THIS NEEDS TO BE WRITTEN  







/**
 * Parses email data for importContacts()
 */
function emailParser(emailList) {
  let emailAddresses = []
  let emailDisplayNames = []
  let emailLabelName = []
  // this operates under the assumption that all the emails are in the same order :0
  for(let i=0; i<emailList.length;i++){
    emailAddresses[i] = emailList[i].getAddress()
    emailDisplayNames[i] = emailList[i].getDisplayName()
    emailLabelName[i] = emailList[i].getLabel()
  }
  return{
    emailAddresses:emailAddresses,
    emailDisplayNames:emailDisplayNames,
    emailLabelNames:emailLabelName
  }
}









// IF THIS GOES GLOBAL, THIS WILL HAVE TO CHANGE!!!

function testLanguageParser(){
  let testString = "TEST (Spanish) WORDS,TEST ENGLISH WORDS"
  Logger.log(testString.split(","))
  Logger.log(languageParser(true,testString))
}


/**
 * Parses language data for importContacts()
 */  
function languageParser(multipleUnits,unitString) {

  Logger.log('TODO: Make sure importContacts() language parser works for any combination of any languages!')
  // noteData.UnitString.substring(noteData.UnitString.search(/\(\w*/))
  let defaultLanguage = "English"
  let spanishTestString = "Spanish"
  let spanishOutputString = "Spanish"
  let returnData = []

  if (!multipleUnits) {
    if (unitString.includes(spanishTestString)==true) // this is going to get changed in the future to get rid of the silly 'spanish,spanish' tags.
      returnData.push(spanishOutputString);
    else
      returnData.push(defaultLanguage)
    
  } else {
    let unitStringSplit = unitString.split(",")

    for (let testString of unitStringSplit) {
      if(testString.includes(spanishTestString))
        returnData.push(spanishOutputString)
      else
        returnData.push(defaultLanguage)
    }
  }

  return {'languageString': returnData.toString()};
}












