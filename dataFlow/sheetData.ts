//@ts-check
/*
        SheetData
        Handles sheet setup, headers, column indices, pulling and pushing data, etc.
*/

/**
 * @classdesc SheetData is basically a better version of Sheet. It provides greater access to the data in a sheet than the Sheet class does, given certain assumptions about the format of that Sheet. Functions in the Sheet class usually organize data by row, then by column index number; most SheetData functions organize data by row, then by column header string (or hardcoded key string). This preserves structure when reordering columns or moving data between Sheets as long as corresponding columns have identical headers.
 *
 * When defined, hardcoded key strings can override using header values as key strings. This allows consistant functionality even when the header row changes, and lets methods access specific types of data using the key string without needing the column index for that data. Key strings are hardcoded by being passed through the initialKeyToIndex parameter. Any keys not hardcoded are calculated internally, using the column header as the key string. Columns with blank headers are ignored.
 *
 * For SheetData to work properly, there must be a single header row. Every nonblank row below the header row is assumed to contain data. Rows above the header row are ignored. Blank data rows (rows whose leftmost value is blank) are skipped, meaning not all SheetData functions preserve them.
 *
 * Technical note: all of the above functionality is implemented through the hidden RawSheetData class, with SheetData as a wrapper for it.
 *
 * @class
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
     * Returns an array of all the defined keys in this RawSheetData, ordered by column index. Undefined indices will have undefined values.
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

    /**
     * Sets the data in the Sheet, erasing data already there. Takes a 2D array.
     * @param {any[][]} values The values to insert.
     */
    setValues(values) {
        this.rsd.setValues(values);
    }

    /**
     * Inserts rows of data into the Sheet, formatted as an array of row objects.
     * @param {Object} data The data to insert.
     */
    setData(data) {
        this.rsd.setData(data);
    }
    /**
     * Returns the index, starting with 0, of the header row of this sheet.
     */
    setHeaders(data) {
        return this.rsd.setHeaders(data);
    }
}

