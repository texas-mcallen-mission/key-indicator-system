


function importContacts()
{ 
  Logger.log("Importing Contact data from Google Contacts...")
  
  let genDate = new Date();

  let sheet = setSheetUp(contactDataSheetName)
  // JUST WHILE DEBUGGING:
  if(DEBUG = true){  //this just clears the sheet so that I don't have to keep scrolling.
    sheet.clearContents();
    sheet.appendRow(contactDataHeader);// Creating Header
  }

  let data = [];

  //pulls in contact data from Google Contacts, and gets everything ready to go.
  let  group  = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
  let  contacts = group.getContacts();                    // Fetches contact list of group 


  for (let  contactPEEP of contacts){

    // I basically built this as a big single function and then broke it up into a bunch of little ones.
    let noteData = parseNotes(contactPEEP.getNotes())  
    let  contactEmailList = contactPEEP.getEmails();
    emailData = emailParser(contactEmailList)
    // Logger.log(emailData)
    // Logger.log(emailData.emailLabelNames)
    let roleData = roleParser(emailData.emailLabelNames,contactEmailList)

    // Missionary Address Puller
    let apartmentAddressObject = contactPEEP.getAddresses()
    let apartmentAddress = ""
    if(apartmentAddressObject.length>=1){
      apartmentAddress = apartmentAddressObject[0].getAddress()
    }
    // End puller

    let languageData = languageParser(noteData.hasMultipleUnits,noteData.unitString)

    

    // append contact data to data array
    // keeps senior missionaries out of the data.  Sorry guys.
    if(noteData.isSeniorCouple == false){
      let row = [new Date(),emailData.emailAddresses[0],noteData.area,
                 emailData.emailDisplayNames[1],roleData.compRoles[1],roleData.isTrainer[1],
                 emailData.emailDisplayNames[2],roleData.compRoles[2],roleData.isTrainer[2],
                 emailData.emailDisplayNames[3],roleData.compRoles[3],roleData.isTrainer[3],
                noteData.district,noteData.zone,noteData.unitString,noteData.hasMultipleUnits,languageData.languages,noteData.isSeniorCouple,noteData.isSisterArea,
                 noteData.hasVehicle,noteData.vehicleMiles,noteData.vinLast8,apartmentAddress];

      data.push(row);
    }
  }
  //Output data to sheet
  sheet.getRange(2,1,data.length,data[0].length).setValues(data);

  Logger.log("Finished importing Contact data.")

} // Written by Elder Robertson, TMM


/**
 * Clears and adds a header row to the Contact Data sheet.
 * Creates the sheet if it doesn't exist.
 */
function setSheetUp(sheetName){
  let  ss = SpreadsheetApp.getActiveSpreadsheet();        //Get currently Active sheet
    // Checks to see if the sheet exists or not.
    let sheet = ss.getSheetByName(sheetName)
    if(!sheet){
      sheet = ss.insertSheet(sheetName)
            sheet.appendRow(contactDataHeader);// Creating Header
    }

  return sheet
}

/**
 * Returns true if Contact Data was not imported recently and needs to be refreshed.
 */
function isContactDataOld() {
  let msOffset = 86400000; //Number of milliseconds in 24 hours
  let nowTime = new Date();
  let genTime = getContactSheet().getRange("A2").getValue();
  let out;

  try {
    out = genTime.getTime() < nowTime.getTime() - msOffset;
  } catch (e) {
    out = true;
  }

  return out;
}

/**
 * 
 */
function getPrettyDate(){
    var saveDate = new Date();
    saveDate.getUTCDate();
    let prettyDate = Utilities.formatDate(saveDate, "GMT+1", "dd/MM/yyyy");
    return prettyDate
}

/**
 * 
 */



