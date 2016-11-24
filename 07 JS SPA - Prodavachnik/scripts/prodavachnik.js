function startApp() {
    $.ajaxSetup({cache: false});
    const registerLink = $('#linkRegister'),
        loginLink = $('#linkLogin'),
        logoutLink = $('#linkLogout'),
        homeLink = $('#linkHome'),
        listAdLink = $('#linkListAds'),
        createAdsLink = $('#linkCreateAd'),
        homeView = $('#viewHome'),
        loginView = $('#viewLogin'),
        registerView = $('#viewRegister'),
        adsView = $('#viewAds'),
        createAdView = $('#viewCreateAd'),
        editAdView = $('#viewEditAd'),
        loadingBox = $('#loadingBox'),
        errorBox = $('#errorBox'),
        infoBox = $('#infoBox');
    //CRUD const
    const baseAppUrl = 'https://baas.kinvey.com/',
        appKey = 'kid_S1IRsV4fe',
        appSecret = '3dc02bf32cd849e9a951759a1084b092',
        adsUrl = baseAppUrl + `appdata/${appKey}/ads`,
        authHeaders = {
            'Authorization': 'Basic ' +
            btoa(`${appKey}:${appSecret}`)
        };

    function refreshMenu() {
        $('#menu a').hide();
        if (sessionStorage.getItem('authToken') === null) {
            registerLink.show();
            loginLink.show();
            homeLink.show();
            $('#loggedInUser').text('').hide();
        } else {
            homeLink.show();
            logoutLink.show();
            listAdLink.show();
            createAdsLink.show();
        }
    }

    function refreshSections() {
        $('#homeView, #viewCreateAd, #viewLogin, #viewAds, #viewEditAd, #viewRegister').hide();
        if (sessionStorage.getItem('authToken') &&
            sessionStorage.getItem('authToken') !== null) {
            adsView.show();
        } else {
            homeView.show()
        }
    }

    function showSection() {
        $('main section').hide();
        switch (this.id) {
            case 'linkHome':
                homeView.show();
                break;
            case 'linkLogin':
                loginView.show();
                break;
            case 'linkRegister':
                registerView.show();
                break;
            case 'linkListAds':
                adsView.show();
                break;
            case 'linkCreateAd':
                createAdView.show();
                break;
        }
    }

    function registerUser() {
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };

        loadingBox.show();
        $.ajax({
            method: 'POST',
            url: baseAppUrl + `user/${appKey}`,
            headers: authHeaders,
            data: userData
        })
            .then(handleSuccess)
            .catch(handleErrors);

        clearForm($('#formRegister'));
    }

    function loginUser() {
        loadingBox.show();
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: 'POST',
            url: baseAppUrl + `user/${appKey}/login`,
            headers: authHeaders,
            data: userData
        })
            .then(handleLoginSuccess)
            .catch(handleErrors);

        function handleLoginSuccess(userData) {
            loadingBox.hide();
            let token = userData._kmd.authtoken;
            sessionStorage.setItem('authToken', token);
            let userId = userData._id;
            sessionStorage.setItem('userId', userId);
            let username = userData.username;
            $('#loggedInUser').text(`Wellcome, ${username}!`);
            $('#loggedInUser').show();
            refreshMenu();
            refreshSections();
            showInfo(`Welcome ${username}!`);
            loadAds();
        }

        clearForm($('#formLogin'));
    }

    function logoutUser() {
        sessionStorage.clear();
        refreshMenu();
        refreshSections();
    }

    function clearForm(targetForm) {
        targetForm.find(`input[name=username], input[name=passwd], 
        input[name=price], textarea[name=description],input[name=title],
        input[name=datePublished],input[name=publisher]`).val('');
    }

    function handleErrors(error) {
        showError(error.statusText);
    }

    function handleSuccess() {
        loadingBox.hide();
        showInfo('Success');
    }

    function fadeOutBox(targetBox) {
        setTimeout(function () {
            targetBox.fadeOut(500);
        }, 2000);
    }

    function showInfo(message) {
        infoBox.text(message);
        infoBox.css('display', 'inline-block');
        fadeOutBox(infoBox);
    }

    function showError(message) {
        loadingBox.hide();
        errorBox.text(message);
        errorBox.show();
        fadeOutBox(errorBox);
    }

    function getKinveyUserAuthHeaders() {
        return {
            'Authorization': "Kinvey " +
            sessionStorage.getItem('authToken'),
        };
    }

    function loadAds() {
        loadingBox.show();
        $.get({
            url: adsUrl,
            headers: getKinveyUserAuthHeaders()
        })
            .then(drawAds)
            .catch(handleErrors);
    }

    function drawAds(adsArray) {
        loadingBox.hide();
        adsView.empty();
        let header = $('<h1>').text('Advertisements').addClass('titleForm');
        let table = $('<table>')
            .append($('<tr>')
                .append(
                    $('<th>').text('Title'),
                    $('<th>').text('Description'),
                    $('<th>').text('Publisher'),
                    $('<th>').text('Price'),
                    $('<th>').text('PublishDate'),
                    $('<th>').text('Actions')
                )
            );

        adsArray.forEach(ad => {
            let newAd = $('<tr>')
                .append(
                    $('<td>').text(ad.title),
                    $('<td>').text(ad.description),
                    $('<td>').text(ad.publisher),
                    $('<td>').text(ad.price),
                    $('<td>').text(ad.publishDate)
                );
            if (ad._acl.creator == sessionStorage.getItem('userId')) {
                newAd.append(
                    $('<td>')
                        .attr('ad_id', ad._id)
                        .append(
                            $('<div>')
                                .addClass('deleteAdButton')
                                .append(
                                    $('<input>')
                                        .attr('type', 'button')
                                )
                                .text('[Delete]'),
                            $('<div>')
                                .addClass('editAdButton')
                                .append(
                                    $('<input>')
                                        .attr('type', 'button')
                                )
                                .text('[Edit]')
                        ));
            } else {
                newAd.append($('<td>')
                    .text('protected'));
            }
            newAd.appendTo(table);
        });
        adsView
            .append(header, table);
    }

    function deleteAd() {
        let adId = $(this).parent().attr('ad_id');
        $.ajax({
            method: 'DELETE',
            url: adsUrl + `/${adId}`,
            headers: getKinveyUserAuthHeaders()
        })
            .then(loadAds)
            .then(handleSuccess)
            .catch(handleErrors);
    }

    function editAd() {
        let adId = $(this).parent().attr('ad_id');
        requestAdById(adId);
        loadingBox.show();
    }

    function requestAdById(adId) {
        $.get({
            url: adsUrl + `/${adId}`,
            headers: getKinveyUserAuthHeaders()
        })
            .then(fillAdDataForEdit)
            .catch(handleErrors)
    }

    function fillAdDataForEdit(ad) {
        loadingBox.hide();
        $('#formEditAd input[name=title]').val(ad.title);
        $('#formEditAd textarea[name=description]').val(ad.description);
        $('#formEditAd input[name=publisher]').val(ad.publisher);
        $('#formEditAd input[name=price]').val(ad.price);
        $('#formEditAd input[name=datePublished]').val(ad.publishDate);
        $('#buttonEditAd').attr('adId', ad._id);
        adsView.hide();
        editAdView.show();
    }

    function updateAd() {
        loadingBox.show();
        let adId = $(this).attr('adId'),
            editedAd = {
                title: $('#formEditAd input[name=title]').val(),
                description: $('#formEditAd textarea[name=description]').val(),
                publisher: $('#formEditAd input[name=publisher]').val(),
                price: $('#formEditAd input[name=price]').val(),
                publishDate: $('#formEditAd input[name=datePublished]').val()
            };

        $.ajax({
            method: 'PUT',
            url: adsUrl + `/${adId}`,
            headers: getKinveyUserAuthHeaders(),
            data: editedAd
        })
            .then(editSuccess)
            .catch(handleErrors);

        function editSuccess() {
            handleSuccess();
            loadingBox.hide();
            refreshSections();
            loadAds();
        }
    }

    function createAd() {
        let newAdd = {
            title: $('#formCreateAd input[name=title]').val(),
            description: $('#formCreateAd textarea[name=description]').val(),
            publisher: $('#formCreateAd input[name=publisher]').val(),
            publishDate: $('#formCreateAd input[name=datePublished]').val(),
            price: $('#formCreateAd input[name=price]').val()
        };

        $.ajax({
            method: 'POST',
            url: adsUrl,
            headers: getKinveyUserAuthHeaders(),
            data: newAdd
        })
            .then(handleSuccess)
            .catch(handleErrors);

        clearForm($('#formCreateAd'));
    }

    $('#menu').on('click', '.menu-item', showSection);
    $('#buttonRegisterUser').on('click', registerUser);
    $('#buttonLoginUser').on('click', loginUser);
    $('#linkListAds').on('click', loadAds);
    $('#buttonCreateAd').on('click', createAd);
    logoutLink.on('click', logoutUser);
    adsView.on('click', '.deleteAdButton', deleteAd);
    adsView.on('click', '.editAdButton', editAd);
    $('#buttonEditAd').on('click', updateAd);

    refreshMenu();
    showSection.call({id: 'linkHome'});
}