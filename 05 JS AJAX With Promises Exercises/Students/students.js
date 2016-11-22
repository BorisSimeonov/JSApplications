function attachEventsAndPopulate() {
    const studentTableUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/students',
        username = 'guest',
        password = 'guest',
        base64auth = btoa(`${username}:${password}`),
        authHeaders = {'Authorization': `Basic ${base64auth}`},
        table = $('#results');

    let studentID = $('#studentID'),
        studentFirstName = $('#FirstName'),
        studentLastName = $('#LastName'),
        studentFacNumber = $('#FacultyNumber'),
        studentGrade = $('#Grade');

    $('#submitStudent').on('click', createStudentInKinvey);

    function getStudents() {
        table.empty();
        clearInputData();
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
        studentsArray = studentsArray.sort( (a, b) => {
           return a.ID - b.ID;
        });
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
        let newStudent = getNewStudentData();

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

    function getNewStudentData() {
        let ID = studentID.val(),
            FirstName = studentFirstName.val(),
            LastName = studentLastName.val(),
            FacultyNumber = studentFacNumber.val(),
            Grade = studentGrade.val();

        if(ID && FirstName && LastName && FacultyNumber && Grade) {
            return {
                ID: Number(ID),
                FirstName: FirstName,
                LastName: LastName,
                FacultyNumber: FacultyNumber,
                Grade: Number(Grade)
            }
        } else {
            throw new TypeError('Empty input field');
        }
    }

    function clearInputData() {
        studentID.val('');
        studentFirstName.val('');
        studentLastName.val('');
        studentFacNumber.val('');
        studentGrade.val('');
    }

    function displayError(error) {
        console.log(`Error: ${error.status} (${error.statusText})`);
    }

    getStudents();
}