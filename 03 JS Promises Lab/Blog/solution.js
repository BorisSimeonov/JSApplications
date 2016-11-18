function attachEvents() {
    const kinveyAppId = 'kid_S1ps_9jWg',
        serviceUrl = `https://baas.kinvey.com/appdata/${kinveyAppId}`,
        username = 'peter',
        password = 'p',
        base64auth = btoa(username + ':' + password),
        authHeaders = {"Authorization": 'Basic ' + base64auth},
        dropdown = $('#posts');


    $('#btnLoadPosts').on('click', loadClickHandler);
    $('#btnViewPost').on('click', viewClickHandler);

    function loadClickHandler() {
        let getPostsRequest = {
            url: serviceUrl + '/posts',
            headers: authHeaders
        };
        $.ajax(getPostsRequest)
            .then(displayPostsInDropdown)
            .catch(displayError);
    }

    function viewClickHandler() {
        let selectedValue = dropdown.val();
        let getPostRequest = $.ajax({
            url: serviceUrl + '/posts/' + selectedValue,
            headers: authHeaders
        });
        getPostRequest
            .then(displayPostData)
            .catch(displayError);
    }

    function displayPostsInDropdown(posts) {
        dropdown.empty();
        for (let post of posts) {
            let option = $('<option>')
                .val(post._id)
                .text(post.title);
            dropdown.append(option);
        }
    }

    function displayError(error) {
        let errorText = `Error: ${error.status} (${error.statusText})`,
            errorDiv = $('<div>');

        errorDiv.text(errorText);
        $(document.body).prepend(errorDiv);

        setTimeout(function () {
            errorDiv.fadeOut(() => {
                errorDiv.remove();
            });
        }, 2000);
    }

    function displayPostData(post) {
        $('#post-title').text(post.title);
        $('#post-body').text(post.body);
        requestComments(post._id);
    }

    function requestComments(postId) {
        let getCommentsRequest = $.ajax({
            method: 'GET',
            url: `${serviceUrl}/comments?query={"post_id":"${postId}"}`,
            headers: authHeaders
        });
        getCommentsRequest
            .then(displayComment)
            .catch(displayError);
    }

    function displayComment(comments) {
        for (let comment of comments) {
            let newListItem = $('<li>')
                .text(comment.text);
            $('#post-comments')
                .append(newListItem);
        }
    }
}
