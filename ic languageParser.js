// IF THIS GOES GLOBAL, THIS WILL HAVE TO CHANGE!!!

function testLanguageParser(){
    let testString = "TEST (Spanish) WORDS,TEST ENGLISH WORDS"
    Logger.log(testString.split(","))
    Logger.log(languageParser(true,testString))
  }
  
  function languageParser(multipleUnits,unitString) {
  
    
    // noteData.UnitString.substring(noteData.UnitString.search(/\(\w*/))
    let defaultLanguage = "English"
    let spanishTestString = "Spanish"
    let spanishOutputString = "Spanish"
    let returnData = []
    if(multipleUnits==false){
      if(unitString.includes(spanishTestString)==true){ // this is going to get changed in the future to get rid of the silly spanish,spanish tags.
        returnData.push(spanishOutputString)
      } else {
        returnData.push(defaultLanguage)
      }
    } else{
      let unitStringSplit = unitString.split(",")
  
      for(let testString of unitStringSplit){
        if(testString.includes(spanishTestString)==true){
          returnData.push(spanishOutputString)
        } else{
          returnData.push(defaultLanguage)
        }  // 
      }
    }
    return{
      languages:returnData.toString()
    }
  }
  