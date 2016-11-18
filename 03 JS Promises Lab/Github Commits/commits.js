function loadCommits() {
    const userName = $('#username').val(),
        repository = $('#repo').val(),
        targetUrl = `https://api.github.com/repos/${userName}/${repository}/commits`;
    const ul = $('#commits');

    $.get({
        url: targetUrl,
        success: displayResultInUl,
        error: errorHandler
    });

    function displayResultInUl(data) {
        clearResults();
        for (let key of Object.keys(data)) {
            appendLi(data[key].commit.author.name,
                data[key].commit.message);
        }
    }

    function errorHandler(data, ...items) {
        clearResults();
        appendLi("Error", `${data.status} (${items[1]})`)
    }

    function appendLi(name, text) {
        let li = $('<li>')
            .text(`${name}: ${text}`);
        ul.append(li);
    }

    function clearResults() {
        ul.empty();
    }
}