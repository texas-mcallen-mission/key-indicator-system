let sheet1Config: sheetDataEntry = {
    use_iterant: true,
    tabName: 'TESTING_COLUMN_EDITOR',
    headerRow: 0,
    initialColumnOrder: {
        areaId: 0,
        isPulled: 1,
        isDuplicate: 2,
        randomNumber: 3,
        test1: 4,
        test2:5,
    },
    includeSoftcodedColumns: true
};

function dataGenerator(entries: number):kiDataEntry[] {
    let output: kiDataEntry[] = []
    
    for (let i = 0; i < entries; i++){
        let entry: kiDataEntry = {
            areaId: "A" + String(Math.floor(Math.random() * 10000)),
            randomNumber:Math.floor(Math.random()*10)
        }
        output.push(entry)
    }

    return output
}

function refreshTestData_(sheetClass:SheetData) {
    sheetClass.setData(dataGenerator(6000))
}

function testEditAll_(sheetClass:SheetData) {
    // let itKey = sheetClass.iterantKey
    let dataClass = new kiDataClass(sheetClass.getData())

    dataClass.bulkAppendObject({test1:"whee"})
    
    sheetClass.updateRows(dataClass.end)

}

function testEditBottom_(sheetClass: SheetData) {
    let itKey = sheetClass.iterantKey
    let dataClass = new kiDataClass(sheetClass.getData())
    let dataLength = dataClass.data.length
    dataClass.removeSmaller(itKey, dataLength - 2)
    dataClass.bulkAppendObject({test2:"bottomTwoEntriesOrSo"})
}

function bigTester() {
    let sheetClass = new SheetData(new RawSheetData(sheet1Config))
    refreshTestData_(sheetClass)
    testEditAll_(sheetClass);
    testEditBottom_(sheetClass)

}