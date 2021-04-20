'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };
const client = new pg.Client(options);

const methodOverride = require('method-override');

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

app.get('/covid', covidHandler);

// function handler


function allApiHandler(req, res) {
  let appAPiArr = [];

  console.log('allApiHandler');
  console.log(req.query);
  let a = locationHandler(req, res)
    .then(data1 => {
      console.log('inside-locationHandler------------', data1);
      appAPiArr.push(data1);
      let b = weatherHandler(req, res)
        .then(data2 => {
          console.log('inside-weatherHandler------------', data2);
          appAPiArr.push(data2);
          let c = findHotelsHandler(req, res)
            .then(data3 => {
              console.log('inside-findHotelsHandler------------', data3);
              appAPiArr.push(data3);
              let d = findTransportHandler(req, res)
                .then(data4 => {
                  console.log('inside-findTransportHandler------------', data4);
                  appAPiArr.push(data4);
                  console.log('1111111111111111111111111111111111111111111111111', data2.country);
                  let f = covidHandler(data2.country)
                    .then(data5 => {
                      console.log('inside-covidHandler------------', data5);
                      appAPiArr.push(data5);
                      res.render('pages/result', { apiAll: appAPiArr });
                    });
                });
            });
        });
    });
  console.log('**********************');
  // findHotelsHandler(req, res)
  //   .then(data1 => {

  //     console.log('locationHandler');
  //     // appAPiArr.push(data1);

  //     // console.log('data1', data1);
  //     return data1;
  //   })
  // findHotelsHandler(req, res);
  // findTransportHandler(req, res);
  // covidHandler(req, res);


}


function locationHandler(req, res) {

    console.log('----------------------------------------------------------------------------------');
    console.log('locationHandler');
    let keyVal = process.env.PIXABAY_KEY;

    console.log(req.query.text);

    let text = req.query.search;

    let keyVal2 = process.env.LOCATION_KEY;

    let arr = [];
    return getLatAndLon(keyVal2, text)
        .then(data => {
            //console.log('data', data)
            let map = getMap(keyVal2, data.latitude, data.longitude);
            arr.push(data, map);
            return getPhoto(keyVal, text)
                .then(nnata => {
                    //console.log('nnata', nnata);
                    let idx = Math.floor(Math.random() * 10);
                    if (idx > (nnata.length - 1)) {
                        //console.log('nnata.length', nnata.length);
                        //console.log('sdsdds', arr);
                        arr.push(nnata);
                    } else {
                        arr.push(nnata[idx]);
                        //console.log('sdsdds', arr);
                    }
                    //console.log('arrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    //console.log('arrrr', arr, nnata);
                    //res.render('pages/test', { allData: arr });
                    return arr;
                })
                .catch(error => {
                    //console.log('Error in getting data from Google Books server')
                    console.error(error);
                    //res.render('pages/error', { errors: error });
                });
        });
    });
  //return latAndLon;
}

// function locationHandler(req) {

//   let keyVal = process.env.PIXABAY_KEY;

//   console.log('-------------------------------------------------------------', req);

//   let text = req;

//   let keyVal2 = process.env.LOCATION_KEY;

//   let arr = [];
//   let latAndLon = getLatAndLon(keyVal2, text)
//     .then(data => {
//       //console.log('data', data)
//       //console.log('lat', lat);
//       let map = getMap(keyVal2, data.latitude, data.longitude);
//       arr.push(data, map);
//       return getPhoto(keyVal, text)
//         .then(nnata => {
//           //console.log('nnata', nnata);
//           let idx = Math.floor(Math.random() * 10 + 1);
//           if (idx > (nnata.length - 1)) {
//             //console.log('nnata.length', nnata.length);
//             arr.push(nnata);
//           } else {
//             arr.push(nnata[idx]);
//           }
//           //console.log('arrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
//           //console.log('arrrr', arr, nnata);
//           //res.render('pages/test', { allData: arr });
//         })
//         .catch(error => {
//           //console.log('Error in getting data from Google Books server')
//           console.error(error);
//           //res.render('pages/error', { errors: error });
//         });
//     });

// }

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
  let mapURL = `https://maps.locationiq.com/v2/staticmap?key=${keyVal2}&center=${lat},${lon}&size=${width}x${height}&zoom=12`;
  return mapURL;
}

function getPhoto(keyVal, text) {
  let pixabayURL = `https://pixabay.com/api/?key=${keyVal}&q=${text}&per_page=10`;
  return superagent.get(pixabayURL)
    .then(pixabayData => {
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
    });
}


