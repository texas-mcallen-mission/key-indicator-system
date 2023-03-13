/**
 *  Single-night rewrite of the dataflow system to modernize it and make it be less of an utter pain in the butt.
 *  Also it kinda needs some help.
 */

/**
 * @description wrapper function for the new data flow.
 * @global
 */
function updateDataSheetV2() {
    /*
    Notes: this requires the newer add_iterant CRUD capable boogie stuff we wrote.
    If you haven't enabled it yet on the form and data sheets, you'll need to for
    this to get very far.
     */
    console.log("Importing Data from Form")
    const allSheetData = constructSheetDataV3(["contact", "form", "data"])
    
    const formSheet = allSheetData.form
    const dataSheet = allSheetData.data
    const contactSheet = allSheetData.contact

    /* this version will not be importing contacts at runtime, and trusting
    that those are reasonably up to date. */

    /*step zero: copy any soft-coded columns from forms into data, but only if the 
    form response & data sheets allows them, otherwise it's a waste of time.
    */
    if (formSheet.rsd.includeSoftcodedColumns === true && dataSheet.rsd.includeSoftcodedColumns === true) {
        dataSheet.addKeys(formSheet)
    } else {
        console.warn("softcoded columns disabled, no new columns will be added.")
    }
    // store the iterant key: this is how we only mark particular rows as being pulled
    // further down
    const itKey = formSheet.iterantKey
    // now we load up the form response data itself
    const formDataClass = new kiDataClass(formSheet.getData())

    // if there's nothing in there, then we'll exit.  Great performance!
    if (formDataClass.data.length === 0) {
        console.warn("No data in Form Response Sheet!")
        return
    }
    // remove things that have already been pulled
    formDataClass.removeMatchingByKey("responsePulled", [true])
    // if there's nothing new left, we'll also exit.  Speeeeeed
    if (formDataClass.data.length === 0) {
        console.warn("No new form responses to pull, exiting!")
        return
    }
    
    /*okay, now that we know for sure we have data to do things with-
    we'll calculate the leadership data, turn it into a nice table, and then
    join it into the form response data to get out our final entry format
    */
   
   // load up contact data, calculate leadership data
    const contactData = convertKiDataToContactEntries_(contactSheet.getData())
    const missionOrgData = getMissionOrgDataV2_(contactData)
    const leadershipDataRaw = getMissionLeadershipDataV2_(missionOrgData)
    const leadershipDataTable = collapseLeadershipDataIntoTable_(leadershipDataRaw, contactData)
    // then, we join.
    // I did a *lot* of work to get this down to four lines of code. Yay abstractions!
    // The stuff this relies on is in ``dataFlow/missionOrgDataV2.ts``
    // At first, I thought areaID would work, and then I realized we ask for area name
    // not area email.  Ooooops
    formDataClass.leftJoin(leadershipDataTable, "areaName")

    // we may have forgotten to also add the area data back in, my bad!  Here goes that:
    formDataClass.leftJoin(contactData,"areaName")
    // mark stuff as not duplicate for starters, because otherwise the data won't show up in anything.
    formDataClass.bulkAppendObject({ isDuplicate: false })

    // before we go dumping data in, we have to go figure out which rows we need to mark as pulled.
    // I don't have a better way of doing this yet, so you have to see a for loop.  Womp womp.
    const markAsPulled:kiDataEntry[] = []
    // basically make a second kiDataEntry that has the same position value as the entry
    // and then set ``responsePulled`` to true
    for (const entry of formDataClass.data) {
        const output = {
            "responsePulled":true
        }
        output[itKey] = entry[itKey]
        markAsPulled.push(output)
    }
    // stick new data at the bottom.
    dataSheet.appendData(formDataClass.end)
    // Goes through and for every remaining entry, mark them as pulled.
    if (CONFIG.dataFlow.skipMarkingPulled != true) {
        formSheet.updateRows(markAsPulled)
    }
    console.log("Completed Updates!")

}


