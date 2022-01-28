/*
        updateForm.js
        Updating the Google Form automatically - area names, etc.
*/

/**
 * Updates the Google Form for the Key Indicators for Conversion Report, such as updating the list of area names. Also deletes old form responses from the Google Form (not from the Sheet) if the config is set.
 */
function updateForm() {

    let allSheetData = constructSheetData();
    let cSheetData = allSheetData.contact;
    let areaNames = cSheetData.getAllOfKey('areaName');
    areaNames.unshift("I can't find the right area name!");

    let form = FormApp.openById(CONFIG.KIC_FORM_ID);

    //Find Area Names question
    let items = form.getItems(FormApp.ItemType.LIST);

    //For each item, or until the right item is found
    for (let i = 0; i < items.length && typeof areaNamesItem == 'undefined'; i++) {
        if (items[i].asListItem().getTitle() == CONFIG.AREA_NAME_QUESTION_TITLE) {
            var areaNamesItem = items[i];
        }
    }

    if (typeof areaNamesItem == 'undefined')
        throw `Couldn't find an Area Names question in the Google Form!`

    areaNamesItem.asListItem().setChoiceValues(areaNames);



    //Delete old form responses
    if (CONFIG.DEL_OLD_RESPONSES_AGE_LIMIT > 0) {
        for (let formResponse of form.getResponses()) {
            let tstamp = formResponse.getTimestamp();
            if (tstamp == null) continue; //Skip responses that haven't been submitted yet

            let ageInDays = Math.floor(tstamp.getTime() / (1000 * 60 * 60 * 24));
            if (ageInDays > CONFIG.DEL_OLD_RESPONSES_AGE_LIMIT) {
                form.deleteResponse(formResponse.getId());
            }
        }
    }
}