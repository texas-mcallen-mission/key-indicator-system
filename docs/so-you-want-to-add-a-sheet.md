# So You Want to manage a new sheet with sheetData

## Step 1:  Preparation

Figure out what values you'll want to store, what order you want them in, and write down good, easily understandable key names.

## Step 2: Extending sheetData

there are three things that need to be updated:

### ``initialColumnOrders``

Here's where you hard-code columns to key names:

```js
form: {
    areaName: 0,
    responsePulled: 1,
    isDuplicate: 2,
    formTimestamp: 3,
    submissionEmail: 4,
    kiDate: 5,
    //and more
},
debug: {
    functionName : 0,
    baseFunction : 1,
    triggerType : 2,
    timeStarted : 3
},
<NAME>: {
    column0: 0
}
```

*Note: You __MUST__ have a column in position 0, otherwise you will have weird problems.*

### ``tabNames``

This defines the name of the sheet used for a particular class

Example:

```js
const tabNames = {
    form: "Form Responses",
    debug: "DEBUG SHEET",
    <NAME>:"This is the sheet I added"
}
```

### ``headerRows``

This defines the number of rows from the top of the sheet that data will start.  Zero-Indexed.
Offsetting is useful for doing things like building column-lookup function doodads and stuff like that for more advanced Google Sheet-based work with queries and stuff.

Example:

```js
const headerRows = {
    form: 0,
    debug:0,
    <NAME>:0
}
```

## What You Need to Do

1. Add your sheet and key definitions to ``initialColumnOrders``
2. Take the name of the sheet and add it to ``tabNames``
3. Set the offset in ``headerRows``

You need to make your naming consistent across all three places, as constructSheetData requires it in order to associate everything correctly.

Provided you've added your stuff correctly, you should be able to access the values stored in your sheet in array-of-object form by running the following:

```js
let allSheetData = constructSheetData()
let <NAME>Sheet = allSheetData.<NAME>
let data = <NAME>Sheet.getValues()
console.log(data)
```