/**
 * A RawSheetData instance. This should be wrapped in a SheetData before use.
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
    * @param {string} targetSheetId - sheet id, for connecting to external sheets.  If left empty, will default to the one returned by SpreadsheetApp.getActiveSpreadsheet() 
    */
    constructor(tabName, headerRow, initialKeyToIndex = {}, targetSheet: string|null = null) {
        let targetSheetId = "";
        
        // if the target sheet is accessible, set the thing.
        // if the target sheet is undefined, assume we're going to hit the ActiveSpreadsheet instead
        // if the target sheet is *not* undefined but is inaccessible, throw an error
        if (typeof targetSheet == undefined || targetSheet == "" || targetSheet == null) { // I *think* I covered my bases here
            console.info("Using local sheet");
            targetSheetId = SpreadsheetApp.getActiveSpreadsheet().getId();

        } else {
        if (isFileAccessible_(targetSheet)) {
            console.info("using external sheet id for", tabName);
            targetSheetId = targetSheet;
        } else {
                console.error("This is going to break: sheet declaration failure for ", tabName , " with targetSheet: ", targetSheet);
            }
        }

        // this is essentially a be-all, end-all way to make sure that things get pushed to the right places
        this.tabName = tabName;
        this.headerRow = headerRow;
        this.keyToIndex = initialKeyToIndex;

        this.buildIndexToKey_();
        // TODO: Make this guy capable of making sheets if the workbook exists
        // TODO: This also means making a setHeader function of some sort.
        // here's the bit that I need to figure out how to change.
        console.log(this.indexToKey)
        console.log("Accessing the spreasheet")
        let targetSpreadsheet = SpreadsheetApp.openById(targetSheetId);
        this.sheet = targetSpreadsheet.getSheetByName(this.tabName);
        if (this.sheet == null) {
            console.warn("Creating Sheet on target spreadsheet!")
            this.sheet = targetSpreadsheet.insertSheet(this.tabName)
            this.setHeaders([this.indexToKey])
            // throw ("Couldn't construct SheetData: no sheet found with name '" + this.tabName + "'");
        }
    }

    //Private class methods

    /*
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

    /*
     * Get the next blank column not assigned a key. It is NOT guaranteed to eventually return every blank column.
     * @returns The next column not assigned a key.
     */
    getNextFreeColumn_() {
        return this.indexToKey.length;
    }

    /*
     * @param {string} key
     * @param {string} header
     * @param {number} index
     */
    addColumnWithHeaderAt_(key, header, index) {
        if (key == "")
            throw new TypeError(
                "Couldn't add column to sheet " +
                this.getTabName() +
                ". Invalid key: " +
                key
            );
        if (header == "")
            throw new TypeError(
                "Couldn't add column to sheet " +
                this.getTabName() +
                ". Invalid header: " +
                header
            );
        if (index < 0)
            throw new TypeError(
                "Couldn't add column to sheet " +
                this.getTabName() +
                ". Invalid index: " +
                index
            );

        if (this.hasIndex(index))
            throw (
                "Potential data collision. Tried to add key '" +
                key +
                "' to index " +
                index +
                " in sheet " +
                this.getTabName() +
                ", but that index already has key '" +
                this.getKey(index) +
                "'"
            );
        if (this.hasKey(key))
            throw (
                "Potential data collision. Tried to add key '" +
                key +
                "' to index " +
                index +
                " in sheet " +
                this.getTabName() +
                ", but that key already exists at index " +
                this.getIndex(key)
            );

        this.getSheet()
            .getRange(this.getHeaderRow() + 1, index + 1)
            .setValue(header);

        this.keyToIndex[key] = index;

        this.indexToKey[index] = key;
    }

    /*
     * @param {any} key
     * @param {any} header
     */
    addColumnWithHeader_(key, header) {
        let index = this.getNextFreeColumn_();
        this.addColumnWithHeaderAt_(key, header, index);
    }

    /*
     * @param {any} key
     * @param {number} index
     */
    addColumnAt_(key, index) {
        let header = key; //TODO Add preset headers?
        this.addColumnWithHeaderAt_(key, header, index);
    }

    /*
     * @param {any} key
     */
    addColumn_(key) {
        let index = this.getNextFreeColumn_();
        this.addColumnAt_(key, index);
    }

    /*   Public class methods   */

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns the Sheet object for this RawSheetData.
     */
    getSheet() {
        return this.sheet;
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns the name of the Sheet for this RawSheetData.
     */
    getTabName() {
        return this.tabName;
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns the index, starting with 0, of the header row of this sheet.
     */
    getHeaderRow() {
        return this.headerRow;
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns the index for the column with the given key string.
     * @param {string} key
     */
    getIndex(key) {
        if (!this.hasKey(key))
            throw (
                "Failed to get index from key: key '" +
                key +
                "' not found in sheet '" +
                this.tabName +
                "'"
            );

        return this.keyToIndex[key];
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns the key string for the column with the given index.
     * @param {number} index
     */
    getKey(index) {
        if (!this.hasIndex(index))
            throw (
                "Couldn't get key from index: index '" +
                index +
                "' not defined in sheet '" +
                this.tabName +
                "'"
            );

        return this.indexToKey[index];
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns true if this RawSheetData object has a defined key attached to the given index.
     * @param {number} index
     */
    hasIndex(index) {
        if (typeof index == "undefined") throw "Tried to use undefined as an index";

        return typeof this.indexToKey[index] != "undefined";
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns true if this RawSheetData object has a defined value for the given key.
     * @param {string} key
     */
    hasKey(key) {
        if (typeof key == "undefined")
            throw "Tried to use undefined as a key string";
        return typeof this.keyToIndex[key] != "undefined";
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns the header row of this sheet.
     * @returns {string[]} The header row if this sheet.
     */
    getHeaders() {
        let range = this.getSheet().getRange(
            this.headerRow + 1,
            1,
            1,
            this.getSheet().getLastColumn()
        );
        return range.getValues()[0];
    }

    setHeaders(data) {
        // let headerWidth = this.getSheet().getLastColumn()
        // if(data.length > headerWidth){headerWidth = data.length}
        let range = this.getSheet().getRange(
            this.headerRow+1,
            1,
            data.length,
            data[0].length
        );
        range.setValues(data);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
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
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
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
                let key = this.indexToKey[i];
                rowObj[key] = row[i];
            }

            outValues.push(rowObj);
        }
        return outValues;
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Sets the data in the Sheet, erasing data already there. Takes a 2D array.
     * @param {any[][]} values The values to insert.
     */
    setValues(values) {
        if (values.length == 0) return;
        this.clearContent();
        let range = this.getSheet().getRange(
            this.headerRow + 2,
            1,
            values.length,
            values[0].length
        );
        range.setValues(values);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Inserts rows of data into the Sheet, formatted as an array of row objects.
     * @param {Object} data The data to insert.
     */
    setData(data) {
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
            if (typeof arr[maxIndex] == "undefined") arr[maxIndex] = "";

        for (let key of skippedKeys)
            Logger.log(
                "Skipped key ${key} while pushing to sheet " +
                this.tabName +
                ". Sheet doesn't have that key"
            );

        this.setValues(values);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Inserts rows of data into the Sheet. Takes a 2D array.
     * @param {any[][]} values The values to insert.
     */
    insertValues(values) {
        if (values.length == 0) return;
        this.getSheet().insertRowsBefore(this.headerRow + 2, values.length); //Insert rows BEFORE the row AFTER the header row, so it won't use header formatting
        let range = this.getSheet().getRange(
            this.headerRow + 2,
            1,
            values.length,
            values[0].length
        );
        range.setValues(values);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Sets the data in the Sheet, erasing data already there. Takes an array of row objects.
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
            if (typeof arr[maxIndex] == "undefined") arr[maxIndex] = "";

        for (let key of skippedKeys)
            Logger.log(
                "Skipped key " +
                key +
                " while pushing to sheet " +
                this.tabName +
                ". Sheet doesn't have that key"
            );

        this.insertValues(values);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Clears the content of this Sheet below the header row, leaving formatting intact.
     */
    clearContent() {
        let startRow = this.getHeaderRow() + 2;
        let numRows = this.getSheet().getLastRow() + 1 - startRow;
        if (numRows <= 0) return; //End if the sheet is already empty
        let numCols = this.getSheet().getLastColumn();
        this.getSheet().getRange(startRow, 1, numRows + 1, numCols).clearContent();
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns an array of all the defined keys in this RawSheetData, ordered by column index. Undefined indices will have undefined values.
     * @returns {string[]} An array of defined keys in this sheet.
     */
    getKeys() {
        let keyList = Object.keys(this.keyToIndex);
        let orderedKeyList = [];
        for (let key of keyList) {
            orderedKeyList[this.getIndex(key)] = key;
        }
        return orderedKeyList;
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Returns an array of all the values in the sheet for the given key.
     * @returns An array containing all values for the given key.
     * @param {string} key The key string.
     */
    getAllOfKey(key) {
        let index = this.keyToIndex[key];
        return this.getAllOfIndex(index);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
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

/**
 * Gets the allSheetData object from the cache and returns it. Must have been cached using cacheAllSheetData(). Returns null if nothing is found in the cache.
 */
function getAllSheetDataFromCache() {
    let cache = CacheService.getDocumentCache();
    let allSheetData_JSONString = cache.get(
        CONFIG.dataFlow.allSheetData_cacheKey
    );
    if (allSheetData_JSONString == null) {
        console.warn(
            "Tried to pull allSheetData from the cache but nothing was saved there."
        );
        return null;
    }

    console.log("Pulled allSheetData from cache, parsing now");
    let allSheetData_fromCache = JSON.parse(allSheetData_JSONString); //*Contains object literals representing SheetData objects. NOT members of the SheetData class yet!

    let allSheetData = {};
    let parsedObjects = [];
    //Dig down to find the rawSheetData, fix it, and build it back up properly.
    for (let sdKey in allSheetData_fromCache) {
        //Extract literal (aka fake) SheetData from cache's version of allSheetData
        let sheetDataLiteral = allSheetData_fromCache[sdKey];
        //Extract literal RawSheetData from literal SheetData
        let rawSheetDataLiteral = sheetDataLiteral.rsd;
        //Turn literal RawSheetData into a real RawSheetData
        let rawSheetData = new RawSheetData(
            rawSheetDataLiteral.tabName,
            rawSheetDataLiteral.headerRow,
            rawSheetDataLiteral.keyToIndex
        );
        //Re-wrap real RawSheetData in a real SheetData
        let sheetData = new SheetData(rawSheetData);
        //Re-add real SheetData to the proper version of allSheetData
        allSheetData[sdKey] = sheetData;
        parsedObjects.push(sheetData.getTabName()); //For logging purposes
    }

    if (parsedObjects.length == 0) {
        console.warn(
            "Unable to parse, no SheetData objects found. Cache had value: " +
            allSheetData_fromCache
        );
        return null;
    }
    console.info(
        "Parsed " + parsedObjects.length + " SheetData objects: " + parsedObjects
    );
    return allSheetData;
}

/**
 * Formats and stores the allSheetData object in the cache. Can be retrieved with getAllSheetDataFromCache().
 * @param {*} allSheetData
 */
function cacheAllSheetData(allSheetData) {
    // TODO: figure out how to cache remote sheets.
    Logger.log("Caching allSheetData");
    let cache = CacheService.getDocumentCache();
    // former ignore
    cache.put(
        CONFIG.dataFlow.allSheetData_cacheKey,
        JSON.stringify(allSheetData),
        CONFIG.dataFlow.allSheetData_cacheExpirationLimit
    );
}

//                The following are basically RawSheetData methods - they form an external constructor, treating RawSheetData like an Enum. They're only separate from the class because static variables don't work properly in Apps Script.
//                populateExtraColumnData()
//                sheetDataConstructor()

/**
 * Adds any missing keys that exist on form responses to data.
 * uses hardcoded things for the ones to sync.
 * For this to be enabled, I *think* the sheets might have to be on the same document (but I'm not sure.)
 * May need to be replaced or reworked to get this functional on an allsheetData'd
 * uses allSheetData.form, allSheetData.data
 * @param form form : sheetData class: the one you want to sync columns from
 * @param data : sheetData class: the one you want to sync columns to.
 */
function syncDataFlowCols_(allSheetData:manySheetDatas) {
    // this has been updated so that you can use any remote / not remote thing
    let formSheetData = allSheetData.form;
    let dataSheetData = allSheetData.data;

    let addedKeys = [];

    for (let key of formSheetData.getKeys()) {
        if (
            !CONFIG.dataFlow.formColumnsToExcludeFromDataSheet.includes(key) &&
            !dataSheetData.hasKey(key)
        ) {
            let header = formSheetData.getHeaders()[formSheetData.getIndex(key)];
            dataSheetData.rsd.addColumnWithHeader_(key, header);
            addedKeys.push(key);
        }
    }

    let addedStr =
        addedKeys.length == 0
            ? "No new columns in " + formSheetData.getTabName()
            : addedKeys.toString();
    console.log(
        "Added " +
        addedKeys.length +
        " column(s) to " +
        dataSheetData.getTabName() +
        ": " +
        addedStr
    );
}

/*
 * Populate this SheetData with column data from the Sheet.
 * @param {any} sheetData
 */
function populateExtraColumnData_(sheetData) {
    let headers = sheetData.getHeaders();
    for (let i = 0; i < headers.length; i++) {
        let key = headers[i];
        if (sheetData.hasIndex(i) || key == "") continue; //Skip already defined or blank columns
        sheetData.rsd.addColumnAt_(key, i); //Access RawSheetData to add column
    }
}

/*
 * @param {{ [x: string]: any; }} allSheetData
 */
function buildIndexToKey_(allSheetData) {
    for (let sdKey in allSheetData) {
        let sd = allSheetData[sdKey];

        sd.indexToKey = [];
        for (let key in sd.keyToIndex) {
            let i = sd.keyToIndex[key];

            if (typeof sd.indexToKey[i] != "undefined")
                throw (
                    "Data collision on index " +
                    i +
                    " while building indexToKey in SheetData '" +
                    sdKey +
                    "' - tried to add key '" +
                    key +
                    "' but found value '" +
                    sd.indexToKey[i] +
                    "'"
                );

            sd.indexToKey[i] = key;
        }
    }
}

/*
 * WIP - nonfunctional
 * @param {SheetData} sheetData
 */
function setSheetUp_(sheetData) {
    throw "UNIMPLEMENTED";
    // former ignore
    // former ignore
    let sheetName = sheetData.getTabName();
    let headers = sheetData.getHeaders();

    let ss = SpreadsheetApp.getActiveSpreadsheet();
    // former ignore
    // former ignore
    let ui = SpreadsheetApp.getUi();

    // Checks to see if the sheet exists or not.
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        Logger.log("Sheet '" + sheetName + "' not found. Creating");
        sheet = ss.insertSheet(sheetName);
        // former ignore
        sheet.appendRow(headers); // Creating Header
    }

    return sheet;
}

/**
 * Get all defined instances of SheetData.
 *
 * SheetData is basically a better version of Sheet. It provides greater access to the data in a sheet than the Sheet class does, given certain assumptions about the format of that Sheet. Functions in the Sheet class usually organize data by row, then by column index number; most SheetData functions organize data by row, then by column header string (or hardcoded key string). This preserves structure when reordering columns or moving data between Sheets as long as corresponding columns have identical headers.
 * @see SheetData
 * @readonly
 * @enum {SheetData}
 * @param {Boolean} force - If true, skips checking the cache and forces a recalculation. Default value is false.
 */
function constructSheetData(force = false) {


    //Check the cache for allSheetData
    if (CONFIG.dataFlow.allSheetData_cacheEnabled && !force) {
        let allSheetData = getAllSheetDataFromCache();
        if (allSheetData != null) return allSheetData;
    }



    /*    Static properties and parameters     */


    const initialColumnOrders = {


        //FORM RESPONSE COLUMN ORDER
        form: {
            areaName: 0,
            responsePulled: 1,
            isDuplicate: 2,
            formTimestamp: 3,
            submissionEmail: 4,
            kiDate: 5,
            np: 6,
            sa: 7,
            bd: 8,
            bc: 9,
            rca: 10,
            rc: 11,
            serviceHrs: 12,
            cki: 13,
            // "formNotes": 14,
            // ...additional form data (ex. baptism sources)
        },

        // CONTACT SHEET COLUMN ORDER
        contact: {
            dateContactGenerated: 0,
            areaEmail: 1,
            areaName: 2,
            name1: 3,
            position1: 4,
            isTrainer1: 5,
            name2: 6,
            position2: 7,
            isTrainer2: 8,
            name3: 9,
            position3: 10,
            isTrainer3: 11,
            district: 12,
            zone: 13,
            unitString: 14,
            hasMultipleUnits: 15,
            languageString: 16,
            isSeniorCouple: 17,
            isSisterArea: 18,
            hasVehicle: 19,
            vehicleMiles: 20,
            vinLast8: 21,
            aptAddress: 22,
        },

        //DATA SHEET COLUMN ORDER
        data: {
            areaName: 0,
            log: 1,
            areaEmail: 2,
            isDuplicate: 3,
            formTimestamp: 4, //form data
            areaID: 5,
            kiDate: 6, //form data

            np: 7, //form data
            sa: 8, //form data
            bd: 9, //form data
            bc: 10, //form data
            rca: 11, //form data
            rc: 12, //form data
            serviceHrs: 14, //form data

            name1: 15,
            position1: 16,
            isTrainer1: 17,
            name2: 18,
            position2: 19,
            isTrainer2: 20,
            name3: 21,
            position3: 22,
            isTrainer3: 23, // hello, update!

            cki: 13, //form data
            // super confused
            districtLeader: 24,
            zoneLeader1: 25,
            zoneLeader2: 26,
            zoneLeader3: 27,
            stl1: 28,
            stl2: 29,
            stl3: 30,
            stlt1: 31,
            stlt2: 32,
            stlt3: 33,
            assistant1: 34,
            assistant2: 35,
            assistant3: 36,

            district: 37,
            zone: 38,
            unitString: 39,
            hasMultipleUnits: 40,
            languageString: 41,
            isSeniorCouple: 42,
            isSisterArea: 43,
            hasVehicle: 44,
            vehicleMiles: 45,
            vinLast8: 46,
            aptAddress: 47,

            "bap-self-ref": 48,
            "bap-street": 49,
            "bap-ward-activity-or-event": 50,
            "bap-ref-recent-convert": 51,
            "bap-ref-part-member": 52,
            "bap-ref-other-member": 53,
            "bap-ref-teaching-pool": 54,
            "bap-ref-other-non-member": 55,
            "bap-fb-mission": 56,
            "bap-fb-personal": 57,
            "bap-family-history": 58,
            "bap-taught-prev": 59,
            "fb-role": 60,
            "fb-ref-ysa": 61,
            "fb-ref-asl": 62,
            "fb-ref-service": 63,
            "fb-ref-laredo-spa": 64,
            "fb-ref-laredo-eng": 65,
            "fb-ref-rgv-spa": 66,
            "fb-ref-rgv-eng": 67,
            "fb-ref-corpus": 68,
            // "formNotes": 48,    //form data
            //...additional form data (ex. baptism sources)
        },
        localData: {
            areaName: 0,
            log: 1,
            areaEmail: 2,
            isDuplicate: 3,
            formTimestamp: 4, //form data
            areaID: 5,
            kiDate: 6, //form data

            np: 7, //form data
            sa: 8, //form data
            bd: 9, //form data
            bc: 10, //form data
            rca: 11, //form data
            rc: 12, //form data
            cki: 13, //form data
            serviceHrs: 14, //form data

            name1: 15,
            position1: 16,
            isTrainer1: 17,
            name2: 18,
            position2: 19,
            isTrainer2: 20,
            name3: 21,
            position3: 22,
            isTrainer3: 23, // hello, update!

            // super confused
            districtLeader: 24,
            zoneLeader1: 25,
            zoneLeader2: 26,
            zoneLeader3: 27,
            stl1: 28,
            stl2: 29,
            stl3: 30,
            stlt1: 31,
            stlt2: 32,
            stlt3: 33,
            assistant1: 34,
            assistant2: 35,
            assistant3: 36,

            district: 37,
            zone: 38,
            unitString: 39,
            hasMultipleUnits: 40,
            languageString: 41,
            isSeniorCouple: 42,
            isSisterArea: 43,
            hasVehicle: 44,
            vehicleMiles: 45,
            vinLast8: 46,
            aptAddress: 47,
            // "formNotes": 48,    //form data
            //...additional form data (ex. baptism sources)
            "bap-self-ref": 48,
            "bap-street": 49,
            "bap-ward-activity-or-event": 50,
            "bap-ref-recent-convert": 51,
            "bap-ref-part-member": 52,
            "bap-ref-other-member": 53,
            "bap-ref-teaching-pool": 54,
            "bap-ref-other-non-member": 55,
            "bap-fb-mission": 56,
            "bap-fb-personal": 57,
            "bap-family-history": 58,
            "bap-taught-prev": 59,
            "fb-role": 60,
            "fb-ref-ysa": 61,
            "fb-ref-asl": 62,
            "fb-ref-service": 63,
            "fb-ref-laredo-spa": 64,
            "fb-ref-laredo-eng": 65,
            "fb-ref-rgv-spa": 66,
            "fb-ref-rgv-eng": 67,
            "fb-ref-corpus": 68,
        },
        debug: {
            functionName: 0,
            baseFunction: 1,
            triggerType: 2,
            timeStarted: 3,
            timeEnded: 4,
            commit_sha: 5,
            action_event_name: 6,
            github_actor: 7,
            job_id: 8,
            github_repository: 9,
            github_branch_ref: 10,
            executionCounter: 11,
            cycleEndMillis: 12,
            duration: 13,
            cycleStartMillis: 14,
            failures: 15
        },
        tmmReport: {
            areaName: 0,
            district: 1,
            zone: 2,
            np: 3,
            sa: 4,
            bd: 5,
            bc: 6,
            rrPercent: 7,
            serviceHrs: 8,
            cki: 9,
            hasVehicle: 10,
            truncLang: 11,
            combinedNames: 12,
        },
        serviceRep: {
            areaName: 0,
            areaID: 1,
            district: 2,
            zone: 3,
            combinedNames: 4,
            kiDate: 5,
            serviceHrs: 6,
        },
        fbReferrals: {
            areaName: 0,
            areaID: 1,
            district: 2,
            zone: 3,
            combinedNames: 4,
            kiDate: 5,
            "fb-role": 6,
            "fb-ref-ysa": 7,
            "fb-ref-asl": 8,
            "fb-ref-service": 9,
            "fb-ref-laredo-spa": 10,
            "fb-ref-laredo-eng": 11,
            "fb-ref-rgv-spa": 12,
            "fb-ref-rgv-eng": 13,
            "fb-ref-corpus": 14,
        },
    };



    const tabNames = {
        form: "Form Responses",
        contact: "Contact Data",
        data: "Data",
        debug: "DEBUG SHEET",
        localData: "Data-TEST",
        tmmReport: "TMM Report Printable",
        serviceRep: "All Data",
        fbReferrals: "techSquad Data",


    };

    const headerRows = {
        contact: 0,
        data: 0,
        debug: 0,
        form:0,
        localData: 1,
        tmmReport: 9,
        serviceRep: 2,
        fbReferrals: 1,

    };

    const targetSpreadsheet = {
        form: CONFIG.dataFlow.sheetTargets.form,
        data: CONFIG.dataFlow.sheetTargets.data,
        contact: CONFIG.dataFlow.sheetTargets.contact,
        debug: CONFIG.dataFlow.sheetTargets.debug,
        localData: CONFIG.dataFlow.sheetTargets.localData,
        tmmReport: CONFIG.dataFlow.sheetTargets.tmmReport,
        serviceRep: CONFIG.dataFlow.sheetTargets.serviceRep,
        fbReferrals: CONFIG.dataFlow.sheetTargets.fbReferrals
    };


    //END Static properties and parameters

    let log = "Constructed SheetData objects: ";

    //Define SheetData instances
    let allSheetData = {};
    for (let sdKey in tabNames) {
        let rawSheetData = new RawSheetData(tabNames[sdKey], headerRows[sdKey], initialColumnOrders[sdKey], targetSpreadsheet[sdKey]);
        let sheetData = new SheetData(rawSheetData);
        // TODO THIS IS CURRENTLY DISABLED
        // honestly might be *useful* to leave it off, because then I can just leave out things ezpz
        // populateExtraColumnData_(sheetData);    //Add non-hardcoded key strings

        allSheetData[sdKey] = sheetData;
        log += " '" + sheetData.getTabName() + "'";
    }
    console.log(log);

    //    refreshContacts(allSheetData);
    // TODO TEST
    // // TODO THIS IS CURRENTLY DISABLED
    // TESTING WHOOOOOOOOO
    syncDataFlowCols_(allSheetData/*.data,allSheetData.form*/);
    // I can't actually test this on here, I'll have to wait until I get this class pushed to a BERT-INSTANCE
    
    // this isn't implemented.
    //setSheetsUp_(allSheetData);

    //?   Object.freeze(allSheetData);


    if (CONFIG.dataFlow.allSheetData_cacheEnabled) cacheAllSheetData(allSheetData);

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
    // former ignore
    cache.remove("allSheetData");
}
