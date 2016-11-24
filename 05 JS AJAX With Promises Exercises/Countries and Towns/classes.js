class Country {
    constructor(name) {
        this.name = name;
    }
}

class Town {
    constructor(name, country) {
        if(country.constructor !== Country) {
            throw new TypeError('Argument two must be instance of Country class.');
        }
        this.name = name;
    }
}