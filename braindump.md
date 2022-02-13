# Braindump

## Files

### areaIDManager.js

Contains functions that manage area IDs. This is what I had to rewrite to fix the McAllen 1A bug.

The loadAreaIDs() function pulls from the contact data sheet, calculates the area IDs for each of the area names it finds there, and stores them in the cache as an object keyed by area name.

The getAreaID() function takes an area name and returns the current area ID for that area name. It uses the data from loadAreaIDs, which uses the Contact Data sheet, so of course it only returns IDs based on current area names; using it on historical data (like I'm doing in markDuplicates - that should really be fixed) is unreliable.

### markDuplicates.js

g

Potentially important note: since loadAreaIDs() only checks the contact data sheet, markDuplicates() fails sometimes for unrecognized historical records, so it wraps each in a try/catch. I believe only on areas not currently open, but it's probably worth double checking. That's because it just calls getAreaID() on the area name of the row, instead of just checking the area ID column, which is really dumb in hindsight but I never got around to fixing.

### missionOrgData.js

Fairly self-explanatory from the code as to how they work, but have some nuances. The functions are getMissionOrgData(), which takes allSheetData as a parameter; and getMissionLeadershipData() and getLeadershipAreaData(), which both take as a parameter the object returned by getContactData() (in updateDataSheet.js). getMissionLeadershipData() is the most general, and the other two are sort of subsets of it. I've considered implementing caching of getMissionOrgData()

getMissionLeadershipData() is kind of a simpler and differently organized version of getContactData. It returns an object containing all the data about the mission leadership (of junior missionaries at least). It is organized in a hierarchy of object properties: mission-wide data -> zones -> a single zone's data -> districts in that zone -> a single district's data -> areas in that district -> a single area's data. More details about the precise format are in the file. It includes area names, area emails, and missionary names of every junior missionary leader, as well as flags indicating if each zone has an STL area and whether an STLT area exists.

getLeadershipAreaData() returns a reorganized version of getMissionLeaderShipData().

### sheetData.js

Contains all the definitions and methods relating to the SheetData class. Most of the documentation is inside the file, but there are some things to note.

Now that all the mechanics are hidden inside a wrapper class, SheetData doesn't have to be an enum. That means you can run `new SheetData(params)` if you want to to create instances other than the predefined ones in `sheetData.js`. Just make sure you give it parameters in the right format. If you want to use the predefined ones though, you still probably want to use constructSheetData(), because in addition to constructing the objects, it does things like cache the values and sync columns between the Data and Form Responses sheet.

#### Internals

SheetData uses key strings to identify columns in different sheets. Different sheets, same key string, same column, and e.g. inserting data will happen in the right column. By default, SheetData uses the values in the header row as the key strings (which means they can be in any column index as long as corresponding columns in different sheets have the same headers), but by supplying a keyToIndex object, the key strings can be hardcoded (which means the headers can be anything as long as the column are not reordered). If you want to use a column in external code, e.g. area name, it needs to be hardcoded in the code, so the key string and the index need to be hardcoded from the start. A future version might relax the requirement that header strings be exact by cleaning header values (toLowerCase(), remove whitespace, etc) before using them as key strings, and/or by implementing hardcoded header string options, almost like aliases (so "Name of Area" and "Area Name" headers would be recognized as referring to the key string "areaName"). That might not be necessary though.

#### SheetData functions

Explore any you're not sure about.

- clearContent()
- getData()
- setData(data)
- getHeaders()
- getHeaderRow()
- getTabName()
- getIndex(key)
- getKey(index)
- getValues()
- setValues(values)
- hasIndex(index)
- hasKey(key)
- getKeys()
- getAllOfKey(key)
- getAllOfIndex(index)
- getSheet()
- insertData(data)
- insertValues(values)

### updateDataSheet.js

g

### errorDetection.js

Not written yet. This might get decentralized throughout the various processes rather than being its own file.

### accessControl.js

g

### kic-config.js

Fairly obvious, just make sure everything is organized nicely and the naming conventions are consistent. Maybe organize it into settings that APs or MPs might touch and configs that only devs will mess with

### kic-history.js

Can probably be deleted

### kic-reference.js

Should probably be deleted

### README.md

Should include

### scheduler.js

g

### triggers.js

Fairly obvious, only thing to note is that it might be possible to replace the majority of the duplicated code with some kind of lambda thing (which would make it a lot less prone to typos)

### tsignore-gas-classes.js

Fairly obvious

### updateForm.js

g

## Other Pieces

### Using jsdoc

You need npm, so `sudo apt install npm` from a wsl terminal (windows was a nightmare) if you don't already have it. You might want to `npm update` and `npm upgrade` as well - I don't know the difference or really what they do, but it stopped yelling at me about package.json versions after I did. It might need to be a specific order as well, I dunno.

SVCode and GAS both natively parse jsdoc to give suggestions and for linting when editing the corresponding .js files. Generating external files containing the details is a bit more complex. The program is included in package.json, since I ran `npm install --save-dev jsdoc`, so it might install on its own somehow I think, I don't know how that works. For a global install use `npm install -g jsdoc`. Then the command to generate html files is `jsdoc -d=docs/jsdoc` (the documentation claims you don't need -d but it's lying). `-r` makes it include folders recursively.

Once it's generated you can run `_global_.html` to view it. It includes every documented function (except private ones I think). It's not pretty, not really organized or anything, and I couldn't get it to recognize classes. But it works.
