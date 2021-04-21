'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };
const Client = new pg.Client(options);

const methodOverride = require('method-override');
const { forEach, result } = require('underscore');

// setupes
const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(methodOverride('_method'));

// routes

app.get('/', (req, res) => {
  res.render('pages/index');
  //res.send('your server ready to use !!');
});

app.get('/search', allApiHandler);

// app.get('/covid', covidHandler);

//DataBase Route
app.get('/saveData', saveDataHandler);
app.get('/allSavedData', allSavedDataHandler);
// app.post('/details/:PlanID', showPlanDetails);
app.get('/details/:PlanID', showPlanDetails);
app.put('/updatePlan/:planID', updatePlanHandler);
app.delete('/deletePlan/:planID', deletePlanHandler);

// function handler

function allApiHandler(req, res) {
  let appAPiArr = [];


  // console.log('allApiHandler');
  // console.log(req.query);
  let SQL = 'SELECT id FROM city WHERE city =$1;';
  let safeValue = [req.query.search];
  Client.query(SQL, safeValue).then(data => {
    console.log(!(data.rows.length));
    if (!(data.rows.length)) {
      let SQL = 'insert into city (city) values($1) returning id;';
      let safevalue = [req.query.search];
      Client.query(SQL, safevalue).then(data0 => {
        console.log(data0.rows[0].id);
        let a = locationHandler(req, res, data0.rows[0].id)
          .then(data1 => {
            // console.log('inside-locationHandler------------', data1);
            appAPiArr.push(data1);
            let b = findHotelsHandler(req, res, data0.rows[0].id)
              .then(data2 => {
                // console.log('inside-weatherHandler------------', data2);
                appAPiArr.push(data2);
                let c = findTransportHandler(req, res, data0.rows[0].id)
                  .then(data3 => {
                    console.log('inside-findHotelsHandler------------', data3);
                    appAPiArr.push(data3);
                    let d = weatherHandler(req, res)
                      .then(data4 => {
                        // console.log('inside-findTransportHandler------------', data4);
                        appAPiArr.push(data4);
                        // console.log('1111111111111111111111111111111111111111111111111', data2.country);
                        // console.log(data2.country);
                        let f = covidHandler(data4.country)
                          .then(data5 => {
                            // console.log('inside-covidHandler------------', data5);
                            appAPiArr.push(data5);
                            res.render('pages/result', { apiAll: appAPiArr });
                          });
                      });
                  });
              });
          });
      });
    }
    else {
      let id = data.rows[0].id;
      console.log('ttttttttt', id);
      let SQL = 'select * from city as c join locationdata as l on l.city_id = c.id where c.id =$1;';
      let safevalue = [data.rows[0].id];
      Client.query(SQL, safevalue).then(result => {
        appAPiArr.push(result.rows[0]);
      });
      let sql = 'select * from city as c join hoteldata as h on h.city_id=c.id where c.id =$1;';
      let safeval = [data.rows[0].id];
      Client.query(sql, safeval)
        .then(result1 => {
          appAPiArr.push(result1.rows);
        });
      let sql1 = 'select * from city as c join transportdata as t on t.city_id = c.id where c.id =$1;';
      let safevalu = [data.rows[0].id];
      Client.query(sql1, safevalu)
        .then(result2 => {
          appAPiArr.push(result2.rows);
        });
      let b = weatherHandler(req, res)
        .then(data2 => {
          // console.log('inside-weatherHandler------------', data2);
          appAPiArr.push(data2);
          let f = covidHandler(data2.country)
            .then(data5 => {
              // console.log('inside-covidHandler------------', data5);
              appAPiArr.push(data5);
              res.render('pages/result', { apiAll: appAPiArr });
            });
        });
    }


  });
}


