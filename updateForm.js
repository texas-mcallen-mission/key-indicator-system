/*
        updateForm.js
        Updating the Google Form automatically - area names, etc.
*/


function updateForm() {
        
    let allSheetData = constructSheetData();
    let cSheetData = allSheetData.contact;
    let areaNames = cSheetData.getAllOfKey('areaName');

    // open form
    let form = FormApp.openById(CONFIG.KIC_FORM_ID);

    // find area names element
    let items = form.getItems(FormApp.ItemType.LIST);
    for (let i = 0; i < items.length && typeof areaNamesItem == 'undefined'; i++) {
        if (items[i].asListItem().getTitle() == CONFIG.AREA_NAME_QUESTION_TITLE) {
            var areaNamesItem = items[i];
        }
    }
    if (typeof areaNamesItem == 'undefined')
        throw `Couldn't find an Area Names question in the Google Form!`

    areaNamesItem.asListItem().setChoiceValues(areaNames);


    //delete old form responses?
    if (CONFIG.DEL_OLD_RESPONSES_AGE_LIMIT > 0) {
        for (let formResponse of form.getResponses()) {
            let tstamp = formResponse.getTimestamp();
            if (tstamp == null) continue; //Skip responses that haven't been submitted yet
            let ageInDays = Math.floor(tstamp.getTime() / (1000 * 60 * 60 * 24));
            //if old, delete
            if (ageInDays > CONFIG.DEL_OLD_RESPONSES_AGE_LIMIT) {
                form.deleteResponse(formResponse.getId());
            }
        }
    }
}