// Compiled using undefined undefined (TypeScript 4.9.4)

let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
let contacts = group.getContacts(); // Fetches contact list of group 

    function getContact() {
        

        for(let contact of contacts){

            let date1 = contact.getDates[1];
    
            console.log(date1);

    } // end getContact
    
}