function locationHandler(req, res, id) {
  // console.log('----------------------------------------------------------------------------------');
  // console.log('locationHandler');
  let keyVal = process.env.PIXABAY_KEY;

  // console.log(req.query.text);

  let text = req.query.search;

  let keyVal2 = process.env.LOCATION_KEY;

  let arr = [];
  return getLatAndLon(keyVal2, text)
    .then(data => {
      //console.log('data', data)
      //let map_url = { map_url: getMap(keyVal2, data.latitude, data.longitude) };
      let map_photo = getMap(keyVal2, data.latitude, data.longitude);
      //arr.push(map_url);
      return getPhoto(keyVal, text)
        .then(nnata => {
          console.log('nnata', nnata);
          let photoData;
          let idx = Math.floor(Math.random() * 10);
          let location;
          if (nnata.length && idx > (nnata.length - 1)) {
            photoData = nnata;
            location = { map_url: map_photo, city_url: photoData[idx].city_url };
            arr.push(location);
          } else {
            photoData = 'https://i.pinimg.com/originals/55/c7/8a/55c78aa24fb722350d6832301e973ba4.png';
            location = { map_url: map_photo, city_url: photoData };
            arr.push(location);
          }
          // let map_url = arr[0].map_photo;
          // let city_url = arr[0].city_url;
          let map_url = location.map_url;
          let city_url = location.city_url;
          console.log('city', city_url);
          console.log('location', location);
          let SQL = 'INSERT INTO locationdata ( map_url , city_url,city_id) VALUES ($1,$2,$3);';
          let safeValues = [map_url, city_url, id];
          Client.query(SQL, safeValues).then(data => console.log('done'));

          // console.log('arrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
          // console.log('arrrr', arr, nnata);
          //res.render('pages/test', { allData: arr });
          return location;
        })

        .catch(error => {
          //console.log('Error in getting data from Google Books server')
          console.error(error);
          //res.render('pages/error', { errors: error });
        });
    });
  //return latAndLon;
}


function getLatAndLon(keyVal2, text) {
  let locationURL = `https://eu1.locationiq.com/v1/search.php?key=${keyVal2}&q=${text}&format=json`;

  return superagent.get(locationURL)
    .then(locationData => {
      //console.log('getLatAndLon', locationData.body);

      let locData = locationData.body;
      const newLocationData = new Location(text, locData);
      return newLocationData;
    })
    .catch(error => {
      //console.log('Error in getting data from Google Books server')
      console.error(error);
      //res.render('pages/error', { errors: error });
    });
}


function getMap(keyVal2, lat, lon) {
  let width = 200;
  let height = 200;
  let map_url = `https://maps.locationiq.com/v2/staticmap?key=${keyVal2}&center=${lat},${lon}&size=${width}x${height}&zoom=12`;
  return map_url;
}

function getPhoto(keyVal, text) {
  let pixabayURL = `https://pixabay.com/api/?key=${keyVal}&q=${text}&per_page=10`;
  return superagent.get(pixabayURL)
    .then(pixabayData => {
      let data = pixabayData.body.hits.map(val => {
        const newPhoto = new CityPhoto(val.webformatURL);
        return newPhoto;
      });
      return data;
    })
    .catch(error => {
      //console.log('Error in getting data from Google Books server')
      console.error(error);
      //res.render('pages/error', { errors: error });
    });
}


function weatherHandler(req, res) {
  // console.log('----------------------------------------------------------------------------------');
  // console.log('weatherHandler');
  let key = process.env.WEATHER_KEY;
  let cityName = req.query.search;
  cityName.charAt(0).toUpperCase() + cityName.slice(1);
  let url = `http://api.weatherstack.com/current?access_key=${key}&query=${cityName}`;
  return superagent(url)
    .then(result => {
      let dataWeather = result.body;
      // console.log(dataWeather);
      let myData = new Weather(dataWeather);
      // console.log('fffffffffffffffffffffff');

      //res.render('pages/test', { bookDataArray: myData });
      // res.send(myData);
      return myData;
    });
  // res.send('your server work');
}


