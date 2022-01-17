function emailParser(emailList) {
    let emailAddresses = []
    let emailDisplayNames = []
    let emailLabelName = []
    // this operates under the assumption that all the emails are in the same order :0
    for(let i=0; i<emailList.length;i++){
      emailAddresses[i] = emailList[i].getAddress()
      emailDisplayNames[i] = emailList[i].getDisplayName()
      emailLabelName[i] = emailList[i].getLabel()
    }
    return{
      emailAddresses:emailAddresses,
      emailDisplayNames:emailDisplayNames,
      emailLabelNames:emailLabelName
    }
  }
  