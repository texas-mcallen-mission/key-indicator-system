// this is just full of the interfaces


interface contactEntry extends kiDataEntry {
    dateContactGenerated: string,
    areaEmail: string,
    areaName: string,
  
    name1: string,
    position1: string,
    isTrainer1: boolean,
  
    name2: string,
    position2: string,
    isTrainer2: boolean,
  
    name3: string,
    position3: string,
    isTrainer3: boolean,
  
    district: string,
    zone: string,
  
    unitString: string,
    hasMultipleUnits: boolean,
    languageString: string,
  
    isSeniorCouple: boolean,
    isSisterArea: boolean,
  
    hasVehicle?: boolean,
    vehicleMiles: string,
    vinLast8: string,
  
    aptAddress: string,
    areaId: string,
  }

  interface formsDataSheetLoForte extends kiDataEntry {
  
        areaName: string,
        responsePulled: boolean,
        isDuplicate: boolean,
        formTimestamp: string,
        submissionEmail: string,
        kiDate: string,
        np: number,
        sa: number,
        bd: number,
        bc: number,
        rca: number,
        rc: number,
        serviceHrs: number,
        cki: number,
    }


    