function findHotelsHandler(req, res, id) {
  // console.log('----------------------------------------------------------------------------------');
  // console.log('locationHandler');
  let hotelsArray = [];
  let cityName = req.query.search;
  let hotelsKey = process.env.HOTELS_KEY;
  let hotelsURL = `https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=${cityName}&rapidapi-key=${hotelsKey}`;
  let photoKey = process.env.PIXABAY_KEY;
  return superagent.get(hotelsURL) //send request to weatherbit.io API
    .then(geoData => {
      // console.log('inside superagent');
      // console.log(geoData);
      // let gData= geoData.body.searchResults.results;
      let gData = geoData.body.suggestions[1].entities;

      gData.map(val => {
        let imagLink = getPhoto(photoKey, val.name)
          .then(data => {
            const newHotel = new Hotel(val, data);
            hotelsArray.push(newHotel);
            console.log('cccccccccccccccccccccccc', id);
            let SQL = 'INSERT INTO hoteldata ( hotel_image, hotel_name , hotel_price , hotel_rate,city_id) VALUES ($1,$2,$3,$4,$5);';
            let safeValues = [newHotel.hotel_image, newHotel.hotel_name, newHotel.hotel_price, newHotel.hotel_rate, id];
            Client.query(SQL, safeValues).then(data => console.log('Hotel-done'));

          });

      });
      //res.send(hotelsArray);
      console.log('beforeReturn', hotelsArray);
      return hotelsArray;

    })

    .catch(error => {
      // console.log('inside superagent');
      // console.log('Error in getting data from hotels server');
      console.error(error);
      //res.send(error);
    });
  // console.log('after superagent');
}


function findTransportHandler(req, res, id) {
  let transArray = [];
  let cityName = req.query.search;
  let transKey = process.env.TRANS_KEY;
  let hotelsURL = `https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=${cityName}&rapidapi-key=${transKey}`;
  return superagent.get(hotelsURL) //send request to weatherbit.io API
    .then(geoData => {
      // console.log('----------------------------------------------------------------------------------');
      // console.log('insigeoDatade superagent');
      // console.log(geoData);
      // let gData= geoData.body.searchResults.results;
      let gData = geoData.body.suggestions[3].entities;
      gData.map(val => {
        const newTrans = new Transport(val);
        transArray.push(newTrans);
        //console.log(id, 'transCheck', (newTrans));
        if (Object.keys(newTrans).length) {
          let SQL = 'INSERT INTO transportdata ( station_name, station_type , transport_price,city_id) VALUES ($1,$2,$3,$4);';
          let safeValues = [newTrans.station_name, newTrans.station_type, newTrans.transport_price, id];
          Client.query(SQL, safeValues).then(data => console.log('done'));
        } else {
          let SQL = 'INSERT INTO transportdata ( station_name, station_type , transport_price,city_id) VALUES ($1,$2,$3,$4);';
          let safeValues = ['Not available', 'Not available', 'Not available', id];
          Client.query(SQL, safeValues).then(data => console.log('done'));
        }

      });
      //res.send(transArray);
      return transArray;
    })
    .catch(error => {
      // console.log('inside superagent');
      // console.log('Error in getting data from hotels server');
      console.error(error);
      //res.send(error);
    });
  // console.log('after superagent');
}



function covidHandler(req) {
  let countryName;
  if (req === 'United States of America') {
    countryName = 'US';
  } else {
    countryName = req;
  }
  console.log(countryName);
  let capitlizedCountry = countryName.charAt(0).toUpperCase() + countryName.slice(1);
  let url = `https://covid-api.mmediagroup.fr/v1/cases?country=${capitlizedCountry}`;
  return superagent.get(url)
    .then(result => {
      // console
      let gettedData = result.body.All;
      let newCountry = new Covid(gettedData);
      //res.render('../push/Mostafa/h', { countryobj: newCountry });
      return newCountry;
    });
}



// DataBase Functions

function saveDataHandler(req, res) {
console.log('request query --------------------------------',req.query);
  let { city, map_url, city_url, time, hotel_name, hotel_price, hotel_rate, hotel_img, station_name, station_type, transport_price } = req.query;
  console.log('city_name',city);
  let SQL = `INSERT INTO booking (city, map_url, city_url, time, hotel_name, hotel_price, hotel_rate, hotel_img, station_name, station_type, transport_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`;
  let safeValues = [city, map_url, city_url, time, hotel_name[1], hotel_price, hotel_rate, hotel_img, station_name[1], station_type, transport_price];
  Client.query(SQL, safeValues)
    .then(data => {
      res.redirect('/allSavedData');
    });
}

