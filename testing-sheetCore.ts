let sheet1Config: sheetDataEntry = {
    use_iterant: true,
    tabName: 'TESTING_COLUMN_EDITOR',
    headerRow: 0,
    initialColumnOrder: {
        areaId: 0,
        isPulled: 1,
        isDuplicate: 2,
        randomNumber: 3,
        word:4
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

function addData() {
    let sheetClass = new SheetData(new RawSheetData(sheet1Config))
    sheetClass.setData(dataGenerator(6000))
}

function testEditBottom() {
    let sheetClass = new SheetData(new RawSheetData(sheet1Config))
    let itKey = sheetClass.iterantKey
    let dataClass = new kiDataClass(sheetClass.getData())

    dataClass.bulkAppendObject({word:"whee"})
    
    sheetClass.updateRows(dataClass.end)

}