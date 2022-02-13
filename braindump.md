# Braindump

Everything I could think of that might be important for you to know that you might not already know

## areaIDManager.js

Contains functions that manage area IDs. This is what I had to rewrite to fix the McAllen 1A bug.

The loadAreaIDs() function pulls from the contact data sheet, calculates the area IDs for each of the area names it finds there, and stores them in the cache as an object keyed by area name.

The getAreaID() function takes an area name and returns the current area ID for that area name. It uses the data from loadAreaIDs, which uses the Contact Data sheet, so of course it only returns IDs based on current area names; using it on historical data (like I'm doing in markDuplicates - that should really be fixed) is unreliable.

## markDuplicates.js

Contains functions relating to deduping the data sheet. IT HAS NOT YET BEEN UPDATED TO USE SHEETDATA PROPERLY.

Important TODO: since loadAreaIDs() only checks the contact data sheet (it used to check all historical data as well), markDuplicates fails sometimes (only for individual rows) on unrecognized historical records, so it wraps each in a try/catch. That's because it calls getAreaID() on the area name of the row instead of checking the area ID column, which is really dumb in hindsight but I never got around to fixing (it shouldn't need any references to getAreaID).

### The Algorithm

Feel free to rewrite this entirely if you can find a better solution. It always felt a little inelegant. It can certainly use being split into multiple smaller functions rather than one big one.

The program first runs through the Data sheet (currently the entire thing I believe), bottom to top. It builds an object called mostRecentResponse that is keyed by "response ID" (which is just concat(areaID, "|", kiDate) for a given row. The idea is that rows have the same rID iff they are duplicates.) The value for a given rID is an object containing the form-submit timestamp, and the row index, of the most recent response with that rID. If it later finds a row with the same rID, it checks which is more recent, updates the object if needed with the newer one, and adds the older one's row index to a duplicates list. After the loop terminates, it marks all the rows in the duplicates list as dupes and the rest as not dupes.

Possible ways to improve:

- Don't run through the entire sheet, only recent entries (maybe add a getDataUpTo(maxRows) function or something like that to SheetData?)
- Ignore rows that are already marked as dupes (non-dupes can become dupes, but once a dupe, always a dupe)
- Run through the whole loop twice (that's what the unused firstPass bool is for) so that it works even if the rows are not in timestamp order (significantly slower? Not enough gain since it's almost completely sorted anyway?)

## missionOrgData.js

The functions are getMissionLeadershipData, getMissionOrgData, and getLeadershipAreaData. These are fairly complex for what they do.

getMissionLeadershipData() returns an object containing all the data about the mission leadership (of junior missionaries at least). It is organized in a hierarchy: mission-wide data -> zones in the mission -> a single zone's data -> districts in the zone -> a single district's data -> areas in the district. More details about the precise format are in the file. It includes area names, area emails, and missionary names of every junior missionary leader, as well as flags indicating if each zone has an STL area and whether an STLT area exists. It does not include every missionary or area email though, only the leaders. The algorithm is loop through each area (since that's how contacts is organized); initialize any relevant branches of the output object that might not have been initialized yet; loop through the companions (so three runs per area); switch/case by role; and if this companion is a leader, fill in the corresponding parts of the object.

getMissionOrgData() returns a simpler version of getMissionLeadershipData(). It contains only zones, districts in each zone, and areas in each district.

getLeadershipAreaData() calls getMissionLeadershipData() and reorganizes it into areaData format. See the entry below on updateSheetData.js for what that is.

Important note: getMissionOrgData() takes `allSheetData` as a parameter, but getMissionLeadershipData() and getLeadershipAreaData() both take `contacts` as a parameter, which is the object returned by getContactData() in updateDataSheet.js. The reason for this rather than all three taking allSheetData is the overhead of running getContactData() every time, but if that were cached it would be much faster, and all three could just take `allSheetData` as a parameter. (Or, if allSheetData is being cached, none of them would need any parameters, and could just call constructSheetData() at the beginning. Not much reason for that though other than to show off my epic caching skillz.)

## sheetData.js

Contains all the definitions and methods relating to the SheetData class. Most of the documentation is inside the file, but there are some things to note.

Now that all the mechanics are hidden inside a wrapper class, SheetData doesn't have to be an enum. That means you can run `new SheetData(params)` if you want to to create instances other than the predefined ones in `sheetData.js`. Just make sure you give it parameters in the right format. If you want to use the predefined ones though, you still probably want to use constructSheetData(), because in addition to constructing the objects, it does things like cache the values and sync columns between the Data and Form Responses sheet.

### Internals

SheetData uses key strings to identify columns in different sheets. Different sheets, same key string, same column, and e.g. inserting data will happen in the right column. By default, SheetData uses the values in the header row as the key strings (which means they can be in any column index as long as corresponding columns in different sheets have the same headers), but by supplying a keyToIndex object, the key strings can be hardcoded (which means the headers can be anything as long as the column are not reordered). If you want to use a column in external code, e.g. area name, it needs to be hardcoded in the code, so the key string and the index need to be hardcoded from the start. A future version might relax the requirement that header strings be exact by cleaning header values (toLowerCase(), remove whitespace, etc) before using them as key strings, and/or by implementing hardcoded header string options, almost like aliases (so "Name of Area" and "Area Name" headers would be recognized as referring to the key string "areaName"). That might not be necessary though.

### SheetData functions

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

## updateDataSheet.js

updateDataSheet
pullFormData
getContactData
mergeIntoMissionData
pushToDataSheetV2
pushErrorMessages

I have a convention/format all throughout dataFlow (that I should have turned into a class but never did) of using objects keyed by areaID instead of lists of areas. I called objects in that format "area data" objects.

## errorDetection.js

Not written yet. This might get decentralized throughout the various processes rather than being its own file.

## accessControl.js

g

## kic-config.js

Fairly obvious, just make sure everything is organized nicely and the naming conventions are consistent. Maybe organize it into settings that APs or MPs might touch and configs that only devs will mess with

## kic-history.js

Can probably be deleted

## kic-reference.js

Should probably be deleted

## README.md

Should include

## scheduler.js

g

## triggers.js

Fairly obvious, only thing to note is that it might be possible to replace the majority of the duplicated code with some kind of lambda thing (which would make it a lot less prone to typos).

## tsignore-gas-classes.js

Fairly obvious.

## updateForm.js

g

## Using jsdoc

SVCode and GAS both natively parse jsdoc to give suggestions and for linting when editing the corresponding .js files. Generating external files containing the details is a bit more complex. The program is included in package.json, since I ran `npm install --save-dev jsdoc`, so it might install on its own somehow I think, I don't know how that works. For a global install use `npm install -g jsdoc`. Then the command to generate html files is `jsdoc -d=docs/jsdoc` (the documentation claims you don't need -d but it's lying). `-r` makes it include folders recursively.

To do that though, you need npm, so `sudo apt install npm` from a wsl terminal (windows was a nightmare) if you don't already have it. You might want to `npm update` and `npm upgrade` as well - I don't know the difference or really what they do, but it stopped yelling at me about package.json versions after I did. It might need to be a specific order as well, I dunno.

Once it's generated you can run `_global_.html` to view it. It includes every documented function (except private ones I think). It's not pretty, not really organized or anything, and I couldn't get it to recognize classes. But it works.
