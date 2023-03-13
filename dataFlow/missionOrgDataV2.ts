
interface missionOrgData {
    [index:string]:zoneOrgData
}

interface zoneOrgData {
    [index:string]:districtOrgData
}

type districtOrgData = contactEntry[]


function convertKiDataToContactEntries_(kiData: kiDataEntry[]): contactEntry[] {
    let output: contactEntry[] = []
    
    for (const entry of kiData) {
        let convertedEntry: contactEntry = {
            dateContactGenerated: '',
            areaEmail: '',
            areaName: '',
            name1: '',
            position1: '',
            isTrainer1: false,
            name2: '',
            position2: '',
            isTrainer2: false,
            name3: '',
            position3: '',
            isTrainer3: false,
            district: '',
            zone: '',
            unitString: '',
            hasMultipleUnits: false,
            languageString: '',
            isSeniorCouple: false,
            isSisterArea: false,
            vehicleMiles: '',
            vinLast8: '',
            aptAddress: '',
            areaID: '',
            phoneNumber: '',
            missionaryEmail1: '',
            missionaryEmail2: '',
            missionaryEmail3: '',
            ...entry
        }
        output.push(convertedEntry)

    }

    return output
}

function getMissionOrgDataV2_(contactData:contactEntry[]):missionOrgData {    
    // const contactData: contactEntry[] = convertKiDataToContactEntries_(cSheetData.getData())
    /* After doing a ton of work, I realized that I already did all the heavy 
    lifting for this chunk of rewrite in ``sheetCore/dataManipulator.ts``
    */
    let contactDataClass = new kiDataClass(contactData)
    /* 
    I know this is bad, but I can guarantee that it'll work because *trust me bro*
    kiDataClass doesn't do any editing of keys / etc. unless you ask it to
    That means that if you make an interface that extends the kiDataEntry interface
    and then pass data in that format to kiDataClass, you'll get that back out.
    I just dunno how to represent that / if that's even possible 
    */
   //@ts-expect-error explained above
    let output: missionOrgData = contactDataClass.groupDataByMultipleKeys(["zone", "district", "area"])
    return output
}

function testOrgDatas() {
    let cSheet = constructSheetDataV3(["contact"]).contact
    let contactData = convertKiDataToContactEntries_(cSheet.getData())
    let oldOrgData = getMissionOrgData(cSheet)
    let newOrgData = getMissionOrgDataV2_(contactData)
    console.log("Check This in the Debugger!")
}

interface missionLeadershipData {
    apArea: {
        ap1: string,
        ap2: string,
        ap3: string;
    },
    hasStltArea:boolean,
    stltArea: {
        stlt1: string,
        stlt2: string,
        stlt3: string,
    };
    zones: manyZoneLeadershipDatas;
}

interface manyZoneLeadershipDatas {
    [index: string]: zoneLeadershipData;
}

interface zoneLeadershipData {
    zlArea: {
        zl1: string,
        zl2: string,
        zl3: string,
        areaID: string,
        areaName: string,
        areaEmail: string;
    },
    hasStlArea:boolean,
    stlArea: {
        stl1: string,
        stl2: string,
        stl3: string,
        areaID: string,
        areaName: string,
        areaEmail: string;
    },
    districts: manyDistrictLeadershipDatas;
}

interface manyDistrictLeadershipDatas {
    [index: string]: districtLeadershipData;
}

interface districtLeadershipData {
    dlArea: {
        dl: string;
        areaID: string,
        areaName: string,
        areaEmail: string;
    };
    areas: manyContactEntries;
}

interface manyContactEntries {
    [index: string]: contactEntry;
}


