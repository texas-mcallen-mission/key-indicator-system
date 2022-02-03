// This is my first attempt at writing TypeScript, we'll see how it goes!



function loadDataTest(): null{
    let allSheetData = constructSheetData()
    let zoneSheetData = allSheetData.zoneSheetData

    let zoneData: any[] = zoneSheetData.getValues()
    
    Logger.log(zoneData)
    

    
}