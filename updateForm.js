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

    // update area names

}