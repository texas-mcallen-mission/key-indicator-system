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
     *  Expects a single data entry, and send it to the bottom of the target sheet.
     *  Useful in cases where you don't care as much about the order of entries as you do them not colliding with each other...
     *
     * @param {*} data
     * @param {*} {}
     * @return {*} 
     * @memberof SheetData
     */
    appendData(data: {}) {
        return this.rsd.appendDataRow(data)
    }
    directEdit(xOffset: number, yOffset: number, valueArray: any[][], writeInDataArea = false) {
        return this.rsd.directEditRawSheetValues(xOffset, yOffset, valueArray, writeInDataArea);
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
    constructor(tabName: string, headerRow: number, initialKeyToIndex: columnConfig, includeSoftcodedColumns: boolean, targetSheet: string | null = null, allowWrite: boolean = true) {
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
                console.error("This is going to break: sheet declaration failure for ", tabName, " with targetSheet: ", targetSheet);
            }
        }

        // this is essentially a be-all, end-all way to make sure that things get pushed to the right places
        this.tabName = tabName;
        this.headerRow = headerRow;
        this.keyToIndex = initialKeyToIndex;
        this.sheetId = targetSheetId;
        this.includeSoftcodedColumns = includeSoftcodedColumns;
        this.allowWrite = allowWrite;

        this.buildIndexToKey_();
        // TODO: Make this guy capable of making sheets if the workbook exists
        // TODO: This also means making a setHeader function of some sort.
        // here's the bit that I need to figure out how to change.
        // console.log(this.indexToKey)
        // console.log("Accessing the spreasheet")
        let targetSpreadsheet = SpreadsheetApp.openById(targetSheetId);
        this.sheet = targetSpreadsheet.getSheetByName(this.tabName);
        if (this.sheet == null) {
            console.warn("Creating Sheet on target spreadsheet!");
            SpreadsheetApp.flush(); // Because otherwise, we have problems
            this.sheet = targetSpreadsheet.insertSheet(this.tabName);
            // SpreadsheetApp.flush(); // This is also ***DUMB*** but I think it's necessary to avoid crashes.
            // to avoid these flushes causing you issues, make sure that your tabs already exist.
            // it appears that the second flush is not necessary to ensure stability, but if it becomes a problem, that's probably it.
            this.setHeaders([this.indexToKey]);
            // throw ("Couldn't construct SheetData: no sheet found with name '" + this.tabName + "'");
        }

        if (includeSoftcodedColumns == true) {
            this.addSoftColumns();
        }
    }


    //Private class methods


    /**
     *  !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *  Directly puts an array of values like so: [[val1,val2,...,valN],...[arrayn]] in a sheet.
     *  Checks to make sure that you're not going to overwrite data first, but also enables an override for that if you so desire.
     *
     * @param {number} xOffset - how far away from column A you want your things to be
     * @param {number} yOffset - how far away from row 1 you want your data to be.
     * @param {[][]} data
     * @param {boolean} [writeInDataArea=false]
     * @memberof RawSheetData
     */
    directEditRawSheetValues(xOffset: number, yOffset: number, valueArray: any[][], writeInDataArea = false) {
        if (yOffset + valueArray.length > this.getHeaderRow() && !writeInDataArea) {
            console.warn("Tried to write to protected row in sheet" + this.getTabName());
        } else {
            if (writeInDataArea) { console.warn("ignoring data protections"); }
            let range = this.getSheet().getRange(1 + xOffset, 1 + yOffset, valueArray.length, valueArray[0].length);
            range.setValues(valueArray);
        }


    }






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
    getHeaders(): string[] {
        // TODO: This might be a bad idea of a patch
        if (this.getSheet().getLastColumn() <= 0) return [];
        let range = this.getSheet().getRange(
            this.headerRow + 1,
            1,
            1,
            this.getSheet().getLastColumn()
        );
        return range.getValues()[0];
    }

    setHeaders(data) {
        if (this.allowWrite == false) {
            console.warn("tried to write to read-only sheet");
            return;
        }
        // let headerWidth = this.getSheet().getLastColumn()
        // if(data.length > headerWidth){headerWidth = data.length}
        let range = this.getSheet().getRange(
            this.headerRow + 1,
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
        if (this.allowWrite == false) {
            console.warn("tried to write to read-only sheet");
            return;
        }
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
        if (this.allowWrite == false) {
            console.warn("tried to write to read-only sheet");
            return;
        }
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

        // for (let key of skippedKeys)
        //     Logger.log(
        //         "Skipped key ${key} while pushing to sheet " +
        //         this.tabName +
        //         ". Sheet doesn't have that key"
        //     );

        if (Object.keys(skippedKeys).length > 0) {
            console.log("Skipped Keys:", skippedKeys, " while pushing to sheet", this.getTabName());
        }

        this.setValues(values);
    }

    /**
     *  Takes in a single data entry and puts it at the bottom of a spreadsheet.
     *  Expects a single line of data.
     *
     * @param {*} data
     * @return {*} 
     * @memberof RawSheetData
     */
    appendDataRow(data) {
        // if (data.length == 0) return;

        let values = [];
        let skippedKeys = new Set();
        let maxIndex = 0;

        // for (let rowData of data) {
        let arr = [];
        for (let key in data) {
            if (!this.hasKey(key)) {
                skippedKeys.add(key);
            } else {
                arr[this.getIndex(key)] = data[key];
                maxIndex = Math.max(maxIndex, this.getIndex(key));
            }
        }
        values.push(arr);
        // }


        // if (Object.keys(skippedKeys).length > 0) {
        //     console.info("Skipped keys on", this.getTabName(), ":", skippedKeys);
        // }


        this.appendRowValues(arr);
    }

    /**
     * !!WARNING!!
     * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
     *
     * Inserts rows of data into the Sheet. Takes an array of objects.
     * @param {Object[]} values The values to insert.
     */
    appendRowValues(values:any[]) {
        this.getSheet().appendRow(values);
        // range.setValues(values);
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
        // NOTE: this was getting a little verbose...
        // for (let key of skippedKeys)
        // Logger.log(
        //     "Skipped key " +
        //     key +
        //     " while pushing to sheet " +
        //     this.tabName +
        //     ". Sheet doesn't have that key"
        // );
        if (Object.keys(skippedKeys).length > 0) {
            console.info("Skipped keys on", this.getTabName(), ":", skippedKeys);
        }


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
    /**
 * !!WARNING!!
 * This is a direct call to RawSheetData - wrap it in a SheetData instance before using it!
 *
 * includes softcoded columns (IE ones not directly defined.)
 * This has a bit of danger with remote sheets:
 * 1. If this runs on a remote sheet that somebody has edit access to the header of, 
 * 2. A valid key gets set in the header, 
 * 3. You don't explicitly remove particular keys, you could potentially leak PII.
 * 
 * BE VERY CAREFUL about using softcoded columns on remote sheets. 
 */
    addSoftColumns() {
        let currentHeader = this.getHeaders();
        let currentKeys: string[] = this.getKeys();

        let addedFormKeys: string[] = [];
        if (currentHeader.length > currentKeys.length) {
            console.warn("Not all columns are hardcoded");
            let notInKeys = currentHeader.slice(currentKeys.length);
            Logger.log(notInKeys);
            for (let noKey of notInKeys) {
                if (noKey != null && noKey != "" && !CONFIG.dataFlow.formColumnsToExcludeFromDataSheet.includes(noKey) && !this.hasKey(noKey)) {
                    this.addColumnWithHeader_(noKey, noKey);
                    addedFormKeys.push(noKey);
                    // console.log("key", noKey);
                }
            }
            // Logger.log(addedFormKeys);
        }
        console.log("added keys to form", this.tabName, ": ", addedFormKeys.toString());
    }
}

/**
 * Gets the allSheetData object from the cache and returns it. Must have been cached using cacheAllSheetData(). Returns null if nothing is found in the cache.
 */
function getAllSheetDataFromCache(): manySheetDatas | null {
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
        // EASILYIDENTIFIABLESTRINGTOHUNTDOWN
        console.log(rawSheetDataLiteral);
        //Turn literal RawSheetData into a real RawSheetData
        let rawSheetData = new RawSheetData(
            rawSheetDataLiteral.tabName,
            rawSheetDataLiteral.headerRow,
            rawSheetDataLiteral.keyToIndex,
            rawSheetDataLiteral.includeSoftcodedColumns,
            rawSheetDataLiteral.sheetId,
            rawSheetDataLiteral.allowWrite,
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
 * If you want to have softcoded columns, you need to enable them in the config.
 * @param form form : sheetData class: the one you want to sync columns from
 * @param data : sheetData class: the one you want to sync columns to.
 */
function syncDataFlowCols_(form: SheetData, data: SheetData) {
    // this has been updated so that you can use any remote / not remote thing
    // let formSheetData = allSheetData.form;
    // let dataSheetData = allSheetData.data;



    let addedKeys = [];


    for (let key of form.getKeys()) {
        if (
            !CONFIG.dataFlow.formColumnsToExcludeFromDataSheet.includes(key) &&
            !data.hasKey(key)
        ) {
            let header = form.getHeaders()[form.getIndex(key)];
            data.rsd.addColumnWithHeader_(key, header);
            addedKeys.push(key);
        }
    }

    let addedStr =
        addedKeys.length == 0
            ? "No new columns in " + form.getTabName()
            : addedKeys.toString();
    console.log(
        "Added " +
        addedKeys.length +
        " column(s) to " +
        data.getTabName() +
        ": " +
        addedStr
    );
    console.log(data.getKeys().toString());
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
// function setSheetUp_(sheetData) {
//     throw "UNIMPLEMENTED";
//     // former ignore
//     // former ignore
//     let sheetName = sheetData.getTabName();
//     let headers = sheetData.getHeaders();

//     let ss = SpreadsheetApp.getActiveSpreadsheet();
//     // former ignore
//     // former ignore
//     let ui = SpreadsheetApp.getUi();

//     // Checks to see if the sheet exists or not.
//     let sheet = ss.getSheetByName(sheetName);
//     if (!sheet) {
//         Logger.log("Sheet '" + sheetName + "' not found. Creating");
//         sheet = ss.insertSheet(sheetName);
//         // former ignore
//         sheet.appendRow(headers); // Creating Header
//     }

//     return sheet;
// }

// /**
//  * Get all defined instances of SheetData.
//  *
//  * SheetData is basically a better version of Sheet. It provides greater access to the data in a sheet than the Sheet class does, given certain assumptions about the format of that Sheet. Functions in the Sheet class usually organize data by row, then by column index number; most SheetData functions organize data by row, then by column header string (or hardcoded key string). This preserves structure when reordering columns or moving data between Sheets as long as corresponding columns have identical headers.
//  * @see SheetData
//  * @readonly
//  * @enum {SheetData}
//  * @param {Boolean} force - If true, skips checking the cache and forces a recalculation. Default value is false.
//  */
function constructSheetData(force = false) {
    if (CONFIG.dataFlow.allSheetData_cacheEnabled && !force) {
        let allSheetData = getAllSheetDataFromCache();
        if (allSheetData != null) return allSheetData;
    }
    let allSheetData = constructSheetDataV2(sheetDataConfig.local);
    let preKey = allSheetData.data.getKeys();
    syncDataFlowCols_(allSheetData.form, allSheetData.data);
    let postKey = allSheetData.data.getKeys();
    Logger.log(preKey);
    Logger.log(postKey);
    return allSheetData;
}

function testConstructor() {
    let test = constructSheetData();
}

function clearAllSheetDataCache() {
    let cache = CacheService.getDocumentCache();
    // former ignore
    cache.remove("allSheetData");
}


function testCachingV2() {
    let allSheetData = constructSheetDataV2(sheetDataConfig.local);
    cacheAllSheetData(allSheetData);

    let allSheetData2 = getAllSheetDataFromCache();
    if (JSON.stringify(allSheetData) == JSON.stringify(allSheetData2)) {
        console.log("To and From Cache on local sheetData probably worked");
    }

    let remoteSheetData = constructSheetDataV2(sheetDataConfig.remote);
    cacheAllSheetData(remoteSheetData);
    let allSheetDataRemote = getAllSheetDataFromCache();
    if (JSON.stringify(remoteSheetData) == JSON.stringify(allSheetDataRemote)) {
        console.log("To and From Cache on remote sheetData probably worked");
    }
}