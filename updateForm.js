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

}