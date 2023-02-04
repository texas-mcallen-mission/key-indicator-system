function kiDataLoaderDemoThingy() {
    const kicConfig: sheetDataEntry = {
        tabName: 'kiData',
        headerRow: 7,
        initialColumnOrder: {
            areaID: 0,
            ki1: 1,
            ki2: 2,
            ki3: 3,
            "pulled?": 4,
            "extraKey":5,
        },
        includeSoftcodedColumns: false,
    };

    const rawSheet = new RawSheetData(kicConfig)
    const kiDataSheet = new SheetData(rawSheet)

    const startingData = kiDataSheet.getData()
    const extraDataArray:kiDataEntry[] = []
    for (let i = 0; i < 15; i++){
        const data = {
            areaID: "A"+Math.floor(Math.random() * 10000),
            ki1: Math.floor(Math.random() * 4),
            ki2: Math.floor(Math.random() * 2),
            ki3: Math.floor(Math.random() * 7),
            ki4: Math.floor(Math.random() * i),
        }
        extraDataArray.push(data)
    }
    kiDataSheet.insertData(extraDataArray)
    console.log(String(startingData.length), kiDataSheet.getData().length)
    
    const dataClass = new kiDataClass(kiDataSheet.getData())
    dataClass.addIterant("positionKey",1)
    const areas = dataClass.getDataFromKey("areaID")
    const targetArea = "A6929"
    if (areas.includes(targetArea)) {
        let position = areas.indexOf(targetArea)
        kiDataSheet.directModify(position+1, {"pulled?":true,"extraKey":"CHICKEN NUGGET"})
        dataClass.data = kiDataSheet.getData();

    }
    const preLength = dataClass.data.length
    dataClass.removeSmaller("ki1", 5);
    console.log(String(preLength),dataClass.data.length);
}