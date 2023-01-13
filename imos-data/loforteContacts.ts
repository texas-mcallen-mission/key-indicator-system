// Compiled using undefined undefined (TypeScript 4.9.4)

let group = ContactsApp.getContactGroup('IMOS Roster'); // Fetches group by groupname 
let contacts = group.getContacts(); // Fetches contact list of group 

    function getContact() {
        
        //console.log(contacts[1]);

        for(let contact of contacts){

            // let nameFull1 = contact.getFullName();
            // let idk = contact.getHomeAddress();
            // let contactEmail = contact.getEmailAddresses();
            // let areaEmail = contactEmail[0];
            // let email1 = contactEmail[1];
            // let email2 = contactEmail[2];


    
    console.log(contact[1]);

    } // end forLoop
    
} // end getContacts