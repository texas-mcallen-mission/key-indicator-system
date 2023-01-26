
// Elder LoForte: feel free to replace this with your updated definitions :)
interface contactDataEntryTemporary {
    dateContactGenerated: Date | string,
    areaEmail: string,
    areaName: string,
    name1: string,
    position1: string,
    isTrainer1: boolean,
    name2: string,
    position2: string,
    isTrainer2: boolean,
    name3?: string,
    position3?: string,
    isTrainer3?: boolean,
    district: string,
    zone: string,
    unitString: string,
    hasMultipleUnits: boolean,
    languageString: string,
    isSeniorCouple: boolean,
    isSisterArea: boolean,
    hasVehicle: boolean,
    vehicleMiles: number | string,
    vinLast8: string,
    aptAddress: string,
    areaID: string;
}

