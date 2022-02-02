//@ts-check
/*
        SheetData
        Handles sheet setup, headers, column indices, pulling and pushing data, etc.
*/







/**
 * A wrapper for the RawSheetData class to hide its methods and fields.
 * 
 * An instance of SheetData provides greater access to the data in a Sheet, given certain assumptions about the format of that Sheet. Functions in the Sheet class usually organize data by row, then by column index number; most SheetData functions organize data by row, then by column header string (or hardcoded key string). This preserves structure when reordering columns or moving data between Sheets as long as corresponding columns have identical headers.
 * 
 * When defined, hardcoded key strings can override using header values as strings. This allows consistant functionality even when the header row changes, and lets methods access specific types of data using the key string without needing the column index for that data. Key strings are hardcoded by being passed through the initialKeyToIndex parameter. Any keys not hardcoded are calculated internally, using the column header as the key string. Columns with blank headers are ignored.
 * 
 * For SheetData to work properly, there must be a single header row. Every nonblank row below the header row is assumed to contain data. Rows above the header row are ignored. Blank data rows (rows whose leftmost value is blank) are skipped, meaning not all SheetData functions preserve them.
 */
class SheetData {

    /**
     * Wrap a RawSheetData into a full SheetData.
     * @see SheetData
     * @param {RawSheetData} rawSheetData - The RawSheetData to wrap.
     */
    constructor(rawSheetData) {
        this.rsd = rawSheetData;
    }

    /**
     * Returns the Sheet object for this SheetData.
     */
    getSheet() {
        return this.rsd.getSheet();
    }

    /**
     * Returns the name of the Sheet for this SheetData.
     */
    getTabName() {
        return this.rsd.getTabName();
    }

    /**
     * Returns the index, starting with 0, of the header row of this sheet.
     */
    getHeaderRow() {
        return this.rsd.getHeaderRow();
    }

    /**
     * Returns the index for the column with the given key string.
     * @param {string} key
     */
    getIndex(key) {
        return this.rsd.getIndex(key);
    }

    /**
     * Returns the key string for the column with the given index.
     * @param {number} index
     */
    getKey(index) {
        return this.rsd.getKey(index);
    }

    /**
     * Returns true if this SheetData object has a defined key attached to the given index.
     * @param {number} index
     */
    hasIndex(index) {
        return this.rsd.hasIndex(index);
    }

    /**
     * Returns true if this SheetData object has a defined value for the given key.
     * @param {string} key
     */
    hasKey(key) {
        return this.rsd.hasKey(key);
    }

    /**
     * Returns the header row of this sheet.
     * @returns {string[]} The header row if this sheet.
     */
    getHeaders() {
        return this.rsd.getHeaders();
    }

    /**
     * Returns the data from this sheet as a two dimensional array. Only includes rows below the header row. Blank rows (rows whose leftmost cell is the empty string) are skipped.
     * @returns {any[][]} The data from this sheet as a two dimentional array.
     */
    getValues() {
        return this.rsd.getValues();
    }

    /**
     * Returns the data from this sheet as an array of objects. Each object represents a row in this sheet and contains the data for that row as properties. Only includes rows below the header row. Blank rows (rows whose leftmost cell is the empty string) are skipped.
     * @returns {{}[]} The data from this sheet as an array of objects.
     */
    getData() {
        return this.rsd.getData();
    }

    /**
     * Inserts rows of data into the Sheet, formatted as an array of row objects.
     * @param {Object} data The data to insert.
     */
    insertData(data) {
        this.rsd.insertData(data);
    }

    /**
     * Inserts rows of data into the Sheet. Takes a 2D array.
     * @param {any[][]} values The values to insert.
     */
    insertValues(values) {
        this.rsd.insertValues(values);
    }

    /**
     * Clears the content of this Sheet below the header row, leaving formatting intact.
     */
    clearContent() {
        this.rsd.clearContent();
    }

    /**
     * Returns an array of all the defined keys in this SheetData.
     * @returns {string[]} An array of defined keys in this sheet.
     */
    getKeys() {
        return this.rsd.getKeys();
    }

    /**
     * Returns an array of all the values in the sheet for the given key.
     * @returns An array containing all values for the given key.
     * @param {string} key The key string.
     */
    getAllOfKey(key) {
        return this.rsd.getAllOfKey(key);
    }

