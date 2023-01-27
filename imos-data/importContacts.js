//@ts-check
/*
        importContacts
        Main functions for importing data into the Contact Data sheet from Google Contacts.
*/

/* global parseNotes, roleParser*/

/**
 * Refreshes the data in the Contact Data sheet if it is no longer recent.
 * @param {{contact: SheetData;}} allSheetData
 */
function refreshContacts(allSheetData) {
    console.info('TODO: add checking of contact data gen date to refreshContacts()');
    importContacts(allSheetData);
}

function importContacts(allSheetData) {


    if (!Object.hasOwnProperty.call(allSheetData, "contact")) {
        console.error("No contact sheet in allSheetData, exiting!");
        throw "Unable to access contacts in sheetData"
    }
    console.log('TODO: Make sure importContacts() language parser works for any combination of any languages!');




    if (CONFIG.dataFlow.freezeContactData) {
        console.log("Execution halted - dataFlow.freezeContactData is set to true");
        return;
    }

    console.log("Importing Contact data from Google Contacts...");


    // let effectiveEmail = Session.getEffectiveUser().getEmail();
    // if (effectiveEmail != "texas.mcallen@missionary.org") {
    //   throw 'Tried to import contacts from an email other than the TMM office email! Email was: ${effectiveEmail}. If being used by a mission other than the Texas McAllen Mission, this needs to be manually changed by the developers. Please contact Nathaniel Gerlek at nathaniel.gerlek@gmail.com';
    // }



    //Pull in contact data from Google Contacts
    const group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
    const contacts = group.getContacts();                     // Fetches contact list of group 


    const data = [];
    const values = [];

    for (const contact of contacts) {

        // I basically built this as a big single function and then broke it up into a bunch of little ones.

        //Note Parser
        const noteData = parseNotes(contact.getNotes());

        //Email Parser
        const contactEmailList = contact.getEmails();
        const emailData = emailParser(contactEmailList);

        //Role Parser
        const roleData = roleParser(emailData.emailLabelNames, contactEmailList);

        //Address Puller
        const apartmentAddressObject = contact.getAddresses();
        let apartmentAddress = "";
        if (apartmentAddressObject.length >= 1) {
            apartmentAddress = apartmentAddressObject[0].getAddress();
        }

        //Language Parser
        const languageData = languageParser(noteData.hasMultipleUnits, noteData.unitString);


        if (!noteData.isSeniorCouple || false) {

            const contactObject =
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
            };


            data.push(contactObject);
        }
    }

    allSheetData.contact.setData(data);
    console.log("Finished importing Contact data.");

}










/**
 * Returns true if Contact Data was not imported recently and needs to be refreshed.
 */
function isContactDataOld(allSheetData) {
    const msOffset = 86400000; //Number of milliseconds in 24 hours
    const nowTime = new Date();
    const genTime = allSheetData.contact.getSheet().getRange("A2").getValue();
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
    const emailAddresses = [];
    const emailDisplayNames = [];
    const emailLabelName = [];
    // this operates under the assumption that all the emails are in the same order :0
    for (let i = 0; i < emailList.length; i++) {
        emailAddresses[i] = emailList[i].getAddress();
        emailDisplayNames[i] = emailList[i].getDisplayName();
        emailLabelName[i] = emailList[i].getLabel();
    }
    return {
        emailAddresses: emailAddresses,
        emailDisplayNames: emailDisplayNames,
        emailLabelNames: emailLabelName
    };
}









function testLanguageParserV2() {
    const testStrings = {
        "English": "Beeville Branch",
        "Spanish": "Brownsville 2nd (Spanish) Ward",
        "Spanish,English": "Edinburg 2nd (Spanish) Ward, Edinburg 3rd Ward",
        "Sign Language": "Rio Grande Valley (Sign Language) Branch",
    };
    let successes = 0;
    for (const test in testStrings) {
        const result = languageParser(true, testStrings[test]).languages;
        if (result == test) {
            console.info("PASSED FOR ", test);
            successes += 1;
        }
        else {
            console.warn("LANGUAGE PARSER FAILED FOR ", test, "RESULT: ", result);
        }
    }
    if (successes == Object.keys(testStrings).length) {
        console.log("ALL TESTS PASSED FOR LANGUAGEPARSER");
    }
}
function languageParser(multipleUnits, unitString) {
    // the previous version of this was a crime...
    // noteData.UnitString.substring(noteData.UnitString.search(/\(\w*/))
    const DEFAULT_LANGUAGE = "English";
    const returnData = [];
    const splitUnits = unitString.split(",");
    for (const unit of splitUnits) {
        let langString = "";
        if (!unit.includes("(")) {
            langString = DEFAULT_LANGUAGE;
        } else {
            // this is regex, not a normal string thank-you-very-much
            // eslint-disable-next-line no-useless-escape
            const regexString = new RegExp('\(([^\)]+) \)');
            const regexData = unit.match(/\(([^)]+)\)/);
            const regexMatch = regexData[1];
            langString = regexMatch;
            // console.log(unitString, langString);

        }
        if (!returnData.includes(langString)) { returnData.push(langString); }
    }
    return {
        languages: returnData.toString()
    };
}
