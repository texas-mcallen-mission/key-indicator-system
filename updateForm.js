/*
        updateForm.js
        Updating the Google Form automatically - area names, etc.
*/


function updateForm() {
    
    let formId = '';
    let elemId = '';
    
    
    let allSheetData = constructSheetData();
    let cSheetData = allSheetData.contact;
    let areaNames = cSheetData.getAllOfKey('areaName');

    // open form
    let form = FormApp.openById(formId);

    // find area names element
    let items = form.getItems(itemType);
    let areaNamesItem;
    for (let i = 0; i < items.length && typeof areaNamesItem == 'undefined'; i++) {
        if (/*is the right item*/) {
            areaNamesItem = items[i];
            break;
        }
    }
    if (typeof areaNamesItem == 'undefined')
        throw `Couldn't find an Area Names question in the Google Form!`

    // update area names


    //delete old form responses?

}