    /**
     * Returns an array of all the values in the sheet for the column with the given index.
     * @returns An array containing all values from the given column.
     * @param {number} index The index of the column, starting from 0.
     */
    getAllOfIndex(index) {
        return this.rsd.getAllOfIndex(index);
    }


}














/**
 * A RawSheetData instance. This should be wrapped in a SheetData before use.
 * 
 * @see SheetData
 */
class RawSheetData {

    /*
    Fields
  
    tabName: The name of the Sheet this RawSheetData is tied to.
    nextFreeColumn: The index of the leftmost column with no defined key.
    sheet: The Sheet object this RawSheetData is tied to.
    headerRow: The row index of the header row.
    
    keyToIndex: An object whose properties are keys (strings) representing what data goes in a column (ex "areaID", "stl2", "np").
    Its values are the indices (starting with 0) of the column with that data.
    indexToKey: The reverse of keyToIndex. An array whose value at a given index is the key corresponding to that index.
    */

    /**
     * @param {string} tabName - The name of the corresponding Sheet.
     * @param {number} headerRow - The row index, starting with 0, of the header row.
     * @param {any} initialKeyToIndex - An object containing data about which columns contain hardcoded keys. Formatted as {keyStr: columnIndex ...} where keyStr is a key string and colIndex is the index (starting with 0) of the column to contain that key.
     */
    constructor(tabName, headerRow, initialKeyToIndex = {}) {

        this.tabName = tabName;
        this.headerRow = headerRow;
        this.keyToIndex = initialKeyToIndex;

        this.buildIndexToKey_();

        this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.tabName);
        if (this.sheet == null) throw `Couldn't construct SheetData: no sheet found with name '${this.tabName}'`;

    }





    /*   Change from running on construct to running on get headers?
        initInitialHeaders_(keyToIndex) {
          let headers = [];
    
          for (let key in keyToIndex) {
            let index = keyToIndex[key];
    
            if (typeof headers[index] != 'undefined')
              throw "Data collision error!";
            if (typeof SheetData.HEADER_NAMES[key] == 'undefined')
              throw `Couldn't find initial header for key $'{key}'`
    
            headers[index] = SheetData.HEADER_NAMES[key];
          }
    
          return headers;
        }
      */


    //Private class methods

    /**
     * Build indexToKey, the complement of keyToIndex.
     */
    buildIndexToKey_() {
        let newIndexToKey = [];
        for (let key in this.keyToIndex) {
            let index = this.keyToIndex[key];
            newIndexToKey[index] = key;
        }
        this.indexToKey = newIndexToKey;
    }

    /**
     * Get the next blank column not assigned a key. It is NOT guaranteed to eventually return every blank column.
     * @returns The next column not assigned a key.
     */
    getNextFreeColumn_() {
        // @ts-ignore
        return this.indexToKey.length;
    }

    /**
     * @param {string} key
     * @param {string[]} header
     * @param {number} index
     */
    addColumnWithHeaderAt_(key, header, index) {
        if (key == "") return;
        if (this.hasIndex(index))
            throw `Potential data collision! Tried to add key '${key}' to index '${index}' in sheet ${this.getTabName()}, but that index already has key '${this.getKey(index)}'`;
        if (this.hasKey(key))
            throw `Potential data collision! Tried to add key '${key}' to index '${index}' in sheet ${this.getTabName()}, but that key already exists at index '${this.getIndex(key)}'`;

        this.keyToIndex[key] = index;
        // @ts-ignore
        this.indexToKey[index] = key;
    }

    /**
     * @param {any} key
     * @param {any} header
     */
    addColumnWithHeader_(key, header) {
        let index = this.getNextFreeColumn_();
        this.addColumnWithHeaderAt_(key, header, index);
    }

    /**
     * @param {any} key
     * @param {number} index
     */
    addColumnAt_(key, index) {
        let header = key;   //TODO Add preset headers?
        this.addColumnWithHeaderAt_(key, header, index);
    }

    /**
     * @param {any} key
     */
    addColumn_(key) {
        let index = this.getNextFreeColumn_();
        this.addColumnAt_(key, index);
    }





    /*   Public class methods   */


    /**
     * Returns the Sheet object for this RawSheetData.
     */
    getSheet() {
        return this.sheet;
    }

    /**
     * Returns the name of the Sheet for this RawSheetData.
     */
    getTabName() {
        return this.tabName;
    }

    /**
     * Returns the index, starting with 0, of the header row of this sheet.
     */
    getHeaderRow() {
        return this.headerRow;
    }

    /**
     * Returns the index for the column with the given key string.
     * @param {string} key
     */
    getIndex(key) {
        if (!this.hasKey(key))
            throw `Couldn't get index from key: key '${key}' not found in sheet '${this.tabName}'`;

        return this.keyToIndex[key];
    }

    /**
     * Returns the key string for the column with the given index.
     * @param {number} index
     */
    getKey(index) {
        if (!this.hasIndex(index))
            throw `Couldn't get key from index: index '${index}' not defined in sheet '${this.tabName}'`;

        // @ts-ignore
        return this.indexToKey[index];
    }

    /**
     * Returns true if this RawSheetData object has a defined key attached to the given index.
     * @param {number} index
     */
    hasIndex(index) {
        if (typeof index == 'undefined') throw `Tried to use undefined as an index`;
        // @ts-ignore
        return typeof this.indexToKey[index] != 'undefined';
    }

    /**
     * Returns true if this RawSheetData object has a defined value for the given key.
     * @param {string} key
     */
    hasKey(key) {
        if (typeof key == 'undefined') throw `Tried to use undefined as a key string`;
        return typeof this.keyToIndex[key] != 'undefined';
    }

    /**
     * Returns the header row of this sheet.
     * @returns {string[]} The header row if this sheet.
     */
    getHeaders() {
        let range = this.getSheet().getRange(this.headerRow + 1, 1, 1, this.getSheet().getLastColumn());
        return range.getValues()[0];
    }

    /**
     * Returns the data from this sheet as a two dimensional array. Only includes rows below the header row. Blank rows (rows whose leftmost cell is the empty string) are skipped.
     * @returns {any[][]} The data from this sheet as a two dimentional array.
     */
    getValues() {
        let values = [];
        let rawValues = this.getSheet().getDataRange().getValues();
        for (let i = this.headerRow + 1; i > 0; i--) rawValues.shift(); //Skip header rows
        for (let row of rawValues) if (row[0] != "") values.push(row); //Skip blank rows
        return values;
    }


    /**
     * Returns the data from this sheet as an array of objects. Each object represents a row in this sheet and contains the data for that row as properties. Only includes rows below the header row. Blank rows (rows whose leftmost cell is the empty string) are skipped.
     * @returns {{}[]} The data from this sheet as an array of objects.
     */
    getData() {
        let outValues = [];
        let values = this.getValues();
        for (let row of values) {
            if (row[0] == "") continue; //Skip blank rows

            let rowObj = {};
            for (let i = 0; i < row.length; i++) {
                // @ts-ignore
                let key = this.indexToKey[i];
                rowObj[key] = row[i];
            }

            outValues.push(rowObj);
        }
        return outValues;
    }

    /**
     * Inserts rows of data into the Sheet, formatted as an array of row objects.
     * @param {Object} data The data to insert.
     */
    insertData(data) {
        if (data.length == 0) return;

        let values = [];
        let skippedKeys = new Set();
        let maxIndex = 0;

        for (let rowData of data) {
            let arr = [];
            for (let key in rowData) {

                if (!this.hasKey(key)) {
                    skippedKeys.add(key);
                } else {
                    arr[this.getIndex(key)] = rowData[key];
                    maxIndex = Math.max(maxIndex, this.getIndex(key));
                }

            }
            values.push(arr);
        }

        //Force all rows to be of the same length
        for (let arr of values)
            if (typeof arr[maxIndex] == 'undefined')
                arr[maxIndex] = "";

        for (let key of skippedKeys)
            Logger.log(`Skipped key ${key} while pushing to sheet ${this.tabName}. Sheet doesn't have that key`);

        this.insertValues(values);
    }

    /**
     * Inserts rows of data into the Sheet. Takes a 2D array.
     * @param {any[][]} values The values to insert.
     */
    insertValues(values) {
        if (values.length == 0) return;
        this.getSheet().insertRowsBefore(this.headerRow + 2, values.length); //Insert rows BEFORE the row AFTER the header row, so it won't use header formatting
        let range = this.getSheet().getRange(this.headerRow + 2, 1, values.length, values[0].length);
        range.setValues(values);
    }

    /**
     * Clears the content of this Sheet below the header row, leaving formatting intact.
     */
    clearContent() {
        let startRow = this.getHeaderRow() + 2;
        let numRows = this.getSheet().getLastRow() + 1 - startRow;
        let numCols = this.getSheet().getLastColumn();
        this.getSheet().getRange(startRow, 1, numRows, numCols).clearContent();
    }

    /**
     * Returns an array of all the defined keys in this RawSheetData.
     * @returns {string[]} An array of defined keys in this sheet.
     */
    getKeys() {
        return Object.keys(this.keyToIndex);
    }

    /**
     * Returns an array of all the values in the sheet for the given key.
     * @returns An array containing all values for the given key.
     * @param {string} key The key string.
     */
    getAllOfKey(key) {
        let index = this.keyToIndex[key];
        return this.getAllOfIndex(index);
    }

    /**
     * Returns an array of all the values in the sheet for the column with the given index.
     * @returns An array containing all values from the given column.
     * @param {number} index The index of the column, starting from 0.
     */
    getAllOfIndex(index) {
        let values = this.getValues();
        let arr = [];

        for (let row = 0; row < values.length; row++) {
            let val = values[row][index];
            arr.push(val);
        }

        return arr;
    }




}







