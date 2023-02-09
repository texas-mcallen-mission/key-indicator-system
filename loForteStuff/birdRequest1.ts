function runIt() {
    const kicConfig: sheetDataEntry = {
        tabName: "BirdReq1",
        headerRow: 0,
        initialColumnOrder: {
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
            "dateBoundries": 14,
        },
        includeSoftcodedColumns: false
    };

    const formDataSheet = new SheetData(new RawSheetData(sheetDataConfig.local.form));

    const birdDataSheet = new SheetData(new RawSheetData(kicConfig));
    const pajaroNumbers = formDataSheet.getData();

    birdDataSheet.setData(pajaroNumbers);

    const date = birdDataSheet.kiDate;

    const date1 = SpreadsheetApp.getActiveSpreadsheet().getDataRange().getValues();
    const date2 = SpreadsheetApp.getActiveSpreadsheet().getActiveCell().getValue();
        console.log(date1[1][1]);
    //isDate(date, date1[1][1], date2)

}

function isDate(date : string, date1: string, date2: string) : boolean {

    if(date1 <= date && date <= date2) return true


    
}