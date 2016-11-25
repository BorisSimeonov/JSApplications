function attachEvents() {
    const appKey = 'kid_BJ_Ke8hZg',
        baseAppUrl = 'https://baas.kinvey.com/',
        username = 'guest',
        password = 'pass',
        authHeaders = {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        },
        venueSearchInput = $('#venueDate'),
        venuesHolder = $('#venue-info');

    function getVenueIdsFromDB() {
        let venueDate = venueSearchInput.val();
        if (venueDate) {
            $.ajax({
                method: 'POST',
                url: baseAppUrl + 'rpc/' +
                appKey + '/custom/calendar?query=' +
                venueDate,
                headers: authHeaders
            })
                .then(getVenuesById)
                .catch(handleErrors);
        }
    }

    function getVenuesById(venueIdArray) {
        venuesHolder.empty();
        venueIdArray.forEach(venueId => {
            $.get({
                url: baseAppUrl + 'appdata/' +
                appKey + '/venues/' + venueId,
                headers: authHeaders
            })
                .then(appendVenueToDOM)
                .catch(handleErrors)
        });
    }

    function appendVenueToDOM(venueObject) {
        let mainDiv = $('<div>')
            .addClass('venue')
            .attr('id', venueObject._id)
            .append(
                $('<span>')
                    .addClass('venue-name')
                    .text(venueObject.name)
                    .append(
                        $('<input>')
                            .addClass('info')
                            .attr('type', 'button')
                            .attr('value', 'More info')
                    )
            );

        mainDiv.append(
            $('<div>')
                .addClass('venue-details')
                .css('display', 'none')
                .append(
                    $('<table>')
                        .append(
                            $('<tr>')
                                .append(
                                    $('<th>').text('Ticket Price'),
                                    $('<th>').text('Quantity'),
                                    $('<th>')
                                ),
                            $('<tr>')
                                .append(
                                    $('<td>')
                                        .addClass('venue-price')
                                        .text(`${venueObject.price} lv`),
                                    $('<td>')
                                        .append(
                                            $('<select>')
                                                .addClass('quantity')
                                                .append(
                                                    $('<option>')
                                                        .attr('value', '1')
                                                        .text('1'),
                                                    $('<option>')
                                                        .attr('value', '2')
                                                        .text('2'),
                                                    $('<option>')
                                                        .attr('value', '3')
                                                        .text('3'),
                                                    $('<option>')
                                                        .attr('value', '4')
                                                        .text('4'),
                                                    $('<option>')
                                                        .attr('value', '5')
                                                        .text('5')
                                                ),
                                            $('<td>')
                                                .append(
                                                    $('<input>')
                                                        .addClass('purchase')
                                                        .attr('type', 'button')
                                                        .attr('value', 'Purchase')
                                                )
                                        )
                                )
                        )
                )
        );

        mainDiv.append(
            $('<span>').addClass('head').text('Venue description:'),
            $('<p>').addClass('description').text(venueObject.description),
            $('<p>').addClass('description').text(venueObject.startingHour)
        );

        mainDiv.appendTo(venuesHolder);
    }

    function showVenueInfo() {
        $(this).parent().siblings('.venue-details').toggle();
    }

    function sumThePurchase() {
        let quantity = $(this)
            .parent()
            .siblings('.quantity')
            .find('option:selected')
            .val();

        let price = $(this)
            .parent()
            .parent()
            .siblings('.venue-price')
            .text();

        let name = ((element) => {
            element = $(element);
            while (true) {
                if (element.siblings('.venue-name').length < 1) {
                    element = element.parent();
                } else {
                    return element.siblings('.venue-name').text();
                }
            }
        })(this);

        let venueId = $(this).closest('.venue').attr('id');

        price = price.replace(/[^0-9]/g, '');

        displayTheSumInDOM(name, Number(quantity), Number(price), venueId);
    }

    function displayTheSumInDOM(name, quantity, price, id) {
        let confirm = $('<div>')
            .addClass('purchase-info')
            .append(
                $('<span>').text(name),
                $('<span>').text(`${quantity} x ${price}`),
                $('<span>').text(`${quantity * price} lv`),
                $('<input>')
                    .attr('type', 'button')
                    .attr('value', 'Confirm')
                    .attr('quantity', quantity)
                    .on('click', ()=>{makePurchase(quantity, id)})
            );
        $('#venue-info').empty().append(confirm);
    }
    
    function makePurchase(quantity, id) {
        $.ajax({
            method: 'POST',
            url: baseAppUrl + 'rpc/' + appKey +
                '/custom/purchase?venue=' + id +
                '&qty=' + quantity,
            headers: authHeaders
        })
            .then(displayResponse)
            .catch(handleErrors);
    }

    function displayResponse(responseHTML) {
        console.log(responseHTML);
        $('#venue-info').empty().append(responseHTML.html);
    }

    function handleErrors(error) {
        console.log(`Error: ${error.status} (${error.statusText})`);
        console.log(error.message);
    }


    $('#getVenues').on('click', getVenueIdsFromDB);
    venuesHolder.on('click', '.info', showVenueInfo);
    venuesHolder.on('click', '.purchase', sumThePurchase);

}