function getMissionLeadershipDataV2_(missionData:missionOrgData) {
    /* look man, I think I hate this thing as much as you do, but there's basically
    no other way that we've figured out to figure out who your district leader is
    without a *nasty* lookup search thing.

    At least it has types and stuff now?
    */
    const leadershipData: missionLeadershipData = {
        apArea: {
            ap1: '',
            ap2: '',
            ap3: ''
        },
        hasStltArea:false,
        stltArea: {
            stlt1: '',
            stlt2: '',
            stlt3: ''
        },
        zones: {}
    }

    for (const zone in missionData) {
        // define the output stuff
        const zoneOutput: zoneLeadershipData = {
            zlArea: {
                zl1: '',
                zl2: '',
                zl3: '',
                areaID: '',
                areaName: '',
                areaEmail: ''
            },
            hasStlArea:false,
            stlArea: {
                stl1: '',
                stl2: '',
                stl3: '',
                areaID: '',
                areaName: '',
                areaEmail: ''
            },
            districts: {}
        }

        let zoneData:zoneOrgData = missionData[zone]
        for (const district in zoneData) {
            const districtOutput: districtLeadershipData = {
                dlArea: {
                    dl: '',
                    areaID: '',
                    areaName: '',
                    areaEmail: ''
                },
                areas: {}
            }
            // this type is from missionOrg, not Leadership
            const districtData:districtOrgData = zoneData[district]
            // area is of type contactEntry, which I would put in there 
            // ...if it let me, but it doesn't ☹️
            for (const area of districtData) {
                districtOutput.areas[area.areaID] = area
                const areaData = {
                    areaID: area.areaID,
                    areaName: area.areaName,
                    areaEmail:area.areaEmail
                }
                // this thing is awful, I hate it, and I don't see a way around it.
                // I was able to make the case statement a *lot* nicer, though!
                for (let i = 1; i <= 3; i++) {  //i is the companion number (for ZL1,2,3 etc.)


                    let pos = area["position" + i];
                    if (pos.match(/.*[123]/))
                        pos = pos.substring(0, pos.length - 1); //Ex. "ZL1" => "ZL"



                    /*  IMPORTANT NOTE (as of 2021):      
                    STL, STLT, AP, and SA are assumed to not be trainers.

                    STLs are supported on the mission-office level, but are not fully implemented.

                    This is because IMOS doesn't keep track of which zones an STL covers, and STL
                    areas can cover multiple zones. For a zone without STLs, the system has no
                    way of knowing which STLs cover it. It would have to be input manually, like
                    through a spreadsheet that the APs update regularly by hand.

                    ... Definitely just copied that note from the previous version.
                    */

                    switch (pos) {

                        // this only cares about the current leadership stuff.
                        // SC, JC, etc.are ignored.
                        // District Leader
                        case "DL":
                            // since we loop through every position, we're going to do a pass-through thing to keep the object's format together in one piece 
                            districtOutput.dlArea = { ...districtOutput.dlArea, ...areaData }
                            districtOutput.dlArea.dl = area["name" + i]
                            break;

                        case "DT":
                            districtOutput.dlArea = { ...districtOutput.dlArea, ...areaData };
                            districtOutput.dlArea.dl = area["name" + i]
                            break;

                        // ZL
                        case "ZL":
                            /*sometimes, I startle myself by my own sheer brilliance
                            ok just kidding, but this is pretty smart
                            since there are multiple zl's, we have to keep the rest
                            of the data intact when it gets hit for a third time.
                            The second spread operator doesn't have to happen again,
                            and comes at a bit of a performance penalty, but it makes
                            the code a *lot* more elegant.
                            */
                            zoneOutput.zlArea = { ...zoneOutput.zlArea, ...areaData }
                            zoneOutput.zlArea["zl" + i] = area["name" + i]
                            break;

                        case "ZLT":
                            zoneOutput.zlArea = { ...zoneOutput.zlArea, ...areaData };
                            zoneOutput.zlArea["zl" + i] = area["name" + i]
                            break;

                        //STL (STLs with greenies are not currently supported)
                        case "STL":
                            zoneOutput.hasStlArea = true
                            zoneOutput.stlArea = { ...zoneOutput.stlArea, ...areaData };
                            zoneOutput.stlArea["stl" + i] = area["name" + i]
                            
                            break;

                        // AP, STLT
                        case "AP":
                            leadershipData.apArea = { ...leadershipData.apArea, ...areaData }
                            leadershipData.apArea["ap"+i] = area["name"+i]
                            break;
                        case "STLT":
                            leadershipData.hasStltArea = true
                            leadershipData.stltArea = { ...leadershipData.stltArea, ...areaData }
                            leadershipData.stltArea["stlt"+i] = area["name"+i]
                            break;

                        // Special Assignment - office missionaries might have this
                        case "SA":
                            break;
                        default:
                            break;
                    }

                }
            }

            leadershipData.zones[zone].districts[district] = districtOutput
        }

        leadershipData.zones[zone] = zoneOutput
    }

    return leadershipData
}


interface leaderData extends kiDataEntry {
    // areaName: string,
    areaID:string
    districtLeader: string,
    zoneLeader1: string,
    zoneLeader2: string,
    zoneLeader3: string,
    stl1: string,
    stl2: string,
    stl3: string,
    assistant1: string,
    assistant2: string,
    assistant3: string,
    stlt1: string,
    stlt2: string,
    stlt3: string,
}

// WYLO: turning the missionLeadershipData thing into a contact-type table I can join by areaID
// that way I can use the kiDataClass to merge in data and not have to think about it EVER AGAIN

/**
 * @description I wanted to be able to use a join instead of all the previous crap, so I made something else do the work for me.
 *  TBH this could maybe potentially be cached or something in the future.  At the moment, it's just in-memory.
 * @param {missionLeadershipData} leadershipData
 * @param {contactEntry[]} contactData
 * @return {*}  {leaderData[]}
 */
function collapseLeadershipDataIntoTable_(leadershipData: missionLeadershipData,contactData:contactEntry[]):leaderData[] {
    function fixUndef(obj):string {
        if (typeof obj == 'undefined') {
            return ""
        } else {
            return obj
        }
    }
    let output: leaderData[] = []
    for (const contact of contactData) {
        let zone = contact.zone
        let district = contact.district
        let leaderDataEntry: leaderData = {
            areaID: contact.areaID,
            districtLeader: fixUndef(leadershipData.zones[zone].districts[district].dlArea.dl),
            zoneLeader1: fixUndef(leadershipData.zones[zone].zlArea.zl1),
            zoneLeader2: fixUndef(leadershipData.zones[zone].zlArea.zl2),
            zoneLeader3: fixUndef(leadershipData.zones[zone].zlArea.zl3),
            stl1: fixUndef(leadershipData.zones[zone].stlArea.stl1),
            stl2: fixUndef(leadershipData.zones[zone].stlArea.stl2),
            stl3: fixUndef(leadershipData.zones[zone].stlArea.stl3),
            assistant1: fixUndef(leadershipData.apArea.ap1),
            assistant2: fixUndef(leadershipData.apArea.ap2),
            assistant3: fixUndef(leadershipData.apArea.ap3),
            stlt1: fixUndef(leadershipData.stltArea.stlt1),
            stlt2: fixUndef(leadershipData.stltArea.stlt2),
            stlt3: fixUndef(leadershipData.stltArea.stlt3)
        }
        output.push(leaderDataEntry)
    }
    return output
}