//@ts-check
/*
        missionOrgData
        Functions managing mission organization data.
        Pulls from the Contact Data sheet.
        getMissionOrgData()
        getMissionLeadershipData()
        getLeadershipAreaData()
*/



/**
 * Returns an object containing mission organization data, including zones, districts in each zone, and areas in each district.
 * @param {{ contact: any; }} allSheetData
 * @returns {any}
 */
function getMissionOrgData(allSheetData: manySheetDatas) {
    if (!Object.hasOwnProperty.call(allSheetData, "contact")) {
        throw "sheet 'contact' missing from allSheetData"
    }
    const cSheetData = allSheetData.contact;
    const contactData = cSheetData.getData();
    const zones = {};

    console.log("Calculating mission organization data...");

    /*    Format of zones object
    zones = {
      "ZONE1": {
        "DIST1": {
          "AREA1",
          "AREA2"...
        },
        "DIST2": {...}
      },
      "ZONE2": {...}
    }
    */

    for (const areaData of contactData) {
        const area = {
            areaName: areaData.areaName,
            areaData: areaData,
            /*global getAreaID*/
            areaID: getAreaID(allSheetData, areaData.areaName)
        }
        const district = areaData.district;
        const zone = areaData.zone;

        if (!zones[zone]) //Initialize zones[zone]
            zones[zone] = {};

        if (!zones[zone][district]) //Initialize
            zones[zone][district] = [];

        zones[zone][district].push(area);
    }

    return zones;
}

// making sure that I got the typescript definitions right:
// const missionleadershipTest: leadershipData = {
//     apArea: {
//         ap1: "workd",
//         ap2: "strr",
//         ap3: "wion",
//         areaEmail: "WIOns@missionary.org",
//         areaID: "A389242",
//         areaName: "Mission 3A"
//     },
//     hasStltArea: false,
//     stltArea: {
//         stlt1: "",
//         stlt2: "",
//         stlt3: ""
//     },
//     zones: {
//         "robstown": {
//             hasStlArea: false,
//             zlArea: {
//                 zl1: "",
//                 zl2: "",
//                 zl3: "",
//                 areaName: "",
//                 areaEmail: "",
//                 areaID:""
//             },
//             stlArea: {
//                 stl1: "",
//                 stl2: "",
//                 areaEmail: "",
//                 areaName: "",
//                 areaID: "",
//             },
//             districts: {
//                 "district1": {
//                     areas: {},
//                     dlArea: {
//                         dl: "Name",
//                         areaEmail: "",
//                         areaID: "",
//                         areaName: ""
//                     }
//                 }
//             },
//         },
//         "zoneTwo": {
//             hasStlArea: true,
//             zlArea: {
//                 zl1: "",
//                 zl2: "",
//                 zl3: "",
//                 areaName: "",
//                 areaEmail: "",
//                 areaID: ""
//             },
//             stlArea: {
//                 stl1: "",
//                 stl2: "",
//                 areaEmail: "",
//                 areaName: "",
//                 areaID: "",
//             },
//             districts: {

//             }
//         }
//     }
// }

// getMissionOrgData interfaces

interface leadershipData {
    apArea: ap_area_data,
    hasStltArea: boolean,
    stltArea: stlt_area_data,

    zones: zone_data_group;
    log: object
}

interface zone_org_data {
    [index: string]: area_org_data[]
}

interface district_org_data {
    [index: string]: area_org_data,

}

interface area_org_data {
    areaName: string,
    areaData: contactDataEntryTemporary,
    areaID: string
}

// getMissionLeadershipData interfaces

interface ap_area_data extends leader_area_base {
    ap1: string
    ap2: string
    ap3: string
}

interface stlt_area_data {
    stlt1: string
    stlt2: string
    stlt3?: string
    areaEmail?: string
    areaID?: string
    areaName?: string
}

interface zone_data_group {
    [index: string]: zone_leadership_data;
}

interface zone_leadership_data {
    districts: district_data_group
    zlArea: zl_area_data
    stlArea: stl_area_data
    hasStlArea: boolean
}

interface stl_area_data  {
    stl1?: string
    stl2?: string
    stl3?: string
    areaName?: string
    areaEmail?: string
    areaID?: string
}

interface zl_area_data extends leader_area_base {
    zl1: string
    zl2: string
    zl3?: string
}

interface district_data_group {
    [index: string]: district_leadership_data;
}

interface district_leadership_data {
    areas: area_data_group
    dlArea: dl_area_data
}


interface dl_area_data extends leader_area_base {
    dl: string, // district leader's name
}

interface area_data_group {
    [index: string]: area_leader_data_base;
}

interface leader_area_base extends area_leader_data_base {
    areaName: string
}

interface area_leader_data_base {
    areaEmail: string,
    areaID: string
}

// in missionOrgData, these are keyed by area id
interface manyContactDatas {
    [index:string]: contactDataEntryTemporary
}

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

function getEmptyZlArea(): zl_area_data{
    const output: zl_area_data = {
        zl1: '',
        zl2: '',
        areaName: '',
        areaEmail: '',
        areaID: ''
    };
    return output
}

function getEmptyDlArea(): dl_area_data {
    const output: dl_area_data = {
        dl:'',
        areaName: '',
        areaEmail: '',
        areaID: ''
    };
    return output;
}


/**
 * Calculates and returns an object containing mission leadership data, including area names, emails, and missionary names of every junior missionary leader, as well as flags indicating if each zone has an STL area and whether an STLT area exists.
 * @param {{ [x: string]: any; }} contacts
 */
