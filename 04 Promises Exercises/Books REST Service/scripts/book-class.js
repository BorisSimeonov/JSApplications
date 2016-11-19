class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.tags = [];
    }

    addTag(newTag) {
        this.tags.push(newTag);
        return this;
    }

    toString() {
        return `Title: ${this.title}\nAuthor: ${this.author}\nISBN: ${this.isbn}\nTags: ${this.tags.join(', ')}`;
    }
}

/*let book = new Book('asd', 'asd', 'asds');
book.addTag('romance')
    .addTag('horror');

console.log(book.toString());
console.log(book.tags);*/
