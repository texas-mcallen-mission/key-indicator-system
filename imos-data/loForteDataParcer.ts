let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
let contacts = group.getContacts(); // Fetches contact list of group 
let name3 = "";

function runSheet(): void {
    let configData = {
        tabName: "Contact Data LoForte",
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
    let loForteContacts = new SheetData(new RawSheetData(configData)); // creates new sheet
    loForteContacts.setData(writeArray()); // puts data in sheet
}

function writeArray(): any[] {
    let array1 = [];
    for (let contact of contacts) {
      array1.push(writeObject1(contact))
    }
    return array1;
} // end wirteArray

function writeObject1(c:GoogleAppsScript.Contacts.Contact)  {
    let object:kiDataEntry = {
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

let object1 = getNote(c.getNotes());



//   let array1 = c.getNotes().split("\n");
//   for (let i = 0; i < array1.length; i++) {

//        if (array1[i].includes("Zone: ")) object.zone = stringCleanUp(array1[i], "Zone:");
//        else if (array1[i].includes("District: ")) object.district = stringCleanUp(array1[i], "District:");
//        else if (array1[i].includes("Ecclesiastical Unit: ")) object.unitString = stringCleanUp(array1[i], "Ecclesiastical Unit:");
//        else if (array1[i].includes(""))
//   }
return object1;
}

function getNote (str: string) {

    var zone;
    var district;
    var unitString;

    let hasVehicle = str.includes("Car");
    

        let array1 = str.split("\n");

        for (let i = 0; i < array1.length; i++) {

            if (array1[i].includes("Zone: ")) zone = stringCleanUp(array1[i], "Zone:");
            if (array1[i].includes("District: ")) district = stringCleanUp(array1[i], "District:");
            if (array1[i].includes("Ecclesiastical Unit: ")) unitString = stringCleanUp(array1[i], "Ecclesiastical Unit:");

            if (hasVehicle) {
            var vehicle;
            if (array1[i].includes("Vehicle:")) vehicle = stringCleanUp(array1[i], "Vehicle:");

        }
        
    

    }

    return {
        Zone: zone,
        District: district,
        unitString: unitString,
        Vehicle: vehicle,
    }

}

function stringCleanUp (s: string, type: string) {
    return s.replace(type, '').trim();
}
