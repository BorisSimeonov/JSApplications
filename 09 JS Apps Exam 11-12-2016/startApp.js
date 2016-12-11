function startApp() {
    function showInfo(message) {
        $('#infoBox').text(message).show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 1500);
    }

    function handleAjaxError(event, response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON && response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        $('#errorBox').text(errorMsg).show();
    }

    const displayChanger = (function () {
        function hideSections() {
            $('section').css('display', 'none')
        }

        let showViewBySelector = function (selector) {
            hideSections();
            $(selector).css('display', 'block');
        };

        let changeViewForUserChange = function () {
            hideSections();

            if (!sessionStorage.getItem('authToken')) {
                $('.useronly').css('display', 'none');
                $('.anonymous').css('display', 'inline-block');
                showViewBySelector('#viewAppHome');
            } else {
                $('.useronly').css('display', 'inline-block');
                $('.anonymous').css('display', 'none');
                showViewBySelector('#viewUserHome');
                $('#viewUserHomeHeading, #spanMenuLoggedInUser')
                    .text(`Welcome, ${sessionStorage.getItem('name')}`);
            }
        };

        return {
            showViewBySelector,
            changeViewForUserChange,
        }
    })();

    const kinveyRequester = (function () {
        const app_key = 'kid_HJxzad57e',
            app_secret = '560f3a2ae9be4cf195c6c499020b4edc',
            base_url = 'https://baas.kinvey.com/',
            authHeaders = {
                'Authorization': 'Basic ' +
                btoa(`${app_key}:${app_secret}`)
            };

        let registerUser = function (username, password, name) {
            return $.ajax({
                method: 'POST',
                url: base_url + 'user/' + app_key + '/',
                headers: authHeaders,
                data: JSON.stringify({username, password, name}),
                contentType: 'application/json'
            })
        };

        let loginUser = function (username, password) {
            return $.ajax({
                method: 'POST',
                url: base_url + 'user/' +
                app_key + '/login',
                headers: authHeaders,
                data: JSON.stringify({username, password}),
                contentType: 'application/json'
            });
        };

        let logoutUser = function () {
            return $.ajax({
                method: 'POST',
                url: base_url + 'user/' +
                app_key + '/_logout',
                headers: getKinveyAuthHeaders()
            });
        };

        let getListOfUsers = function () {
            return $.ajax({
                method: 'GET',
                url: base_url + 'user/' + app_key,
                headers: getKinveyAuthHeaders()
            });
        };

        let sendNewMessage = function (sender_username, sender_name, recipient_username, text) {
            return $.ajax({
                method: 'POST',
                url: base_url + 'appdata/' + app_key +
                '/messages',
                headers: getKinveyAuthHeaders(),
                data: JSON.stringify({
                    sender_username,
                    sender_name,
                    recipient_username,
                    text
                }),
                contentType: 'application/json'
            });
        };

        let getMessagesByCreatorId = function (user_id) {
            return $.ajax({
                method: 'GET',
                url: base_url + 'appdata/' + app_key +
                '/messages?query=' + JSON.stringify({_acl: {creator: user_id}}),
                headers: getKinveyAuthHeaders()
            });
        };

        let getMessagesByRecipientUsername = function (username) {
            return $.ajax({
                method: 'GET',
                url: base_url + 'appdata/' + app_key +
                '/messages?query=' +
                JSON.stringify({recipient_username: username}),
                headers: getKinveyAuthHeaders()
            });
        };

        let deleteMessageById = function (messageId) {
            return $.ajax({
                method: 'DELETE',
                url: base_url + 'appdata/' + app_key +
                '/messages?query=' + JSON.stringify({_id: messageId}),
                headers: getKinveyAuthHeaders()
            });
        };

        function getKinveyAuthHeaders() {
            return {
                Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')
            };
        }

        return {
            loginUser,
            logoutUser,
            registerUser,
            getListOfUsers,
            sendNewMessage,
            getMessagesByCreatorId,
            deleteMessageById,
            getMessagesByRecipientUsername
        }
    })();

    const userActions = (function () {
        let loginUser = function (event) {
            event.preventDefault();
            let username = $('#loginUsername').val(),
                password = $('#loginPasswd').val();

            kinveyRequester.loginUser(username, password)
                .then(requestSuccess);

            function requestSuccess(resultObject) {
                sessionStorage.setItem('authToken', resultObject._kmd.authtoken);
                sessionStorage.setItem('userId', resultObject._id);
                sessionStorage.setItem('name', resultObject.name);
                sessionStorage.setItem('username', resultObject.username);
                displayChanger.changeViewForUserChange();
                showInfo(`Login successful.`);
                $('#loginUsername, #loginPasswd').val('');
            }
        };

        let logoutUser = function () {
            kinveyRequester.logoutUser()
                .then(requestSuccess);

            function requestSuccess() {
                sessionStorage.clear();
                displayChanger.changeViewForUserChange();
                showInfo(`User has logged out`);
            }
        };

        let registerUser = function (event) {
            event.preventDefault();
            let username = $('#registerUsername').val(),
                password = $('#registerPasswd').val(),
                name = $('#registerName').val();

            kinveyRequester.registerUser(username, password, name)
                .then(requestSuccess);

            function requestSuccess() {
                displayChanger.changeViewForUserChange();
                $('#formRegister input').val('');
                showInfo(`User has been registered`);
            }
        };

        let deleteMessage = function (messageId) {
            kinveyRequester.deleteMessageById(messageId)
                .then(requestSuccess);
            function requestSuccess() {
                showInfo('Message deleted.');
                $('#linkMenuArchiveSent').trigger('click');
            }
        };

        let sendNewMessage = function (event) {
            event.preventDefault();
            let sender_username = sessionStorage.getItem('username'),
                sender_name = sessionStorage.getItem('name'),
                recipient_username = $('#msgRecipientUsername')
                    .find(':selected').prop('recipient'),
                text = $('#msgText').val();

            kinveyRequester.sendNewMessage(sender_username, sender_name,
                recipient_username, text).then(requestSuccess);

            function requestSuccess() {
                showInfo('Message sent.');
                $('#msgText').val('');
            }
        };

        return {
            loginUser,
            logoutUser,
            registerUser,
            deleteMessage,
            sendNewMessage
        }
    })();

    function attachViewChangeEvents() {
        $('#linkMenuAppHome').on('click', () => displayChanger
            .showViewBySelector('#viewAppHome'));
        $('#linkMenuLogin').on('click', () => displayChanger
            .showViewBySelector('#viewLogin'));
        $('#linkMenuRegister').on('click', () => displayChanger
            .showViewBySelector('#viewRegister'));
        $('#linkMenuSendMessage, #linkUserHomeSendMessage')
            .on('click', () => {
                kinveyRequester.getListOfUsers()
                    .then(requestSuccess);

                function requestSuccess(userList) {
                    let userSelectHolder = $('#msgRecipientUsername');
                    userSelectHolder.empty();

                    userList.forEach(user => {
                        let option = $('<option>')
                            .prop('recipient', `${user.username}`)
                            .text(`${user.username}(${user.name})`);
                        userSelectHolder.append(option);
                    });
                    displayChanger.showViewBySelector('#viewSendMessage');
                }
            });
        $('#linkMenuMyMessages, #linkUserHomeMyMessages')
            .on('click', () => {
                let currentUsername = sessionStorage.getItem('username');
                kinveyRequester.getMessagesByRecipientUsername(currentUsername)
                    .then(requestSuccess);

                function requestSuccess(messagesList) {
                    let tableHolder = $('#myMessages tbody');
                    tableHolder.empty();
                    messagesList.forEach(message => {
                        let messageRow = $('<tr>')
                            .append($('<td>')
                                .text(
                                    (message.sender_name) ?
                                        `${message.sender_username} (${
                                            message.sender_name})` :
                                        `${message.sender_username}`
                                )
                            )
                            .append($('<td>')
                                .text(message.text))
                            .append($('<td>')
                                .text(formatDate(message._kmd.lmt)));
                        tableHolder.append(messageRow);
                    });

                    showInfo('Received messages loaded.');
                    displayChanger
                        .showViewBySelector('#viewMyMessages')
                }
            });
        $('#linkMenuArchiveSent, #linkUserHomeArchiveSent')
            .on('click', () => {
                let userId = sessionStorage.getItem('userId');
                kinveyRequester.getMessagesByCreatorId(userId)
                    .then(requestSuccess);

                function requestSuccess(messagesList) {
                    let messageTable = $('#sentMessages tbody');
                    messageTable.empty();
                    messagesList.forEach(message => {
                        let row = $('<tr>')
                            .append($('<td>')
                                .text(message.recipient_username))
                            .append($('<td>')
                                .text(message.text))
                            .append($('<td>')
                                .text(formatDate(message._kmd.lmt)))
                            .append($('<td>')
                                .append($('<button>')
                                    .text('Delete')
                                    .on('click', () => {
                                        userActions.deleteMessage(message._id)
                                    })
                                )
                            );
                        messageTable.append(row);
                    });
                    displayChanger
                        .showViewBySelector('#viewArchiveSent')
                }
            });
        $('#linkMenuAppHome').on('click', () => displayChanger
            .showViewBySelector('#viewAppHome'));
        $('#linkMenuUserHome').on('click', () => displayChanger
            .showViewBySelector('#viewUserHome'));
    }

    function attachUserActionEvents() {
        $('#formRegister').on('submit', userActions.registerUser.bind(this));
        $('#formLogin').on('submit', userActions.loginUser.bind(this));
        $('#linkMenuLogout').on('click', userActions.logoutUser.bind(this));
        $('#formSendMessage').on('submit', userActions.sendNewMessage.bind(this));
    }

    function attachErrorHandilihAndMesseging() {
        $('#loadingBox, #errorBox, #infoBox').css('display', 'none');
        $(document).on({
            ajaxStart: function () {
                $('#loadingBox').show()
            },
            ajaxStop: function () {
                $('#loadingBox').hide()
            }
        });
        $(document).ajaxError(handleAjaxError.bind(this));
        $('#errorBox').on('click', function () {
            $(this).hide();
        });
    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    attachViewChangeEvents();
    attachUserActionEvents();
    attachErrorHandilihAndMesseging();

    displayChanger.changeViewForUserChange();
}
