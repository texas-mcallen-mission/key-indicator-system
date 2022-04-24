/**
 * splits a kiDataCLass's data into little pieces by grouping by unique values on a specified key
 *
 * @param {kiDataClass} kiDataObj
 * @param {string} key
 * @return {*}  {manyKiDataClasses}
 */
function splitKiData(kiDataObj: kiDataClass, key:string):manyKiDataClasses{
    let kiData = kiDataObj.end
    let output: manyKiDataClasses = {}
    for (let entry of kiData) {
        if (output[entry[key]] == undefined) {
            output[entry[key]] = new kiDataClass([])
        }
        output[entry[key]].data.push(entry)
    }
    return output
}

interface manyKiDataClasses {
    [index:string]:kiDataClass
}

interface manyKiDataEntries {
    [index:number]:kiDataEntry
}

interface kiDataEntry {
    [index: string]: any;
}


class kiDataClass {
    constructor(kiData) {
        this.data = [];
        this.data = kiData;
    }

    get end(): manyKiDataEntries {
        return this.data;
    }

    // get data() {
    //     return this.data
    // }

    /**
     *  Adds a key named ``fb-ref-sum`` that sums up all the facebook referrals (currently hardcoded).
     *
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    sumFacebookReferrals():this {
        let output = [];
        let newKeyName = CONFIG.kiData.new_key_names.fb_referral_sum

        let fb_referral_keys = CONFIG.kiData.fb_referral_keys

        for (let entry of this.data) {
            // This was originally just a let sum = 0, sum += loop, but it meant that there were zeros going back further than fb-referrals were being tracked
            let sum: string|number = ""
            for (let key in fb_referral_keys) {
                if (typeof entry[key] == typeof 1)
                    if(typeof sum == 'string'){sum = 0}
                    sum += entry[key]
            }
            entry[newKeyName] = sum
            output.push(entry)

        }
        this.data = output

        return this
    }


    /**
     * Removes everything where the value of a specified key does not match values stored in an array of strings or a string.
     * Designed for the report generator, to get rid of kiData that it doesn't want.
     * @param {string} key
     * @param {string[])} match - array of strings to match against 
     * @return {*} 
     * @memberof kiDataClass
     */
    keepMatchingByKey(key: string, match: string[]) : this {
        let output = [];
        // let test = [];
        // if (typeof match == 'string') {
        //     test.push(match);
        // } else {
        //     test.push(...match);
        // }

        for (let entry of this.data) {
            if (match.includes(entry[key])){
                output.push(entry)
                // console.log("match")
            }
        }
        this.data = output
        return this;
    }

    /**
     * removes everything before a specified date.
     *
     * @param {*} date
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    removeBeforeDate(date: Date): this {
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
    /**
     * Calculates a short language string
     *  creates a key with the name ``truncLang`` of type string
     *  this attaches a truncated language based on the input it receives.
     *  data that was parsed with the newer version of languageParser is necessary for ASL areas
     *  used for the printed version of the TMM report to knock down cell width.
     *  if you want to add another language in the future, stick the language in the internal ``langLookup`` class.
     *  It should match what the language string from importContacts says as the key, and set the value to something recognizable.
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    addShortLang(): this {

        let output = [];
        let newKeyName = CONFIG.kiData.new_key_names.shortLang
        let langLookup = CONFIG.kiData.shortLanguageLookup
        for (let entry of this.data) {
            entry[newKeyName] = langLookup[entry.languageString];
            output.push(entry);
        }
        this.data = output;
        return this;
    }
    /**
     * Removes all entries where isDuplicate == true
     *
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    removeDuplicates(): this {
        let output = [];
        for (let entry of this.data) {
            if (!entry.isDuplicate) {
                output.push(entry);
            }
        }
        this.data = output;
        return this;
    }


    /**
     * this calculates retention rate (or leaves it blank, if there are zero recent converts)
     * creates a key with the name ``rrPercent`` of type float or doesn't create a key if there are no rc's in an area
     *
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    calculateRR(): this {


        let output = [];
        let newKeyName = CONFIG.kiData.new_key_names.retentionRate

        for (let entry of this.data) {

            if (entry.rc > 0) {
                entry[newKeyName] = entry.rca / entry.rc;
            }
            output.push(entry);
        }
        this.data = output;
        return this;
    }

    /**
     * Calculates a combined name string for use in places where you don't need to do further processing via names and want something that takes up less screen space.
     * Originally designed for the printable portion of the TMM report.
     * creates a key with the name ``combinedNames`` of type string
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    calculateCombinedName(): this {
        // this is a bit computationally expensive, you'll probably want to run this *after* you run scoping things
        // creates a key with the name ``combinedNames`` of type string
        let output = [];
        let newKeyName = CONFIG.kiData.new_key_names.combinedNames
        let missionaryKeys = CONFIG.kiData.combinedNameLookupKeys


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

    /**
     * Removes everything before the current week, starting late Saturday (getting the correct day programmatically was hard, okay?)
     * Uses removeBeforeDate under the hood.
     * @return {*}  {this}
     * @memberof kiDataClass
     */
    getThisWeeksData(): this {
        let sundayDate = getSundayOfCurrentWeek();
        let minMillis = sundayDate.getTime();

        return this.removeBeforeDate(sundayDate);
    }
}