function allSavedDataHandler(req, res) {
  let SQL = 'SELECT * FROM booking;';
  Client.query(SQL)
    .then(data => {
      console.log('selectdata', data.rows);
      res.render('pages/saved', { bookingData: data.rows });
    });
}

function deletePlanHandler(req, res) {
  let SQL = `DELETE FROM booking WHERE id=$1;`;
  let value = [req.params.planID];
  Client.query(SQL, value)
    .then(res.redirect(`/allSavedData`));
  // res.render(`pages/saved`,{obj:safeValues});

}

function showPlanDetails(req, res) {
  let SQL = `SELECT * FROM booking WHERE id=$1;`;
  // console.log('request',req.query,req.params.PlanID);
  let value = [req.params.PlanID];
  Client.query(SQL, value)
    .then((result) => {
      console.log('showPlanDetails', result.rows[0]);
      res.render('pages/details', { plan: result.rows[0] });
    });
}

function updatePlanHandler(req, res) {
  console.log('req.body -----------------------',req.body);
  let { city, time, hotel_name, station_name, station_type,id } = req.body;
  let SQL = `UPDATE booking SET city=$1,time=$2,hotel_name=$3,station_name=$4,station_type=$5 WHERE id=$6;`;
  let safeValues = [city, time, hotel_name, station_name, station_type,id];
  console.log('sssssssssssssssssssssssssssssssss',safeValues);
  Client.query(SQL, safeValues)
    .then(() => {
      console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
      // res.redirect(`/`);
      // res.render(`pages/saved`,{obj:safeValues});
      res.redirect(`/details/${id}`);


    }).catch(error => {
      res.send(error);
    });

}


//constructors
function Covid(covidData) {
  this.country = covidData.country;
  this.population = covidData.population;
  this.confirmed = covidData.confirmed;
  this.recovered = covidData.recovered;
  this.deaths = covidData.deaths;
  this.updated = (covidData.updated) ? covidData.updated : 'NO DATA';
}

const CityPhoto = function (photoLink) {
  //console.log('CityPhoto', photoLink);
  console.log('photoLink', photoLink);
  this.city_url = photoLink;
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

function Weather(result) {
  this.cityName = result.location.name;
  this.country = result.location.country;
  this.time = result.location.localtime;
  this.temperature = result.current.temperature;
  this.weather_icons = result.current.weather_icons;
  this.weather_descriptions = result.current.weather_descriptions;
}

function Hotel(hotelData, data) {

  console.log('----------------------------------------------------------------------------------');
  console.log('Hotel');
  let notFoundHotelImage = [
    'https://image.freepik.com/free-vector/lifestyle-hotel-illustration_335657-398.jpg',
    'https://image.freepik.com/free-vector/hotel-illustration_146998-4071.jpg',
    'https://image.freepik.com/free-vector/flat-hotel-building-illustration_23-2148147347.jpg',
    'https://thumbs.dreamstime.com/b/find-hotel-search-hotels-concept-smartphone-maps-gps-location-building-team-people-modern-flat-style-vector-147792003.jpg',
    'https://st3.depositphotos.com/4243515/14466/v/600/depositphotos_144663615-stock-illustration-cartoon-hotel-icon.jpg'
  ];
  let minRate = 1;
  let maxRate = 5;
  let minPrice = 20;
  let maxPrice = 300;
  let idx = Math.floor(Math.random() * 5);
  this.hotel_name = hotelData.name;
  this.hotel_image = (data.length) ? data[0].city_url : notFoundHotelImage[idx];
  this.hotel_rate = Math.floor(Math.random() * (maxRate - minRate) + minRate);
  this.hotel_price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
  console.log('this.name--->', this.hotel_name, 'this.imageLinks---->', this.hotel_image, this.hotel_rate, this.hotel_price);
}


function Transport(transData) {
  let minPrice = 10;
  let maxPrice = 50;
  this.station_name = transData.name;
  this.station_type = transData.type;
  this.transport_price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
}


// unfound route
app.get('*', (req, res) => res.status(404).send('This route does not exist'));


//listen
Client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
  });

// add dev branch
