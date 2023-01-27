/*
        updateForm.js
        Updating the Google Form automatically - area names, etc.
*/

/**
 * Updates the Google Form for the Key Indicators for Conversion Report, such as updating the list of area names. Also deletes old form responses from the Google Form (not from the Sheet) if the config is set.
 */
function updateForm() {

    const allSheetData = constructSheetData();
    const cSheetData = allSheetData.contact;
    const areaNames = cSheetData.getAllOfKey('areaName');
    areaNames.unshift("I can't find the right area name!");

    const form = FormApp.openById(CONFIG.docIds_kicFormId);

    //Find Area Names question
    const items = form.getItems(FormApp.ItemType.LIST);

    //For each item, or until the right item is found
    for (let i = 0; i < items.length && typeof areaNamesItem == 'undefined'; i++) {
        if (items[i].asListItem().getTitle() == CONFIG.general_areaNameQuestionTitle) {
            var areaNamesItem = items[i];
        }
    }

    if (typeof areaNamesItem == 'undefined')
        throw "Couldn't find an Area Names question in the Google Form!";

    areaNamesItem.asListItem().setChoiceValues(areaNames);



    //Delete old form responses
    if (CONFIG.general_deleteOldResponsesAgeLimit > 0) {
        for (const formResponse of form.getResponses()) {
            const tstamp = formResponse.getTimestamp();
            if (tstamp == null) continue; //Skip responses that haven't been submitted yet

            const ageInDays = Math.floor(tstamp.getTime() / (1000 * 60 * 60 * 24));
            if (ageInDays > CONFIG.general_deleteOldResponsesAgeLimit) {
                form.deleteResponse(formResponse.getId());
            }
        }
    }
}
