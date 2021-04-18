'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
//const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };
//const client = new pg.Client(options);

const methodOverride = require('method-override');

// setupes
const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(methodOverride('_method'));



// routes

app.get('/', indexHandler);

app.get('/test', locationHandler);

function indexHandler(req, res) {
    res.render('pages/index');
}



function locationHandler(req, res) {

    let keyVal = process.env.PIXABAY_KEY;

    console.log(req.query.text);

    let text = req.query.text;

    let keyVal2 = process.env.LOCATION_KEY;

    let arr = [];
    let latAndLon = getLatAndLon(keyVal2, text)
        .then(data => {
            console.log('data', data)
            let lat = data.latitude;
            let lon = data.longitude;
            console.log('lat', lat);
            let map = getMap(keyVal2, lat, lon);
            arr.push(data, map);
            return getPhoto(keyVal, text)
                .then(nnata => {
                    console.log('nnata', nnata);
                    let idx = Math.floor(Math.random() * 10 + 1);
                    if (idx > (nnata.length - 1)) {
                        console.log('nnata.length', nnata.length);
                        arr.push(nnata);
                    } else {
                        arr.push(nnata[idx]);
                    }
                    console.log('arrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    console.log('arrrr', arr, nnata);
                    res.render('pages/test', { allData: arr });
                })
        });
    .catch (error => {
        //console.log('Error in getting data from Google Books server')
        console.error(error);
        //res.render('pages/error', { errors: error });
    })

}

function getLatAndLon(keyVal2, text) {
    let locationURL = `https://eu1.locationiq.com/v1/search.php?key=${keyVal2}&q=${text}&format=json`;

    return superagent.get(locationURL)
        .then(locationData => {
            console.log('getLatAndLon', locationData.body);

            let locData = locationData.body;
            const newLocationData = new Location(text, locData);
            return newLocationData;
        })
        .catch(error => {
            //console.log('Error in getting data from Google Books server')
            console.error(error);
            //res.render('pages/error', { errors: error });
        })
}


function getMap(keyVal2, lat, lon) {
    let width = 200;
    let height = 200;
    let mapURL = `https://maps.locationiq.com/v2/staticmap?key=${keyVal2}&center=${lat},${lon}&size=${width}x${height}&zoom=12`
    console.log('tessssssssssssssssssssssssst');
    console.log(lat, lon, mapURL);
    return mapURL;
}

function getPhoto(keyVal, text) {
    let pixabayURL = `https://pixabay.com/api/?key=${keyVal}&q=${text}&per_page=10`;
    return superagent.get(pixabayURL)
        .then(pixabayData => {
            console.log('getPhoto', pixabayData.body.hits);
            let data = pixabayData.body.hits.map(val => {
                const newPhoto = new CityPhoto(
                    val.webformatURL
                );
                return newPhoto;
            });
            return data;
        })
        .catch(error => {
            //console.log('Error in getting data from Google Books server')
            console.error(error);
            //res.render('pages/error', { errors: error });
        })
};









//constructors
const CityPhoto = function (photoLink) {
    //console.log('CityPhoto', photoLink);
    this.photoLink = photoLink;
    CityPhoto.all.push(this);
};
CityPhoto.all = [];

function Location(cityName, locData) {
    //console.log('Location', locData);
    /*     {
            "search_query": "seattle",
            "formatted_query": "Seattle, WA, USA",
            "latitude": "47.606210",
            "longitude": "-122.332071"
        } */

    this.search_query = cityName;
    this.formatted_query = locData[0].display_name;
    this.latitude = locData[0].lat;
    this.longitude = locData[0].lon;

}
function Map(locData) {
    //console.log('locData', locData);
    /*     {
            "search_query": "seattle",
            "formatted_query": "Seattle, WA, USA",
            "latitude": "47.606210",
            "longitude": "-122.332071"
        } */

    //this.search_query = cityName;
    // this.formatted_query = locData[0].display_name;
    // this.latitude = locData[0].lat;
    // this.longitude = locData[0].lon;

}

//listen


/* client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
  }); */


// unfound route
app.get('*', (req, res) => res.status(404).send('This route does not exist'));



app.listen(PORT, () => console.log(`Listening on port ${PORT}`));