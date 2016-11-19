function attachEvents() {
    const baseBooksUrl = 'https://baas.kinvey.com/appdata/kid_ByfiqqTWe/books',
        username = 'guest',
        password = username,
        base64auth = btoa(`${username}:${password}`),
        authHeaders = {"Authorization": "Basic " + base64auth},
        bookContainer = $('#book-container'),
        addForm = $('#addForm'),
        addButton = $('#add-btn'),
        loadButton = $('#load-btn');

    addButton.click(addNewBook);
    loadButton.click(loadAllBooks);
    bookContainer.on('click', '.delete', deleteBook);
    bookContainer.on('click', '.update', updateBook);


   function addNewBook() {
        let book = createBookInstance();
        $.ajax({
            method: 'POST',
            url: baseBooksUrl,
            headers: authHeaders,
            contentType: 'application/json',
            data: JSON.stringify(book)
        })
            .then(clearForm)
            .then(loadAllBooks)
            .catch(errorHandler)
    }

    function createBookInstance() {
        let newBook = new Book(
            addForm.find('.title').val(),
            addForm.find('.author').val(),
            addForm.find('.isbn').val()
        );

        return newBook;
    }

    function parseBookResponses(responses) {
        for (let response of responses) {
            drawBookData(response);
        }
    }

    function drawBookData(bookObject) {
        let bookHTML = buildBookHTML(bookObject);
        bookContainer.append(bookHTML);
    }

    function loadAllBooks() {
        bookContainer.empty();
        $.get({
            url: baseBooksUrl,
            headers: authHeaders
        })
            .then(parseBookResponses)
            .catch(errorHandler);
    }

    function buildBookHTML(bookObject) {
        let baseDiv = $('<div>')
            .addClass('book')
            .attr('book-id', bookObject._id);
        //Title
        baseDiv.append($('<label>')
            .text('Title'));
        baseDiv.append($('<input>')
            .addClass('title')
            .attr('type', 'text')
            .val(bookObject.title));
        //Author
        baseDiv.append($('<label>')
            .text('Author'));
        baseDiv.append($('<input>')
            .addClass('author')
            .attr('type', 'text')
            .val(bookObject.author));
        //ISBN
        baseDiv.append($('<label>')
            .text('ISBN'));
        baseDiv.append($('<input>')
            .addClass('isbn')
            .attr('type', 'number')
            .val(bookObject.isbn));
        //Controls
        baseDiv.append($('<button>')
            .addClass('update')
            .text('Update'));
        baseDiv.append($('<button>')
            .addClass('delete')
            .text('Delete'));

        return baseDiv;
    }

    function clearForm() {
        addForm.find('input').val('');
    }

    function errorHandler(err) {
        console.log(`Error: ${err.status} (${err.statusText})`);
    }

    function deleteBook() {
        let holderDiv = $(this).parent(),
            bookId = holderDiv.attr('book-id');

        $.ajax({
            method: 'DELETE',
            url: baseBooksUrl + '/' + bookId,
            headers: authHeaders
        })
            .then(loadAllBooks)
            .catch(errorHandler);
    }

    function updateBook() {
        let holderDiv = $(this).parent(),
            bookId = holderDiv.attr('book-id');

        let updatedBook = new Book(
            holderDiv.find('.title').val(),
            holderDiv.find('.author').val(),
            holderDiv.find('.isbn').val()
        );

        $.ajax({
            method: 'PUT',
            url: baseBooksUrl + '/' + bookId,
            headers: authHeaders,
            data: JSON.stringify(updatedBook),
            contentType: 'application/json'
        })
            .then(loadAllBooks)
            .catch(errorHandler);
    }
}