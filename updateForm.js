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
    for (let item of items) {
        if (/*is the right item*/) {
            areaNamesItem = item;
            break;
        }
    }
    if (typeof areaNamesItem == 'undefined')
        throw `Couldn't find an Area Names question in the Google Form!`

    // update area names

}