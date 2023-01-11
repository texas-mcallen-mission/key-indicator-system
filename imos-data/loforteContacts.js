function getContact() {

    let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
    let contacts = group.getContacts();                     // Fetches contact list of group 

    // @ts-ignore
    console.log(contacts.length);

    for (let i = 0; i < contacts.length; i++) {
        
    }
} // end getContact