//                The following are basically RawSheetData methods - they form an external constructor, treating RawSheetData like an Enum. They're only separate from the class because static variables don't work properly in Apps Script.
//                populateExtraColumnData()
//                sheetDataConstructor()







/**
 * @param {any} allSheetData
 */
function populateExtraColumnData_(allSheetData) {
    let formSheetData = allSheetData.form;
    let dataSheetData = allSheetData.data;

    let formSheet = formSheetData.getSheet();
    let dataSheet = dataSheetData.getSheet();
    let formCols = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];
    let dataCols = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues()[0];
    let firstFormCol = formSheetData.getNextFreeColumn_();
    let firstDataCol = dataSheetData.getNextFreeColumn_();

    for (let i = firstDataCol; i < dataCols.length; i++) {
        let key = dataCols[i];
        dataSheetData.addColumnAt_(key, i);
    }
    Logger.log("TODO: Make handling of blank/undefined columns or keys more robust");
    for (let i = firstFormCol; i < formCols.length; i++) {            //          TODO Make this clearer and handle blank/undefined columns or keys
        let key = formCols[i];

        if (key == "") continue;
        formSheetData.addColumnAt_(key, i);

        try {
            let index = dataSheetData.getIndex(key);
        } catch (e) {

        }
        if (!dataSheetData.hasKey(key)) {
            dataSheetData.addColumnWithHeader_(key);
        }
    }


}



