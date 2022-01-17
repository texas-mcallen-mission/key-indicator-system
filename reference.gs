/*
        Reference.gs
        Column order, object data structures, property names
*/





/*

Data structure


The areaID is a string that uniquely identifies an area.
It is generated from the area email. For historical data with no recorded email, it is an arbitrary preset string.


missionData = [

  //form response 1
  {
    "metadata" : { //metadata about the response, as opposed to area data (includes areaID). These WILL NOT appear in the Data sheet unless specified to do so.
      "areaID" : "01234@missionary.org",
      "hasContactData" : TRUE,
      "dateContactImported" : "11/7/2021",
      ...
    },

    "areaData" : { //data about the area, as opposed to metadata (does not include areaID). These will all appear in the Data sheet.
      "areaName" : "B1A", "np" : 4, ...
    }

  },

  //form response 2
  {

  }...
]

missionData[3].areaData.areaName => "B1A"
missionData[3].metadata.hasContactData => true
missionData[3].metadata.areaID => "123456@missionary.org"



Additional data source structure (must follow this format for merging to work correctly)

contactData = {
  //area 1
  "A12345" : {
    "areaName" : "B1A",
    "district" : "B1",
    "languageString" : "English",
    ...
  },

  //area2
  "A54321" : {
    ...
  }
}

contactData["A12345"].district => "B1"





Other data sources must be structured the same as contactData to function with mergeIntoMissionData()
That is, keys are areaEmail strings, and values are objects containing area data









*/
