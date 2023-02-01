function demoBoi() {
    

    const allSheetData = constructSheetData()
    const contactSheet = allSheetData["contact"]

    let kiData = contactSheet.getData()
    const dataClass = new kiDataClass(kiData)
    const areaIDs = dataClass.getDataFromKey("areaID")
    
    const areaIDs2 = dataClass.getDataFromKey("areaID")
    areaIDs2.pop()
    for (let area of areaIDs) {
        if (!areaIDs2.includes(area)) {
            console.log(area)
        }
    }

}