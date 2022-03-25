# Backend Updates

The first part of this is a better way to log and monitor executions.  Ideally, this would be able to dump into a single sheet for everything, so that I can do stuff like A/B tests fully automatically.

Currently unimplemented, the idea here was originally to make a function that ran every minute, somehow stored its state, and then ran itself.  Due to time constraints, that isn't really feasible, *but* adding in some ``ScriptApp`` calls to add our own triggers via a easily defined structure is, and would make the process for other people trying to implement this a little easier.

## Basic Idea

There's a lot of moving parts in a full installation- from importing contacts to updating form submission options to making sure that forms are up to date, there's a lot of stuff that needs to happen behind the scenes to make every aspect of this fully automatic.

The idea behind this was to make a fairly simple central location (which would replace ``KIC-config.js``'s trigger call Booleans) where the schedule of, and the contents of trigger functions can be fairly easily modified and defined.  This will likely be via a JS object structure, potentially with a class involved to enforce said structure.  This will also likely somewhat replace ``triggers.js``, or at least incorporate the ideas from it.

[https://developers.google.com/apps-script/reference/script/trigger-builder](https://developers.google.com/apps-script/reference/script/trigger-builder)

### Pseudocode definition thingy

```ts
"UpdateDataSheet": {
    timeenabled: true,
    triggerType:"time-based",
    timeGranularity:time.minutes,
    frequency:5,
    functionName:"time_based_updateDataSheet"
},
"UpdateForms": {
    enabled: false,
    triggerType:"daily"
}

```

## Related Reading

[https://stackoverflow.com/questions/496961/call-a-javascript-function-name-using-a-string](https://stackoverflow.com/questions/496961/call-a-javascript-function-name-using-a-string)

## Class Design

### IN THE CLASS

[x] function dataLogger_startFunction_(functionName:,startTime = new Date())
[ ] function dataLogger_startChildFunction_(functionName,, startTime = new Date) // wont be using probably
[x] function dataLogger_setMainFunction_(functionName) // taken care of in constructor
[x] function dataLogger_endFunction_(functionName
[ ] function dataLogger_end_()
[x] function dataLogger_setTriggerType_(triggerType) // taken care of in constructor
[x] function dataLogger_addFailure_(functionName)

### USED BY THE CLASS

[ ] function getDataLogSheet_() {
[ ] function merge_in_metadata_(data, metadata) {
[ ] function resize_data_(in_data,header) {
[ ] function dataLogger_addFailure_(functionName) {
[ ] function time_a_function() {
