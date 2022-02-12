# Braindump

## Files

### areaIDManager.js

g

### markDuplicates.js

g

### missionOrgData.js

g

### sheetData.js

g

### updateDataSheet.js

g

### errorDetection.js

g

### accessControl.js

g

### kic-config.js

g

### kic-histroy.js

g

### kic-reference.js

g

### README.md

g

### scheduler.js

g

### triggers.js

g

### tsignore-gas-classes.js

g

### updateForm.js

g

## Other Pieces

### Using jsdoc

You need npm, so `sudo apt install npm` from a wsl terminal (windows was a nightmare) if you don't already have it. You might want to `npm update` and `npm upgrade` as well - I don't know the difference or really what they do, but it stopped yelling at me about package.json versions after I did. It might need to be a specific order as well, I dunno.

SVCode and GAS both natively parse jsdoc to give suggestions and for linting when editing the corresponding .js files. Generating external files containing the details is a bit more complex. The program is included in package.json, since I ran `npm install --save-dev jsdoc`, so it might install on its own somehow I think, I don't know how that works. For a global install use `npm install -g jsdoc`. Then the command to generate html files is `jsdoc -d=docs/jsdoc` (the documentation claims you don't need -d but it's lying). `-r` makes it include folders recursively.

Once it's generated you can run `_global_.html` to view it. It includes every documented function (except private ones I think). It's not pretty, not really organized or anything, and I couldn't get it to recognize classes. But it works.
