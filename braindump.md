# Braindump

## Files

### areaIDManager.js

g

### markDuplicates.js

g

### missionOrgData.js

g

### sheetData.js

Contains all the definitions and methods relating to the SheetData class. Most of the documentation is inside the file, but there are some things to note.

Now that all the mechanics are hidden inside a wrapper class, SheetData doesn't have to be an enum. It requires a quick change I never did (change SheetData's constructor function to take the same inputs as RawSheetData, so that `new RawSheetData` is only ever called internally), but it would mean you can run `new SheetData(params)` if you want to to create instances other than the predefined ones in `sheetData.js`. Just make sure you give it parameters in the right format. If you want to use the predefined ones though, you still probably want to use constructSheetData(), because in addition to constructing the objects, it does things like cache the values and sync columns between the Data and Form Responses sheet.

#### Internals

A SheetData only has a single variable, this.rsd, which contains the RawSheetData object. One of my //TODO

#### Public SheetData functions

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
