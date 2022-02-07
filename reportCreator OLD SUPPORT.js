function createTemplates_(filesystemObject, templateID) {
  // creates templates, moves them into the correct folders, and then
  // returns a modified filesystemObject for working with later on down the line.
  // if the template already exists, it leaves it alone and moves along.
  let filesystemObjectCopy = filesystemObject;
  let templateFile = DriveApp.getFileById(templateID);

  for (let i = 0; i < filesystemObjectCopy.name.length; i++) {
    if (
      filesystemObjectCopy.docID[i] == "Doc Id" ||
      filesystemObjectCopy.docID[i] == "DOC ID" ||
      filesystemObjectCopy.docID[i] == ""
    ) {
      let targetFolder = filesystemObjectCopy.folderID[i];
      let folderObject = DriveApp.getFolderById(targetFolder);
      let fileName = filesystemObjectCopy.name[i];
      let templateCopy = templateFile.makeCopy(fileName, folderObject);
      filesystemObjectCopy.docID[i] = templateCopy.getId();
    }
  }
  return filesystemObjectCopy;
}
