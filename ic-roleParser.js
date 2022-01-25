//@ts-check


function roleParser(labelNameObject, listOfEmails) {
  let compRoles = []
  let isTrainer = []
  // Position Strings: First is the tested for value, second is the readable output one.
  let ap = ["(AP)", "AP"]
  let zl1 = ["(ZL1)", "ZL1"]
  let zl2 = ["(ZL2)", "ZL2"]
  let zl3 = ["(ZL3)", "ZL3"]
  let stl1 = ["(STL1)", "STL1"]
  let stl2 = ["(STL2)", "STL2"]
  let stl3 = ["(STL3)", "STL3"]
  let dl = ["(DL)", "DL"]
  let seniorComp = ["(SC)", "SC"]
  let juniorComp = ["(JC)", "JC"]
  let seniorCompTrainer = ["(TR)", "TR"]
  let zlTrainer = ["(ZLT)", "ZLT"]
  let stlTrainer = ["(STLT)", "STLT"]
  let dlTrainer = ["(DT)", "DT"]
  let specialAssignment = ["(SA)", "SA"]



  // Logger.log([labelNameObject[0],labelNameObject[1],labelNameObject[2],labelNameObject[3]])
  for (let labelIterant = 0; labelIterant < listOfEmails.length; labelIterant++) {
    let labelString = labelNameObject[labelIterant].toString()
    if (typeof labelNameObject[labelIterant] == "object") {
      Logger.log(["weird edge-case thingy:", labelIterant, listOfEmails[labelIterant], labelNameObject[labelIterant], labelNameObject[labelIterant].toString()])
    }
    let openParenPos = labelString.lastIndexOf("(") /* indexOf was originally used here, switched to lastIndexOf because somebody */
    let closeParenPos = labelString.lastIndexOf(")") /* with a nickname in parenthesis, ie (Siri) was breaking it and they weren't getting their role parsed properly. */
    /* https://www.codegrepper.com/code-examples/javascript/find+the+last+occurrence+of+a+character+in+a+string+javascript */
    // let regexSearch = labelString.search(/\(\w*/) // this one stopped working and was harder to debug and read, so I switched it.
    let roleString = labelString.substring(openParenPos, closeParenPos + 1)
    switch (roleString) {
      // AP's
      case ap[0]:
        compRoles[labelIterant] = ap[1]
        isTrainer[labelIterant] = false
        break;
      // ZL
      case zl1[0]:
        compRoles[labelIterant] = zl1[1]
        isTrainer[labelIterant] = false
        break;
      case zl2[0]:
        compRoles[labelIterant] = zl2[1]
        isTrainer[labelIterant] = false
        break;
      case zl3[0]:
        compRoles[labelIterant] = zl3[1]
        isTrainer[labelIterant] = false
        break;
      case zlTrainer[0]:
        compRoles[labelIterant] = zlTrainer[1]
        isTrainer[labelIterant] = true
        break;
      //STL
      case stl1[0]:
        compRoles[labelIterant] = stl1[1]
        isTrainer[labelIterant] = false
        break;
      case stl2[0]:
        compRoles[labelIterant] = stl2[1]
        isTrainer[labelIterant] = false
        break;
      case stl3[0]:
        compRoles[labelIterant] = stl3[1]
        isTrainer[labelIterant] = false
        break;
      case stlTrainer[0]:
        compRoles[labelIterant] = stlTrainer[1]
        isTrainer[labelIterant] = true
        break;

      // District Leader
      case dl[0]:
        compRoles[labelIterant] = dl[1]
        isTrainer[labelIterant] = false
        break;
      case dlTrainer[0]:
        compRoles[labelIterant] = dlTrainer[1]
        isTrainer[labelIterant] = true
        break;
      // Senior Comp
      case seniorComp[0]:
        compRoles[labelIterant] = seniorComp[1]
        isTrainer[labelIterant] = false
        break;
      case seniorCompTrainer[0]:
        compRoles[labelIterant] = seniorCompTrainer[1]
        isTrainer[labelIterant] = true
        break;
      // Junior Comp
      case juniorComp[0]:
        compRoles[labelIterant] = juniorComp[1]
        isTrainer[labelIterant] = false
        break;
      // Special Assignment
      case specialAssignment[0]:
        compRoles[labelIterant] = specialAssignment[1]
        isTrainer[labelIterant] = false
        break;
    }
  }
  return {
    compRoles: compRoles,
    isTrainer: isTrainer
  }
} // Written by Elder Robertson, TMM

