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
        },
        includeSoftcodedColumns: false
    };
    
    const formDataSheet = new SheetData(new RawSheetData(sheetDataConfig.local.form));
    
    const birdDataSheet = new SheetData(new RawSheetData(sheetDataConfig.local.form));
    const pajaroNumbers = formDataSheet.getData();

    birdDataSheet.setData(pajaroNumbers);



}