/**
 *  Single-night rewrite of the dataflow system to modernize it and make it be less of an utter pain in the butt.
 *  Also it kinda needs some help.
 */

/**
 * @description wrapper function for the new data flow.
 */
function updateDataSheetV2_wrapper() {
    /*
    Notes: this requires the newer add_iterant CRUD capable boogie stuff we wrote.
    If you haven't enabled it yet on the form and data sheets, you'll need to for
    this to get very far.
     */

    const allSheetData = constructSheetDataV3(["contact", "form", "data"])
    
    const formSheet = allSheetData.form
    const dataSheet = allSheetData.data
    const contactSheet = allSheetData.contact

    /* this version will not be importing contacts at runtime, and trusting
    that those are reasonably up to date. */

    // step zero: copy any soft-coded columns from forms into data
    // but only if the form response & data sheets allows them, otherwise it's a waste of time
    if (formSheet.rsd.includeSoftcodedColumns === true && dataSheet.rsd.includeSoftcodedColumns === true) {
        dataSheet.addKeys(formSheet)
    } else {
        console.warn("softcoded columns disabled, no new columns will be added.")
    }

    // now we load up the form response data itself
    let formDataClass = new kiDataClass(formSheet.getData())

    // if there's nothing in there, then we'll exit.  Great performance!
    if (formDataClass.data.length === 0) {
        console.error("No data in Form Response Sheet!")
        return
    }
    // remove things that have already been pulled
    formDataClass.removeMatchingByKey("responsePulled", [true])
    // if there's nothing new left, we'll also exit.  Speeeeeed
    if (formDataClass.data.length === 0) {
        console.error("No new form responses to pull, exiting!")
        return
    }
    
    /*okay, now that we know for sure we have data to do things with
    we're going to go link the area names to zones, districts, and areas
    This is how we get away with only asking for an area name and get
    a bunch more area information back out on the other side.
    */
    
    let test = getMissionOrgDataV2(contactSheet)

    
}


