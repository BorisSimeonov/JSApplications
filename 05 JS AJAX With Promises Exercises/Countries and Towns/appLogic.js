function attachEvents() {
    const appKey = 'kid_ryA5oo4fx',
        baseAppUrl = `https://baas.kinvey.com/appdata/${appKey}`,
        username = 'guest',
        password = 'guest',
        authHeaders = {'Authorization': `Basic ${btoa(username + ':' + password)}`};

    const table = $('#dataTable');

    function loadCountries() {
        $.get({
            url: baseAppUrl + '/countries',
            headers: authHeaders
        })
            .then(loadTownsForEachCountry)
            .catch(handleErrors);
    }

    function loadTownsForEachCountry(countries) {
        table.empty();
        countries.forEach(country => {
            let newRow = $('<tr>')
                .attr('country-id', country._id)
                .append(
                    $('<td>').addClass('countryName').text(country.name),
                    $('<td>').addClass('townNames')
                );
            table.append(newRow);
            getTownsForCountry(country._id);
        });
    }

    function getTownsForCountry(countryId) {
        let query = "?query=" + JSON.stringify({"countryId": countryId});
        $.get({
            url: baseAppUrl + '/towns' + query,
            headers: authHeaders
        })
            .then(addTownsToTable)
            .catch(handleErrors);
    }

    function addTownsToTable(towns) {
        if (towns.length) {
            let targetRow = $('table#dataTable tr[country-id=' + towns[0].countryId + ']');
            towns.forEach(town =>
                targetRow.find('td.townNames').append($('<div>')
                    .addClass('townDiv')
                    .text(town.name))
            );
        }
    }

    function handleErrors(error) {
        console.log(`Error ${error.status} (${error.statusText})`);
    }

    function createNewCountry(nameHolder) {
        $.ajax({
            method: 'POST',
            headers: authHeaders,
            url: baseAppUrl + '/countries',
            data: {name: $(nameHolder).val()}
        })
            .then(loadCountries)
            .catch(handleErrors);
    }

    function deleteCountry(nameHolder) {
        let query = '?query={"name":"' + $(nameHolder).val() + '"}';
        $.ajax({
            method: 'DELETE',
            headers: authHeaders,
            url: baseAppUrl + '/countries' + query
        })
            .then(loadCountries)
            .catch(handleErrors);
    }

    function deleteTown(nameHolder) {
        let query = '?query={"name":"' + $(nameHolder).val() + '"}';
        console.log(query);
        $.ajax({
            method: 'DELETE',
            headers: authHeaders,
            url: baseAppUrl + '/towns' + query
        })
            .then(loadCountries)
            .catch(handleErrors);
    }

    function getCountryID(selectorArr, onSuccessFunction) {
        let countryName = $(selectorArr[0]).val();
        let query = '?query={"name":"' + countryName + '"}'

        $.get({
            url: baseAppUrl + '/countries' + query,
            headers: authHeaders
        })
            .then((country) => {onSuccessFunction(country, selectorArr)})
            .catch(handleErrors)
    }

    function createNewTown(country) {
        if (country.length) {
            let newTown = {
                name: $('#addTown input[name=townName]').val(),
                countryId: country[0]._id
            };
            console.log(newTown);
            if (newTown.name) {
                console.log('inside');
                $.ajax({
                    method: 'POST',
                    headers: authHeaders,
                    url: baseAppUrl + '/towns',
                    data: newTown
                })
                    .then(loadCountries)
                    .catch(handleErrors);
            }
        }
    }

    function updateCountryName(country, selectorArr) {
        if (selectorArr.length && country.length) {
            let newCountryName = $(selectorArr[1]).val();
            console.log(newCountryName);
            console.log(country);
            console.log(selectorArr);
            console.log(country[0]._id);
            getCountryID($.ajax({
                method: 'PUT',
                headers: authHeaders,
                url: baseAppUrl + '/countries/' + country[0]._id,
                data: {name: newCountryName}
            })
                .then(loadCountries)
                .catch(handleErrors))
        }
    }

    $('#refreshTable').on('click', loadCountries);
    $('#btnSubmitNewCountry').on('click', () => {
        createNewCountry('#addCountry input[name=countryName]')
    });
    $('#btnDeleteCountry').on('click', () => {
        deleteCountry('#DeleteCountry input[name=countryName]')
    });
    $('#btnDeleteTown').on('click', () => {
        deleteTown('#DeleteTown input[name=townName]')
    });
    $('#btnSubmitNewTown').on('click', () => getCountryID(['#addTown input[name=countryName]'], createNewTown));
    $('#btnUpdateCountry').on('click', () => getCountryID(['#updateCountry input[name=countryName]',
        '#updateCountry input[name=newCountryName]'], updateCountryName));

    loadCountries();
}
