function attachEvents() {
    const appKey = 'kid_ryA5oo4fx',
        baseAppUrl = 'https://baas.kinvey.com/',
        username = 'guest',
        password = 'guest',
        authHeaders = {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        },
        playersHolder = $('#players');


    function getAllPlayers() {
        $.get({
            url: baseAppUrl + 'appdata/' +
            appKey + '/players',
            headers: authHeaders
        })
            .then(displayPlayersInDOM)
            .catch(handleErrors)
    }

    function displayPlayersInDOM(playerArray) {
        playersHolder.empty();
        playerArray.forEach(player => {
            let newPlayer = $('<div>')
                .addClass('player')
                .attr('data-id', player._id)
                .append(
                    $('<div>')
                        .addClass('row')
                        .append(
                            $('<label>').text('Name:'),
                            $('<label>').addClass('name').text(player.name)
                        ),
                    $('<div>')
                        .addClass('row')
                        .append(
                            $('<label>').text('Money:'),
                            $('<label>').addClass('money').text(player.money)
                        ),
                    $('<div>')
                        .addClass('row')
                        .append(
                            $('<label>').text('Bullets:'),
                            $('<label>').addClass('bullets').text(player.bullets)
                        ),
                    $('<button>')
                        .addClass('play')
                        .text('Play'),
                    $('<button>')
                        .addClass('delete')
                        .text('Delete')
                );
            playersHolder.append(newPlayer);
        });
    }

    function addNewPlayer() {
        let newPlayer = {
            name: $('#addName').val(),
            //By requirement (default values):
            bullets: 6,
            money: 500
        };

        if (newPlayer.name) {
            $.ajax({
                method: 'POST',
                url: baseAppUrl + 'appdata/' + appKey +
                '/players',
                headers: authHeaders,
                data: newPlayer
            })
                .then(()=> {
                    $('#addName').val('');
                    getAllPlayers();
                })
                .catch(handleErrors);
        }
    }

    function deletePlayer() {
        let playerId = $(this).parent().attr('data-id');
        $.ajax({
            method: 'DELETE',
            url: baseAppUrl + 'appdata/' + appKey +
            '/players/' + playerId,
            headers: authHeaders
        })
            .then(getAllPlayers)
            .catch(handleErrors);
    }

    function startGame() {
        let currentPlayerBox = $(this).closest('.player'),
            name = currentPlayerBox.find('.name').text(),
            money = Number(currentPlayerBox.find('.money').text()),
            bullets = Number(currentPlayerBox.find('.bullets').text());

        loadCanvas({name, money,  bullets});
        $('#canvas').show();
        $('#buttons button').show();
        $('#players').hide();
    }

    function handleErrors(error) {
        console.log(`Error: ${error.status} (${error.statusText}`);
        console.log(error.message);
    }

    getAllPlayers();

    $('#addPlayer').on('click', addNewPlayer);
    playersHolder.on('click', '.delete', deletePlayer);
    playersHolder.on('click', '.play', startGame);
}