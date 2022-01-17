function parseNotes(inputString) {
    // PARSER FOR NOTES SECTION DATA
          if(typeof(inputString) != String){
            TypeError("NO NOTES FOR NOTES PARSER TO PARSE.  PLZ HALP, HAVING EXISTENTIAL CRISIS")
          }
  
          var notesSplit = inputString.split("\n")
          var hasVehicle = inputString.includes("Vehicle")
  
          var area = notesSplit[0].replace("Area: ","").trim()
          Logger.log(area)
          var district = notesSplit[1].replace("District: ","").trim()
          var zone = notesSplit[2].replace("Zone: ", "").trim()
          let  isSeniorCouple = notesSplit[1].includes("Senior")
          var ecclesiasticalUnitString = notesSplit[3]
          var hasMultipleUnits = ecclesiasticalUnitString.includes("Units:") // tests to see if there are multiple ecclesiastical units covered by a companionship.
          var unitString = ""
          if(hasMultipleUnits == true){
            unitString = ecclesiasticalUnitString.replace("Ecclesiastical Units:","").trim()
          } 
          if(hasMultipleUnits == false){
            unitString = ecclesiasticalUnitString.replace("Ecclesiastical Unit:","").trim()
            unitString = unitString.replace("EcclesiasticalUnit:","").trim()
          }
  
          // This part is in a conditional because it only matters (& WORKS!) if there's a vehicle.
          // Otherwise, the vehicle will get the extra tags and junk, which we don't particularly want to happen.
  
          var vehicleDesc
          var vehicleMiles
          var vinLast8
          var vehicleCCID
          var finalTags
  
          if(hasVehicle == true){
            vehicleDesc = notesSplit[5].replace("Vehicle:","").trim()
            vehicleMiles = notesSplit[6].replace("Vehicle Allowance/Mo: ","").replace("Mi","").trim()
            vinLast8 = notesSplit[7].replace("Vehicle VIN Last 8:","").trim()
            vehicleCCID = notesSplit[8].replace("Vehicle","").replace("CCID:","").trim()
  
          // This has *some* data in it but I'm not using it right now
            finalTags = notesSplit[10]
          } else {
            finalTags = notesSplit[5]
          }
  
          let isSisterArea = finalTags.includes("Sister");
  
          return{
            area:area,
            district:district,
            zone:zone,
            hasMultipleUnits:hasMultipleUnits,
            unitString:unitString,
            hasVehicle:hasVehicle,
            vehicleDesc:vehicleDesc,
            vehicleMiles:vehicleMiles,
            vinLast8:vinLast8,
            vehicleCCID:vehicleCCID,
            isSeniorCouple:isSeniorCouple,
            isSisterArea:isSisterArea,
            finalTags:finalTags}
  } // Written by Elder Robertson, TMM
  