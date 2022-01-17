/*
        missionOrgData.gs
        Functions managing mission organization data.
        Pulls from the Contact Data sheet.
        getMissionOrgData()
        getMissionLeadershipData()
        getLeadershipAreaData()
        TODO: push to other version, 10 Jan
*/

// function sendDataToDisplayV3_(header, finalData, sheet) {
//   // responsible for actually displaying the data.  Clears first to get rid of anything that might be left over.
//   sheet.clearContents()
//   sheet.appendRow(header)
//   if (functionGUBED == true) { Logger.log(finalData.length) }
//   sheet.getRange(2, 1, finalData.length, finalData[0].length).setValues(finalData)
//   sheet.getRange(2, 1, finalData.length, header.length).sort([{ column: 1, ascending: true }])
// }

/**
 * Returns an object containing mission organization data, including zones, districts in each zone, and areas in each district.
 */
 function getMissionOrgData(allSheetData) {

    let contacts = getContactData(allSheetData);
  
    Logger.log("Calculating mission organization data...")
  
    let zones = {};
  
    /*    Format of zones object
    zones = {
      "ZONE1": {
        "hasStlArea": false,
        "DIST1": {
          "AREA1",
          "AREA2"...
        },
        "DIST2": {...}
      },
      "ZONE2": {...}
    }
    */
  
    for (let areaID in contacts) {
  
      let areaData = contacts[areaID].areaData;
  
        let area = areaData.areaName;
        let district = areaData.district;
        let zone = areaData.zone;
  
        if (!zones[zone]) //Initialize zones[zone]
          zones[zone] = {};
  
        if (!zones[zone][district]) //Initialize
          zones[zone][district] = [];
        
        zones[zone][district].push(area);
  
      }
  
    return zones;
  }
  
  
  
  /**
   * Calculates and returns an object containing mission leadership data, including area names, emails, and missionary names of every junior missionary leader, as well as flags indicating if each zone has an STL area and whether an STLT area exists.
   */
  function getMissionLeadershipData(contacts) {
  
    Logger.log("Calculating leader data from contact data...")
  
  
    //Initialized to the empty string to guarantee a defined value
    let apArea = {
      ap1:"",
      ap2:"",
      ap3:""
    };
    let stltArea = {
      stlt1: "",
      stlt2: "",
      stlt3: ""
    };
    let hasStltArea = false;
  
    let zones = {};
  
  
  
  
  
    /*    REFERENCE
  
  
        Object format of zones:
      zones = {
  
        "ZONE1" : {
          "districts" : {...},
          "hasStlArea" : true,
          "zlArea" : {zl1: "", zl2: "", zl3: "", areaID: "", areaName: "", areaEmail: ""},
          "stlArea" : {stl contact data}
        },
        
        "ZONE2"...
      }
  
  
      Object format of zones[zone].districts:     
      zones[zone].districts = {
        "DIST1" : {areas: {...}, dl: "", areaID: "", areaName: "", areaEmail: ""},
        "DIST2"...
      }
  
  
      Object format of zones[zone].districts[district].areas:         Note - areas contains all the areas in the district, including leader areas.
      zones[zone].districts[district].areas = {
        "areaID1" : {areaName:"", areaEmail: ""},
        "areaID2" : {...}
        ...
      }
  
  
  
  
    */
  
  
  
    for (let areaID in contacts) {
  
      let areaData = contacts[areaID].areaData;
  
      let area = areaData.areaName;
      let district = areaData.district;
      let zone = areaData.zone;
      let areaEmail = areaData.areaEmail;
  
      if (!zones[zone]) { //Initialize zones[zone], as well as its properties
        zones[zone] = {
          "districts" : {},
          "zlArea": {},
          "stlArea": {},
          "hasStlArea": false
        };
      }
  
      if (!zones[zone].districts[district]) { //Initialize districts[district], as well as its properties
        zones[zone].districts[district] = {
          "areas" : {},
          "dlArea": {}
        };
      }
  
      zones[zone].districts[district].areas[area] = { //Set areas[area]
        "areaEmail": areaEmail,
        "areaID": areaID
        };
  
  
  
      for (let i=1; i<=3; i++) {  //i is the companion number (for ZL1,2,3 etc.)
  
  
        let pos = areaData["position"+i];
        if (pos.match(/.*[123]/))
          pos = pos.substring(0,pos.length-1); //Ex. "ZL1" => "ZL"
  
  
  
        /*  IMPORTANT NOTE (as of 2021):      
          STL, STLT, AP, and SA are assumed to not be trainers.
  
          STLs are supported on the mission-office level, but are not fully implemented.
  
          This is because IMOS doesn't keep track of which zones an STL covers, and STL
          areas can cover multiple zones. For a zone without STLs, the system has no
          way of knowing which STLs cover it. It would have to be input manually, like
          through a spreadsheet that the APs update regularly by hand.
          
        */
  
        switch (pos) {
  
        //Third companion in a duo
          case "":
            break;
  
        // Senior Comp, Junior Comp, Trainer
          case "SC":
  
            break;
  
          case "JC":
            break;
  
          case "TR":
            break;
  
        // District Leader
          case "DL":
            zones[zone].districts[district].dlArea.dl = areaData["name"+i];
            zones[zone].districts[district].dlArea.areaName = areaData.areaName;
            zones[zone].districts[district].dlArea.areaEmail = areaData.areaEmail;
            zones[zone].districts[district].dlArea.areaID = areaData.areaID;
          break;
  
          case "DT":
            zones[zone].districts[district].dlArea.dl = areaData["name"+i];
            zones[zone].districts[district].dlArea.areaName = areaData.areaName;
            zones[zone].districts[district].dlArea.areaEmail = areaData.areaEmail;
            zones[zone].districts[district].dlArea.areaID = areaData.areaID;
            break;
  
        // ZL
          case "ZL":
            zones[zone].zlArea["zl"+i] =   areaData["name"+i];
            zones[zone].zlArea.areaName =  areaData.areaName;
            zones[zone].zlArea.areaEmail = areaData.areaEmail;
            zones[zone].zlArea.areaID =    areaData.areaID;
            break;
  
          case "ZLT":
            zones[zone].zlArea["zl"+i] =   areaData["name"+i];
            zones[zone].zlArea.areaName =  areaData.areaName;
            zones[zone].zlArea.areaEmail = areaData.areaEmail;
            zones[zone].zlArea.areaID =    areaData.areaID;
            break;
  
        //STL (STLs with greenies are not currently supported)
          case "STL":
            zones[zone].hasStlArea = true;
            zones[zone].stlArea["zl"+i] =   areaData["name"+i];
            zones[zone].stlArea.areaName =  areaData.areaName;
            zones[zone].stlArea.areaEmail = areaData.areaEmail;
            zones[zone].stlArea.areaID =    areaData.areaID;
            break;
  
        // AP, STLT
          case "AP":
            apArea["ap"+i] =   areaData["name"+i];
            apArea.areaName =  areaData.areaName;
            apArea.areaEmail = areaData.areaEmail;
            apArea.areaID =    areaData.areaID;
            break;
          case "STLT":
            hasStltArea = true;
            stltArea["stlt"+i] = areaData["name"+i];
            stltArea.areaName =  areaData.areaName;
            stltArea.areaEmail = areaData.areaEmail;
            stltArea.areaID =    areaData.areaID;
            break;
  
        // Special Assignment - office missionaries might have this
          case "SA":
            break;
        }
  
      }
  
  
  
    }
  
  
    return {
      zones: zones,
      apArea: apArea,
      stltArea: stltArea,
      hasStltArea: hasStltArea
    }
  
  
  }
  
  
  
  
  
  
  /**
   * Returns an object whose properties (keyed by areaID) represent areas. Each area contains the names of the DL, ZLs, APs, etc. with stewardship over that area.
   */
  function getLeadershipAreaData(contacts) {
  
    let leaderData = getMissionLeadershipData(contacts);
  
    let zones = leaderData.zones;
    let apArea = leaderData.apArea;
    let stltArea = leaderData.stltArea;
  
    let leaderAreaData = {};
  
    for (let areaID in contacts) {
  
      let areaData = contacts[areaID].areaData;
  
      let zone = areaData.zone;
      let district = areaData.district;
      let areaName = areaData.areaName;
  
      leaderAreaData[areaID] = {
        areaData:
        {
          "areaName": areaName,  //Debug purposes - not actually used
  
          "districtLeader": rmvUnd(zones[zone].districts[district].dl),
          "zoneLeader1": rmvUnd(zones[zone].zlArea.zl1),
          "zoneLeader2": rmvUnd(zones[zone].zlArea.zl2),
          "zoneLeader3": rmvUnd(zones[zone].zlArea.zl3),
          "stl1": rmvUnd(zones[zone].stlArea.stl1),
          "stl2": rmvUnd(zones[zone].stlArea.stl2),
          "stl3": rmvUnd(zones[zone].stlArea.stl3),
          "assistant1": rmvUnd(apArea.ap1),
          "assistant2": rmvUnd(apArea.ap2),
          "assistant3": rmvUnd(apArea.ap3),
          "stlt1": rmvUnd(stltArea.stlt1),
          "stlt2": rmvUnd(stltArea.stlt2),
          "stlt3": rmvUnd(stltArea.stlt3)
        },
        metadata: {pulledLeaderData: true}
      }
  
    }
  
  
    Logger.log("Finished calculating leadership data for each area.")
  
    return leaderAreaData;
  
  
    function rmvUnd(obj) {
      return (typeof obj == 'undefined') ? "" : obj;
    }
  
  
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
