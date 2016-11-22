function attachEvents() {
    const catchDBUrl = 'https://baas.kinvey.com/appdata/kid_B17mkg6Wl/biggestCatches',
        username = 'bob',
        password = 'b',
        base64auth = btoa(`${username}:${password}`),
        authHeaders = {"Authorization": "Basic " + base64auth},
        addForm = $('#addForm'),
        catches = $('#catches');

    $('.add').click(addNewCatch);
    $('.load').click(loadAllCatches);
    $('#catches').on('click', '.update', updateCatch);
    $('#catches').on('click', '.delete', deleteCatch);

    function addNewCatch() {
        let catchData = {
            angler: addForm.find('.angler').val(),
            weight: Number(addForm.find('.weight').val()),
            species: addForm.find('.species').val(),
            location: addForm.find('.location').val(),
            bait: addForm.find('.bait').val(),
            captureTime: Number(addForm.find('.captureTime').val())
        };

        $.ajax({
            method: 'POST',
            url: catchDBUrl,
            headers: authHeaders,
            data: JSON.stringify(catchData),
            contentType: 'application/json'
        })
            .then(clearAddForm)
            .then(loadAllCatches)
            .catch(errorHandler);
    }

    function loadAllCatches() {
        $.get({
            url: catchDBUrl,
            headers: authHeaders
        })
            .then(displayAllCatches)
            .catch(errorHandler);
    }

    function displayAllCatches(catchesArray) {
        catches.empty();
        for (let catchObject of catchesArray) {
            catches.append(buildCatchTemplate(catchObject));
        }
    }

    function updateCatch() {
        let holderDiv = $(this).parent(),
            catchId = holderDiv.attr('data-id');

        let catchData = {
            angler: holderDiv.find('.angler').val(),
            weight: Number(holderDiv.find('.weight').val()),
            species: holderDiv.find('.species').val(),
            location: holderDiv.find('.location').val(),
            bait: holderDiv.find('.bait').val(),
            captureTime: Number(holderDiv.find('.captureTime').val())
        };


        $.ajax({
            method: 'PUT',
            url: catchDBUrl + '/' + catchId,
            headers: authHeaders,
            data: JSON.stringify(catchData),
            contentType: 'application/json'
        })
            .then(loadAllCatches)
            .catch(errorHandler);

    }

    function deleteCatch() {
        let holderDiv = $(this).parent(),
            catchId = holderDiv.attr('data-id');

        $.ajax({
            method: 'DELETE',
            url: catchDBUrl + '/' + catchId,
            headers: authHeaders
        })
            .then(loadAllCatches)
            .catch(errorHandler);
    }

    function clearAddForm() {
        addForm.find('input').val('')
    }

    function errorHandler(error) {
        console.log('Error: ' + error.status + '(' + error.statusText + ')');
    }

    function buildCatchTemplate(catchObject) {
        let baseDiv = $('<div>')
            .addClass('catch')
            .attr('data-id', catchObject._id);
        //Angler
        baseDiv.append($('<label>')
            .text('Angler'));
        baseDiv.append($('<input>')
            .addClass('angler')
            .attr('type', 'text')
            .val(catchObject.angler));
        //Weight
        baseDiv.append($('<label>')
            .text('Weight'));
        baseDiv.append($('<input>')
            .addClass('weight')
            .attr('type', 'number')
            .val(catchObject.weight));
        //Species
        baseDiv.append($('<label>')
            .text('Species'));
        baseDiv.append($('<input>')
            .addClass('species')
            .attr('type', 'text')
            .val(catchObject.species));
        //Location
        baseDiv.append($('<label>')
            .text('Location'));
        baseDiv.append($('<input>')
            .addClass('location')
            .attr('type', 'text')
            .val(catchObject.location));
        //Bait
        baseDiv.append($('<label>')
            .text('Bait'));
        baseDiv.append($('<input>')
            .addClass('bait')
            .attr('type', 'text')
            .val(catchObject.bait));
        //Capture Time
        baseDiv.append($('<label>')
            .text('Capture Time'));
        baseDiv.append($('<input>')
            .addClass('captureTime')
            .attr('type', 'number')
            .val(catchObject.captureTime));
        //Controls
        baseDiv.append($('<button>')
            .addClass('update')
            .text('Update'));
        baseDiv.append($('<button>')
            .addClass('delete')
            .text('Delete'));

        return baseDiv;
    }
}
