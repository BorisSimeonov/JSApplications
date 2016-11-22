function attachEvents() {
    const locationsUrl = 'https://judgetests.firebaseio.com/locations',
        todayForecastUrl = 'https://judgetests.firebaseio.com/forecast/today',
        upcomingForecastUrl = 'https://judgetests.firebaseio.com/forecast/upcoming',
        locationTextbox = $('#location'),
        forecast = $('#forecast'),
        current = $('#current'),
        upcoming = $('#upcoming');

    $('#submit').on('click', getWeather);

    function getWeather() {
        $.get({
            url: `${locationsUrl}.json`
        })
            .then(checkForLocationMatch)
            .catch(displayError);
    }

    function checkForLocationMatch(locationObject) {
        let location = locationTextbox.val();
        for (let item of locationObject) {
            if (item.name === location) {
                requestTodayAndUpcoming(item.code);
                return;
            }
        }
        displayError('Invalid Input: ' + location);
    }

    function requestTodayAndUpcoming(locationCode) {
        let todayForecastRequest = $.get({url: todayForecastUrl + `/${locationCode}.json`});
        let upcomingForecastRequest = $.get({url: upcomingForecastUrl + `/${locationCode}.json`});
        let p = Promise.all([todayForecastRequest, upcomingForecastRequest])
            .then(displayFullForecast)
            .catch(displayError);
    }

    function displayFullForecast([todayObj, upcomingObj]) {
        let todaySymbol = $('<span>')
            .addClass('condition symbol')
            .text(parseToWeatherToSymbol(todayObj.forecast.condition));
        let condition = $('<span>')
            .addClass('condition');
        let locationName = $('<span>')
            .addClass('forecast-data')
            .text(todayObj.name);
        let todayTemperature = $('<span>')
            .addClass('forecast-data')
            .text(temperatureStringBuilder(
                todayObj.forecast.high,
                todayObj.forecast.low
            ));
        let todayWeatherDescription = $('<span>')
            .addClass('forecast-data')
            .text(todayObj.forecast.condition);

        condition
            .append(locationName)
            .append(todayTemperature)
            .append(todayWeatherDescription);

        clearForecast();

        current
            .append(todaySymbol)
            .append(condition);

        for(let dayForecast of upcomingObj.forecast) {
            let upcomingSpan = $('<span>')
                .addClass('upcoming');
            let symbolSpan = $('<span>')
                .addClass('symbol')
                .text(parseToWeatherToSymbol(dayForecast.condition));
            let temperatureSpan = $('<span>')
                .addClass('forecast-data')
                .text(temperatureStringBuilder(dayForecast.high, dayForecast.low));
            let weatherDescriptionSpan = $('<span>')
                .addClass('forecast-data')
                .text(dayForecast.condition);
            upcomingSpan
                .append(symbolSpan)
                .append(temperatureSpan)
                .append(weatherDescriptionSpan);
            upcoming.append(upcomingSpan)
        }


        forecast.attr('style', 'display:inline-block');
    }

    function displayError(error) {
        //console.log(`Error: ${error.status} (${error.statusText})`);
        clearForecast();
        let errorDiv = $('<div>')
            .addClass('error-message')
            .text('Error');
        forecast.append(errorDiv);

        setTimeout(function () {
            errorDiv.fadeOut(() => {
                errorDiv.remove();
            });
        }, 1000);
    }

    function temperatureStringBuilder(highTemp, lowTemp) {
        return `${highTemp}\u00B0/${lowTemp}\u00B0`;
    }

    function parseToWeatherToSymbol(weatherType) {
        weatherType = weatherType.toLowerCase();
        weatherType = weatherType
            .replace(/^sunny$/, '\u2600')
            .replace(/^partly sunny$/, '\u26C5')
            .replace(/^overcast$/, '\u2601')
            .replace(/^rain$/, '\u2614');

        return weatherType;
    }

    function clearForecast() {
        $('#current .condition').remove();
        $('.upcoming').remove();
    }
}