/**
 * @param {{ [x: string]: any; }} allSheetData
 */
function buildIndexToKey_(allSheetData) {
    for (let sdKey in allSheetData) {

        let sd = allSheetData[sdKey];

        sd.indexToKey = [];
        for (let key in sd.keyToIndex) {
            let i = sd.keyToIndex[key];

            if (typeof sd.indexToKey[i] != 'undefined')
                throw `Data collision on index ${i} while building indexToKey in SheetData '${sdKey}' - tried to add key '${key}' but found value '${sd.indexToKey[i]}'`;

            sd.indexToKey[i] = key;
        }


    }
}








/**
 * WIP - nonfunctional
 * @param {SheetData} sheetData
 */
function setSheetUp_(sheetData) {
    throw "UNIMPLEMENTED";
    // @ts-ignore
    let sheetName = sheetData.getTabName();
    let headers = sheetData.getHeaders();

    let ss = SpreadsheetApp.getActiveSpreadsheet();
    // @ts-ignore
    let ui = SpreadsheetApp.getUi();

    // Checks to see if the sheet exists or not.
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        Logger.log(`Sheet '${sheetName}' not found. Creating`);
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);     // Creating Header
    }

    return sheet;
}









/**
 * Get all defined instances of SheetData.
 * @readonly
 * @enum {SheetData}
 * @param {Boolean} force - If true, skips checking the cache and forces a recalculation. Default value is false.
 */
