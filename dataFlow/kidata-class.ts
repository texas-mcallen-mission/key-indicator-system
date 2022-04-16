
class kiDataClass {
    constructor(kiData) {
        this.data = [];
        this.data = kiData;
    }

    get end() {
        return this.data;
    }

    removeBeforeDate(date): this {
        let output = [];
        let minMillis = date.getTime();
        for (let entry of this.data) {
            let kiDate = new Date(entry.kiDate);
            let kiMilliseconds = kiDate.getTime();
            if (kiMilliseconds >= minMillis) {
                output.push(entry);

            }
        }
        console.log("in entries:", this.data.length, " out entries:", output.length);
        this.data = output;
        return this;
    }
    addShortLang(): this {
        // this attaches a truncated language based on the input it receives.
        // creates a key with the name ``truncLang`` of type string
        // data that was parsed with the newer version of languageParser is necessary for ASL areas

        // used for the printed version of the TMM report to knock down cell width.
        // if you want to add another language in the future, stick the language 
        // from importContacts in as the key, and the value for it as whatever you want.
        let output = [];
        let newKeyName = "truncLang";
        let langLookup = {
            "English": "Eng",
            "Spanish": "Spa",
            "Sign Language": "ASL",
            "English,English": "Eng",
            "Spanish,Spanish": "Spa"
        };
        for (let entry of this.data) {
            entry[newKeyName] = langLookup[entry.languageString];
            output.push(entry);
        }
        this.data = output;
        return this;
    }

    removeDuplicates(): this {
        // removes all entries where isDuplicate = true
        let output = [];
        for (let entry of this.data) {
            if (!entry.isDuplicate) {
                output.push(entry);
            }
        }
        this.data = output;
        return this;
    }
    calculateRR(): this {
        // this calculates retention rate (or leaves it blank, if there are zero recent converts)
        // creates a key with the name ``rrPercent`` of type float or doesn't create a key if there are no rc's in an area

        let output = [];
        let newKeyName = "rrPercent";

        for (let entry of this.data) {

            if (entry.rc > 0) {
                entry[newKeyName] = entry.rca / entry.rc;
            }
            output.push(entry);
        }
        this.data = output;
        return this;
    }

    calculateCombinedName(): this {
        // this is a bit computationally expensive, you'll probably want to run this *after* you run scoping things
        // creates a key with the name ``combinedNames`` of type string
        let output = [];
        let newKeyName = "combinedNames";
        let missionaryKeys = {
            m1: {
                name: "name1",
                pos: "position1",
                trainer: "isTrainer1"
            },
            m2: {
                name: "name2",
                pos: "position2",
                trainer: "isTrainer2"
            },
            m3: {
                name: "name3",
                pos: "position3",
                trainer: "isTrainer3"
            }
        };
        for (let entry of this.data) {
            let preOut = "";
            for (let missionary in missionaryKeys) {
                let missProps = missionaryKeys[missionary];
                if (entry[missProps.name] != "") {
                    let outString = entry[missProps.name] + " (" + entry[missProps.pos] + ") ";
                    // if (entry[missProps.trainer]) {
                    //     outString += "[TRAINER] "
                    // }
                    preOut += outString;
                }
            }
            entry[newKeyName] = preOut;
            output.push(entry);
        }
        this.data = output;
        return this;
    }
    getThisWeeksData(): this {
        let sundayDate = getSundayOfCurrentWeek();
        let minMillis = sundayDate.getTime();
        let output = [];
        for (let entry of this.data) {
            let kiDate = new Date(entry.kiDate);
            let kiMilliseconds = kiDate.getTime();
            if (kiMilliseconds >= minMillis) {
                output.push(entry);

            }
        }
        console.log("in entries:", this.data.length, " out entries:", output.length);
        this.data = output;
        return this;
    }
}
