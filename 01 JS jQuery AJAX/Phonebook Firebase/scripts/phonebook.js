function attachEvents() {
    const baseUrl = 'https://phonebook-nakov.firebaseio.com/phonebook',
        person = $('#person'),
        phone = $('#phone'),
        phonebook = $('#phonebook');


    function loadContacts() {
        let request = {
            method: 'GET',
            url: baseUrl + '.json',
            success: displayPhones
        };
        $.ajax(request);
    }

    function displayPhones(contacts) {
        phonebook.empty();
        for (let key of Object.keys(contacts)) {
            let contact = contacts[key];
            let li = $('<li>');
            li.text(`${contact.person}: ${contact.phone} `);
            li.append($('<button>')
                .text('[Delete]')
                .click(function () {
                    deleteContact(key);
                })
            );
            phonebook.append(li);
        }
    }

    function deleteContact(key) {
        let deleteRequest = {
            method: 'DELETE',
            url: `${baseUrl}/${key}.json`,
            success: loadContacts
        };
        $.ajax(deleteRequest);
    }

    function createContact() {
        let phoneNumber = phone.val().trim(),
            personName = person.val().trim();
        if (phoneNumber && personName) {
            let contact = JSON.stringify({
                person: personName,
                phone: phoneNumber
            });
            let postRequest = {
                method: 'POST',
                url: `${baseUrl}.json`,
                dataType: 'JSON',
                data: contact,
                success: function () {
                    loadContacts()
                }
            };
            $.ajax(postRequest);
            phone.val('');
            person.val('');
        }
    }

    $('#btnLoad').click(loadContacts);
    $('#btnCreate').click(createContact);
}
