(function () {
    const studentTableUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/students',
        username = 'guest',
        password = 'guest',
        base64auth = btoa(`${username}:${password}`),
        authHeaders = {'Authorization': `Basic ${base64auth}`},
        table = $('#results');

    let newStudent = {
        ID: 666,
        FirstName: 'John',
        LastName: 'Doe',
        FacultyNumber: '999',
        Grade: 313
    };

    function getStudents() {
        table.empty();
        $.ajax({
            method: 'GET',
            contentType: 'application/json',
            url: studentTableUrl,
            headers: authHeaders
        })
            .then(parseStudents)
            .catch((err) => console.log(err.status));
    }

    function parseStudents(studentsArray) {
        studentsArray.forEach((student) => drawRow(student));
    }

    function drawRow(student) {
        let row = $('<tr>')
            .append($('<td>')
                .text(student.ID))
            .append($('<td>')
                .text(student.FirstName))
            .append($('<td>')
                .text(student.LastName))
            .append($('<td>')
                .text(student.FacultyNumber))
            .append($('<td>')
                .text(student.Grade));
        table.append(row);
    }

    function createStudentInKinvey() {
        $.ajax({
            method: 'POST',
            url: studentTableUrl,
            headers: authHeaders,
            contentType: 'application/json',
            data: JSON.stringify(newStudent)
        })
            .then(getStudents)
            .catch(displayError);
    }

    function displayError(error) {
        console.log(`Error: ${error.status} (${error.statusText})`);
    }

    createStudentInKinvey();
})();