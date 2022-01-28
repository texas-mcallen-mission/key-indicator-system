/*
        updateForm.js
        Updating the Google Form automatically - area names, etc.
*/


function updateForm() {
    let allSheetData = constructSheetData();
    let cSheetData = allSheetData.contact;

    let formId = '';
    let elemId = '';

    let form = FormApp.openById(formId);

    /*
    get list of current area names
    open form
    find area names element
    update area names
    */

}