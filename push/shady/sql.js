const { Client } = require("pg");

app.get('/saveData', saveDataHandler);


app.get('/allSavedData', allSavedDataHandler);

function saveDataHandler(req, res) {
    let { city, map_url, hotel_name, station_name, time } = req.query;
    let SQL = `INSERT INTO booking (city, map_url, hotel_name, station_name, time) VALUES ($1, $2, $3, $4, $5);`;
    let safeValues = [city, map_url, hotel_name, station_name, time];
    Client.query(SQL, safeValues)
        .then(data => {
            res.redirect('/allSavedData');
        });
}

function allSavedDataHandler(req, res) {
    let SQL = 'SELECT * FROM booking;';
    Client.query(SQL)
        .then(data => {
            res.render('pages/saved', { bookingData: data });
        });
}