function weatherHandler(req, res) {
  console.log('----------------------------------------------------------------------------------');
  console.log('weatherHandler');
  let key = process.env.WEATHER_KEY;
  let cityName = req.query.search;
  cityName.charAt(0).toUpperCase() + cityName.slice(1);
  let url = `http://api.weatherstack.com/current?access_key=${key}&query=${cityName}`;
  return superagent(url)
    .then(result => {
      let dataWeather = result.body;
      console.log(dataWeather);
      let myData = new Weather(dataWeather);
      console.log('fffffffffffffffffffffff');

      //res.render('pages/test', { bookDataArray: myData });
      // res.send(myData);
      return myData;
    });
  // res.send('your server work');
}


function findHotelsHandler(req, res) {

    console.log('----------------------------------------------------------------------------------');
    console.log('locationHandler');
    let hotelsArray = [];
    let cityName = req.query.search;
    let hotelsKey = process.env.HOTELS_KEY;
    let photoKey = process.env.PIXABAY_KEY;
    let hotelsURL = `https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=${cityName}&rapidapi-key=${hotelsKey}`;
    return superagent.get(hotelsURL) //send request to weatherbit.io API
        .then(geoData => {
            console.log('inside superagent');
            // console.log(geoData);
            // let gData= geoData.body.searchResults.results;
            let gData = geoData.body.suggestions[1].entities;

            gData.map(val => {
                let imagLink = getPhoto(photoKey, val.name)
                    .then(data => {
                        const newHotel = new Hotel(val, data);
                        console.log('newHotel', newHotel);
                        hotelsArray.push(newHotel);
                        console.log('hotelsArray', hotelsArray);
                    })

            });
            //res.send(hotelsArray);
            console.log('gData', gData);
            return hotelsArray;

        })

        .catch(error => {
            console.log('inside superagent');
            console.log('Error in getting data from hotels server');
            console.error(error);
            //res.send(error);
        });
    console.log('after superagent');
}


function findTransportHandler(req, res) {
  let transArray = [];
  let cityName = req.query.search;
  let transKey = process.env.TRANS_KEY;
  let hotelsURL = `https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=${cityName}&rapidapi-key=${transKey}`;
  return superagent.get(hotelsURL) //send request to weatherbit.io API
    .then(geoData => {
      console.log('----------------------------------------------------------------------------------');
      console.log('insigeoDatade superagent');
      // console.log(geoData);
      // let gData= geoData.body.searchResults.results;
      let gData = geoData.body.suggestions[3].entities;
      gData.map(val => {
        const newTrans = new Transport(val);
        transArray.push(newTrans);
      });
      //res.send(transArray);
      return gData;
    })
    .catch(error => {
      console.log('inside superagent');
      console.log('Error in getting data from hotels server');
      console.error(error);
      //res.send(error);
    });
  console.log('after superagent');
}



function covidHandler(req) {
  let countryName = req;
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







//constructors
function Covid(covidData) {
  this.country = covidData.country;
  this.population = covidData.population;
  this.confirmed = covidData.confirmed;
  this.recovered = covidData.recovered;
  this.deaths = covidData.deaths;
  this.updated = covidData.updated;
}

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
    this.name = hotelData.name;
    this.imageLinks = (data.length) ? data[0].photoLink : notFoundHotelImage[idx];
    this.rate = Math.floor(Math.random() * (maxRate - minRate) + minRate);
    this.price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
    console.log('this.name--->', this.name, 'this.imageLinks---->', this.imageLinks, this.rate, this.price);
}


function Transport(transData) {
  let minPrice = 10;
  let maxPrice = 50;
  this.name = transData.name;
  this.type = transData.type;
  this.price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
}

// let ctx = document.getElementById( 'myChart' ).getContext( '2d' );
// new Chart( ctx, {
//   type: 'bar',
//   data: {
//     labels:nameArr,
//     datasets: [
//       {
//         label: '# of clicks',
//         data: clicksArr,
//         backgroundColor: ['rgba(255, 99, 132, 0.2)','yellow','black','brown','green','blue','purple','gray',
//           'pink','white','#ffaec0','#6ddccf','#e40017','#99bbad','#e36bae','#161d6f','#eb5e0b','orange','#ffcc29','#ef4f4f'],
//         borderColor: 'rgba(255, 99, 132, 1)',
//         borderWidth: 5
//       },
//       {
//         label: '# of shown',
//         data: shownArr,
//         backgroundColor: ['rgba(255, 99, 132, 0.2)','#99bbad','yellow','#ef4f4f','brown','#ffaec0','blue','#ffcc29',
//           '#161d6f','#eb5e0b','#ffaec0','purple','#e40017','black','#e36bae','pink','white','orange','gray','green'],
//         borderColor: 'rgba(255, 99, 132, 1)',
//         borderWidth: 5
//       }
//     ]
//   },
//   options: {
//     scales: {
//       yAxes: [{
//         ticks: {
//           beginAtZero: true
//         }
//       }]
//     }
//   }
// } );


//constructors

// unfound route
app.get('*', (req, res) => res.status(404).send('This route does not exist'));


//listen
// client.connect()
//   .then(() => {
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
// });

// add dev branch
