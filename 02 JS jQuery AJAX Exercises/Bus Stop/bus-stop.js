function getInfo() {
    const bussesList = $('#buses');
    const stopNameHolder = $('#stopName');
    const baseUrl = 'https://judgetests.firebaseio.com/businfo/';
    let busNumber = $('#stopId').val();
    if(busNumber == '') busNumber = undefined;
    const getRequest = {
        method: 'GET',
        url: `${baseUrl}/${busNumber}.json`,
        success: displayData,
        error: displayError
    };

    $.ajax(getRequest);

    function displayData(data) {
        bussesList.empty();
        if(data) {
            stopNameHolder.text(data.name);
            for(let line of Object.keys(data.buses)) {
                let li = $('<li>')
                    .text(`Bus ${line} arrives in ${
                        data.buses[line]} minutes`);
                bussesList.append(li);
            }
        } else {
            displayError();
        }
    }

    function displayError() {
        stopNameHolder.empty().text('Error');
    }
}