function constructSheetData(force = false) {

    //Check the cache for allSheetData
    let cache = CacheService.getDocumentCache();
    if (DBCONFIG.CACHE_SHEET_DATA && !force) {
        let allSheetData_JSON = cache.get('allSheetData');
        if (allSheetData_JSON != null) {
            Logger.log(`Pulling allSheetData from cache`);
            let allSheetData = JSON.parse(allSheetData_JSON);
            return allSheetData;
        }
    }



    /*    Static properties and parameters     */


    const KEY_FROM_HEADER = {     //NOT USED
        "Area Name": "areaName",
        "Status Log": "log",
        "hasContactData": "hasContactData",
        "Response Pulled": "responsePulled",
        "isDuplicate": "isDuplicate",
        "Form Timestamp": "formTimestamp",
        "Submission Email": "submissionEmail",
        "Area Email": "areaEmail",
        "Area ID": "areaID",
        "Sunday's Date": "kiDate",
        "NP": "np",
        "SA": "sa",
        "BD": "bd",
        "BC": "bc",
        "RCA": "rca",
        "RC": "rc",
        "CKI": "cki",
        "Service Hours": "serviceHrs",
        "Form Notes": "formNotes",
        "Date Contact Generated": "dateContactGenerated",
        "Name 1": "name1",
        "Position 1": "position1",
        "isTrainer 1": "isTrainer1",
        "Name 2": "name2",
        "Position 2": "position2",
        "isTrainer 2": "isTrainer2",
        "Name 3": "name3",
        "Position 3": "position3",
        "isTrainer 3": "isTrainer3",
        "District Leader": "districtLeader",
        "ZL1": "zoneLeader1",
        "ZL2": "zoneLeader2",
        "ZL3": "zoneLeader3",
        "STL1": "stl1",
        "STL2": "stl2",
        "STL3": "stl3",
        "STLT1": "stlt1",
        "STLT2": "stlt2",
        "STLT3": "stlt3",
        "AP1": "assistant1",
        "AP2": "assistant2",
        "AP3": "assistant3",
        "District": "district",
        "Zone": "zone",
        "unitString": "unitString",
        "hasMultipleUnits": "hasMultipleUnits",
        "languageString": "languageString",
        "isSeniorCouple": "isSeniorCouple",
        "isSisterArea": "isSisterArea",
        "hasVehicle": "hasVehicle",
        "Vehicle Miles": "vehicleMiles",
        "vinLast8": "vinLast8",
        "Apt Address": "aptAddress",
        "Form Comments": "formNotes",
        "Folder Name": "folderName",
        "Parent Folder": "parentFolder",
        "Folder": "folder",
        "sheetID1": "sheetID1",
        "sheetID2": "sheetID2",



    };






    const initialColumnOrders = {


        zoneFilesys: {
            "folderName": 0,
            "parentFolder": 1,
            "folder": 2,
            "sheetID1": 3,
            "sheetID2": 4,



        },
        distFilesys: {
            "folderName": 0,
            "parentFolder": 1,
            "folder": 2,
            "sheetID1": 3,
            "sheetID2": 4,



        },
        areaFilesys: {
            "folderName": 0,
            "parentFolder": 1,
            "folder": 2,
            "sheetID1": 3,
            "sheetID2": 4,



        },


        //FORM RESPONSE COLUMN ORDER 
        form: {
            "areaName": 0,
            "responsePulled": 1,
            "isDuplicate": 2,
            "formTimestamp": 3,
            "submissionEmail": 4,
            "kiDate": 5,
            "np": 6,
            "sa": 7,
            "bd": 8,
            "bc": 9,
            "rca": 10,
            "rc": 11,
            "cki": 12,
            "serviceHrs": 13,
            "formNotes": 14,
            //...additional form data (ex. baptism sources)
        },

        //CONTACT SHEET COLUMN ORDER
        contact: {
            "dateContactGenerated": 0,
            "areaEmail": 1,
            "areaName": 2,
            "name1": 3,
            "position1": 4,
            "isTrainer1": 5,
            "name2": 6,
            "position2": 7,
            "isTrainer2": 8,
            "name3": 9,
            "position3": 10,
            "isTrainer3": 11,
            "district": 12,
            "zone": 13,
            "unitString": 14,
            "hasMultipleUnits": 15,
            "languageString": 16,
            "isSeniorCouple": 17,
            "isSisterArea": 18,
            "hasVehicle": 19,
            "vehicleMiles": 20,
            "vinLast8": 21,
            "aptAddress": 22,
        },


        //DATA SHEET COLUMN ORDER
        data: {
            "areaName": 0,
            "log": 1,
            "areaEmail": 2,
            "isDuplicate": 3,
            "formTimestamp": 4,    //form data
            "areaID": 5,
            "kiDate": 6,    //form data


            "np": 7,    //form data
            "sa": 8,    //form data
            "bd": 9,    //form data
            "bc": 10,    //form data
            "rca": 11,    //form data
            "rc": 12,    //form data
            "cki": 13,    //form data
            "serviceHrs": 14,    //form data

            "name1": 15,
            "position1": 16,
            "isTrainer1": 17,
            "name2": 18,
            "position2": 19,
            "isTrainer2": 20,
            "name3": 21,
            "position3": 22,
            "isTrainer3": 23,

            "districtLeader": 24,
            "zoneLeader1": 25,
            "zoneLeader2": 26,
            "zoneLeader3": 27,
            "stl1": 28,
            "stl2": 29,
            "stl3": 30,
            "stlt1": 31,
            "stlt2": 32,
            "stlt3": 33,
            "assistant1": 34,
            "assistant2": 35,
            "assistant3": 36,

            "district": 37,
            "zone": 38,
            "unitString": 39,
            "hasMultipleUnits": 40,
            "languageString": 41,
            "isSeniorCouple": 42,
            "isSisterArea": 43,
            "hasVehicle": 44,
            "vehicleMiles": 45,
            "vinLast8": 46,
            "aptAddress": 47,
            "formNotes": 48,    //form data
            //...additional form data (ex. baptism sources)
        }

    };



    const tabNames = {
        form: "Form Responses",
        data: "Data",
        contact: "Contact Data",
        zoneFilesys: "Zone Filesys V3",
        distFilesys: "Dist Filesys V3",
        areaFilesys: "Area Filesys V3"
    };

    const headerRows = {
        form: 0,
        data: 0,
        contact: 0,
        zoneFilesys: 0,
        distFilesys: 0,
        areaFilesys: 0
    };

    //END Static properties and parameters


    //Define SheetData instances
    let allSheetData = {};
    for (let sdKey in tabNames) {
        allSheetData[sdKey] = new RawSheetData(tabNames[sdKey], headerRows[sdKey], initialColumnOrders[sdKey]);
        /** @example  allSheetData.data = new RawSheetData(tabNames.data, headerRows.data, initialColumnOrders.data) */
    }

    //@ts-expect-error
    refreshContacts(allSheetData);

    populateExtraColumnData_(allSheetData);
    //setSheetsUp_(allSheetData);

    //Object.freeze(allSheetData);

    let log = "Constructed SheetData objects: ";
    for (let sheet in tabNames)
        log += " '" + tabNames[sheet] + "'";
    Logger.log(log);

    if (DBCONFIG.CACHE_SHEET_DATA) {
        let allSheetData_JSON = JSON.stringify(allSheetData);
        cache.put('allSheetData', allSheetData_JSON, 1800); //cache expiration time set to half an hour
    }

    return allSheetData;
}








function testSheetData() {
    let allSheetData = constructSheetData();

    Logger.log("Data SheetData:");
    Logger.log(allSheetData.data);

    Logger.log("Headers:");
    Logger.log(allSheetData.data.getHeaders());
    // Logger.log(allSheetData.data.getHeaders());
    // Logger.log(allSheetData.data.getHeaders());
    // Logger.log(allSheetData.data.getHeaders());


    let data = allSheetData.contact.getData();
    allSheetData.data.insertData(data);



}



function clearAllSheetDataCache() {
    let cache = CacheService.getDocumentCache();
    cache.remove('allSheetData');
}
