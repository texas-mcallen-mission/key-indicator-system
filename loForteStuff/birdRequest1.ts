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
            dateBoundries: 14,
        },
        includeSoftcodedColumns: false
    };

    const object: kiDataEntry = {
        areaName: '',
        responsePulled: '',
        isDuplicate: false,
        formTimestamp: '',
        submissionEmail: '',
        kiDate: '',

        np: '',
        sa: '',
        bd: '',
        bc: '',
        rca: '',
        rc: '',
        
        serviceHrs: '',
        cki: '',
    }

    object.dateBoundries = isDate1();


    const formDataSheet = new SheetData(new RawSheetData(sheetDataConfig.local.form));

    const birdDataSheet = new SheetData(new RawSheetData(kicConfig));
    const pajaroNumbers = formDataSheet.getData();


    birdDataSheet.setData(pajaroNumbers);

    const birdData = {
        ...object,
        ...birdDataSheet,
    }





}


function isDate1(): boolean {
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const cell = ss.getDataRange();
    const cellValue = cell.getValues();

    //const date = SpreadsheetApp.getActiveSpreadsheet().getDataRange().getValues();
    //console.log(date[0][0]);
    const date1 = cellValue[1][0].toString();
    const date2 = cellValue[1][1].toString();
    const kicDate = "1/20/2024"

    if(dateCheck1(date1, date2, kicDate)) {
        return true;
    } else {
        return false;
    }

}


function dateCheck1(from: string, to: string, check: string): boolean {

    const fDate = Date.parse(from);
    const lDate = Date.parse(to);
    const cDate = Date.parse(check);

    if ((cDate <= lDate && cDate >= fDate)) {
        return true;
    }
    return false;
}