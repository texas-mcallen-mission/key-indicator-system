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

SVCode and GAS both natively parse jsdoc to give suggestions and for linting when editing the corresponding .js files. Generating external files containing the details is a bit more complex. The program is included in package.json, since I ran `npm install --save-dev jsdoc`, so it should install on its own with npm I think, I'm not sure how that works. For a global install use `npm install -g jsdoc` in a WSL terminal (Windows was a NIGHTMARE). Then the command to generate html files is `jsdoc -d=docs/jsdoc` (the documentation claims you don't need -d but it's lying).
