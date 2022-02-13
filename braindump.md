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

Contains all of the main dataFlow functions except refreshContacts and getLeadershipAreaData.

The biggest things to know are about object formatting, and the first is areaData. I have a convention/object format all throughout dataFlow (that I should have turned into a class but never did) which I called areaData. It's basically just an object returned by sheetData.getData(), but reformatted slightly. getData() returns a list of area objects - in other words, an object keyed by index number, whose values are area objects. In areaData format, it's instead an object keyed by area ID, whose values are those same area objects. (The area objects still include areaID as a property, which might seem redundant, but it makes things nicer.) That format makes it easy to combine these area objects.

The second is missionData. It's a single variable, which I intended to be the storage container for all the various areaData objects - they would each get merged into missionData until it contained everything I needed. I didn't know it at the time, since SheetData hadn't been written yet (this is bien old code), but it's exactly the same format as an object returned by getData().

In effect: Each of the "getFromSomeSheet" functions calls getData() on the sheet, reformats it into areaData format so it's easier to manipulate, maybe adds a few calculated fields, and returns the result. Then mergeIntoMissionData() takes it and merges it into the previous missionData, lining up by ID and adding anything new, changing it back into SheetData format along the way. Finally, since it's already in the right format, I just call insertData(missionData). Which by the way replaced an entire pushIntoDataSheet() function, originally as long as any of the others are, with not just a single line of code, but a single function call.

So yeah. I'm pretty sure someone who's a lot smarter than I am has been helping us along.

### Main dataFlow Functions

- updateDataSheet - The main, overarching function. This calls all the others.
- pullFormData - Converts Form Response sheet data into areaData format, then into missionData format, giving our inital value of missionData.
- refreshContacts - see importContacts.js
- getContactData - Converts Contact Data sheet data into areaData format.
- getLeadershipAreaData - Converts Contact Data sheet data into areaData format. See missionOrgData.js
- mergeIntoMissionData - Takes missionData and an object in areaData format and combines them, returning the new missionData. Any properties in either parameter will be present in the output. In the case of differing values for the same key in the same area, an error is thrown.
- pushErrorMessages - Unimplemented. Probably deprecated anyway in favor of scheduler.js, but not sure yet.

## errorDetection.js

Not written yet. This might get decentralized throughout the various processes rather than being its own file.

## accessControl.js

The main function here is shareFileSystem(). It uses getMissionLeadershipData() to figure out zone/dist/area structure as well as identify who needs access to what and what their emails are. The internal getFolders() function basically calls getData() on a zoneFilesys SheetData and keys the rows by name rather than index number. Then it calls a massive nested for-loop that can probably shrink to a third its size.*

Most of the complexity is not fundamental to the algorithm, it's just manipulating variables. It's actually pretty simple internally. One thing to note though is that as I go down in scope, I'm building a list for each scope (including one that's mission-wide) that everything lower down should be shared with. For each folder, I remove any editors that aren't in at least one of those lists, then add back all the ones for the current scope, since I've already shared the higher ones.

One thing to note is all the commented-out code inside the for loops. That's the part that updates the page protections within the sheets themselves, not just the folder sharing. (They're commented out, but there's also a config option that skips them.) It is INSANELY slow to run, and the sheets should inherit protections from the templates anyway, but I didn't want to delete it in case you want to pull it into its own function. Another important note is that there's no automated updating of protections on the templates, for when office emails or the AP area changes. Those are changes that happen rarely enough that I doubt anyone will remember that they need to update the templates, and the APs will wonder why they can't see everything. So it might be worth adapting the commented-out code to do that automatically - it should be quick on only three sheets.

*The problem is that right on the inside of the duplicate code, there's a couple lines of code that's just slightly different on each level, meaning you can't just have one function run three times. However, you can if you use lambdas (aka anonymous functions) or if you just define three mini-functions next to your big one, and have your big one just pick which one to call based on the scope.

## kic-config.js

Fairly obvious, just make sure everything is organized nicely and the naming conventions are consistent. Maybe separate settings (things that APs or MPs might want to touch) and configs (which only devs will ever mess with).

## kic-history.js

Can probably be deleted

## kic-reference.js

Can probably be deleted. The most important info it contains is the formatting of a couple different objects, so that should be put elsewhere in the code first, probably just at the top of updateDataSheet.js is fine.

## README.md

Fairly obvious. Not sure if it should be aimed at devs or Mission Presidents.

## scheduler.js

g

## triggers.js

Fairly obvious, only thing to note is that it might be possible to replace the majority of the duplicated code with some kind of lambda thing, which would make it a lot less prone to typos - that's a problem I've had a couple of times when adding triggers or updating to config v2.

## tsignore-gas-classes.js

Fairly obvious.

## updateForm.js

g

## Side Note: Using jsdoc

You've asked me several times for markdown documentation, but I just can't. The info would be useless for Mission Presidents or APs, and it takes way too much time to go into enough detail for the devs. What JSDoc does is give the most important framework, which I think is enough for anyone like you or me to start having a play and figuring out the rest, and it takes almost no time to write. VSCode and GAS both natively parse jsdoc for auto-suggestions and linting when editing .js files. However, you wanted external files containing the details, which is a bit more complex, but here's what I found.

You need npm to install the program, so if you don't already have it, run `sudo apt install npm` from a wsl terminal. (Trying to get jsdoc to work on Windows was a nightmare.) You might want to `npm update` and `npm upgrade` (possibly in the reverse order) as well - I don't know the difference or really what they do, but it stopped yelling at me about package.json versions after I did, so I guess it worked.

The program for generating HTML files from JSDoc is included in package.json, since I ran `npm install --save-dev jsdoc`, so it might install on its own somehow I think. I don't know how that works. For a global install use `npm install -g jsdoc`. (There's another for local installation w/o adding it to package.json.) Then the command to generate html files is `jsdoc -d=docs/jsdoc`. `-r` makes it include folders recursively. (The documentation claims it defaults to -d=out and you don't need -d but it's lying.)

Once it's generated you can run `_global_.html` to view it. It includes every documented function (except private ones I think). It's not pretty, not really organized or anything, and I couldn't get it to recognize classes. But it works.
