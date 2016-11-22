function knock() {
    const appKey = 'kid_BJXTsSi-e',
        appSecret = '447b8e7046f048039d95610c1b039390',
        baseUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/knock',
        initialKnockQuery = 'Knock Knock.',
        username = 'guest',
        password = username,
        base64auth = btoa(`${username}:${password}`),
        authHeaders = {"Authorization": "Basic " + base64auth},
        messageHolder = $('#message-holder');

    knockChainer(initialKnockQuery);
    function knockChainer(currentKnockQuery) {
        console.log(currentKnockQuery);
        appendNewMessage(currentKnockQuery);
        $.get({
            url: baseUrl + '?query=' + currentKnockQuery,
            headers: authHeaders
        })
            .then(queryExecutor)
            .catch(errorHandler);
    }
    
    function queryExecutor({message, answer}) {
        console.log(answer);
        appendNewMessage(answer);

        if(message) {
            knockChainer(message);
        }
    }

    function errorHandler(error) {
        console.log(`Error: ${error.status} (${error.statusText})`);
    }

    function appendNewMessage(messageText) {
        let li = $('<li>')
            .text(messageText).appendTo(messageHolder);
    }
}