function getMissionLeadershipData(contacts:manyContactDatas):leadershipData {

    console.log("Calculating leader data from contact data...");


    //Initialized to the empty string to guarantee a defined value
    const apArea:ap_area_data = {
        ap1: "",
        ap2: "",
        ap3: "",
        areaEmail: "",
        areaID: "",
        areaName:""
    };
    const stltArea:stlt_area_data = {
        stlt1: "",
        stlt2: "",
        stlt3: ""
    };
    let hasStltArea = false;

    const zones:zone_data_group = {};








    for (const areaID in contacts) {

        const areaData = contacts[areaID];

        const area = areaData.areaName;
        const district = areaData.district;
        const zone = areaData.zone;
        const areaEmail = areaData.areaEmail;

        if (!zones[zone]) { //Initialize zones[zone], as well as its properties
            zones[zone] = {
                "districts": {},
                "zlArea": getEmptyZlArea(),
                "stlArea": {},
                "hasStlArea": false
            };
        }

        if (!zones[zone].districts[district]) { //Initialize districts[district], as well as its properties
            zones[zone].districts[district] = {
                "areas": {},
                "dlArea": getEmptyDlArea()
            };
        }

        zones[zone].districts[district].areas[area] = { //Set areas[area]
            "areaEmail": areaEmail,
            "areaID": areaID
        };



        for (let i = 1; i <= 3; i++) { //i is the companion number (for ZL1,2,3 etc.)


            let pos = areaData["position" + i];
            if (pos.match(/.*[123]/))
                pos = pos.substring(0, pos.length - 1); //Ex. "ZL1" => "ZL"



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
                    zones[zone].districts[district].dlArea.dl = areaData["name" + i];
                    zones[zone].districts[district].dlArea.areaName = areaData.areaName;
                    zones[zone].districts[district].dlArea.areaEmail = areaData.areaEmail;
                    zones[zone].districts[district].dlArea.areaID = areaData.areaID;
                    break;

                case "DT":
                    zones[zone].districts[district].dlArea.dl = areaData["name" + i];
                    zones[zone].districts[district].dlArea.areaName = areaData.areaName;
                    zones[zone].districts[district].dlArea.areaEmail = areaData.areaEmail;
                    zones[zone].districts[district].dlArea.areaID = areaData.areaID;
                    break;

                    // ZL
                case "ZL":
                    zones[zone].zlArea["zl" + i] = areaData["name" + i];
                    zones[zone].zlArea.areaName = areaData.areaName;
                    zones[zone].zlArea.areaEmail = areaData.areaEmail;
                    zones[zone].zlArea.areaID = areaData.areaID;
                    break;

                case "ZLT":
                    zones[zone].zlArea["zl" + i] = areaData["name" + i];
                    zones[zone].zlArea.areaName = areaData.areaName;
                    zones[zone].zlArea.areaEmail = areaData.areaEmail;
                    zones[zone].zlArea.areaID = areaData.areaID;
                    break;

                    //STL (STLs with greenies are not currently supported)
                case "STL":
                    zones[zone].hasStlArea = true;
                    zones[zone].stlArea["zl" + i] = areaData["name" + i];
                    zones[zone].stlArea.areaName = areaData.areaName;
                    zones[zone].stlArea.areaEmail = areaData.areaEmail;
                    zones[zone].stlArea.areaID = areaData.areaID;
                    break;

                    // AP, STLT
                case "AP":
                    apArea["ap" + i] = areaData["name" + i];
                    apArea.areaName = areaData.areaName;
                    apArea.areaEmail = areaData.areaEmail;
                    apArea.areaID = areaData.areaID;
                    break;
                case "STLT":
                    hasStltArea = true;
                    stltArea["stlt" + i] = areaData["name" + i];
                    stltArea.areaName = areaData.areaName;
                    stltArea.areaEmail = areaData.areaEmail;
                    stltArea.areaID = areaData.areaID;
                    break;

                    // Special Assignment - office missionaries might have this
                case "SA":
                    break;
            }

        }



    }

    const output: leadershipData = {
        zones: zones,
        apArea: apArea,
        stltArea: stltArea,
        hasStltArea: hasStltArea,
        log: {
            leaderDataCalculatedTime: (new Date()).toString()
        }
    }

    return output


}




/**
 * Returns an object whose properties (keyed by areaID) represent areas. Each area contains the names of the DL, ZLs, APs, etc. with stewardship over that area.
 * @param {{ [x: string]: any; }} contacts
 */
function getLeadershipAreaData(contacts:manyContactDatas) {

    const leaderData: leadershipData = getMissionLeadershipData(contacts);

    const zones = leaderData.zones;
    const apArea = leaderData.apArea;
    const stltArea = leaderData.stltArea;

    const leaderAreaData = {};

    let leaderCalcTime;
    if (Object.hasOwnProperty.call(leaderData.log, "leaderDataCalculatedTime")){
        leaderCalcTime = leaderData.log["leaderDataCalculatedTime"]
    }

    for (const areaID in contacts) {

        const areaData = contacts[areaID];

        const zone = areaData.zone;
        const district = areaData.district;
        const areaName = areaData.areaName;

        leaderAreaData[areaID] = {
            "areaName": areaName, //Debug purposes - not actually used

            "districtLeader": rmvUnd(zones[zone].districts[district].dlArea.dl),
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
            "stlt3": rmvUnd(stltArea.stlt3),

            "log": {
                leaderDataPulled: true,
                leaderDataCalculatedTime: leaderCalcTime,
            },

        };

    }


    console.log("Finished calculating leadership data for each area.");

    return leaderAreaData;


    /**
     * @param {string} obj
     */
    function rmvUnd(obj) {
        return (typeof obj == 'undefined') ? "" : obj;
    }


}