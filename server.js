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
app.post('/details/:PlanID', showPlanDetails);
app.put('/updatePlan/:planID',updatePlanHandler);
app.delete('/deletePlan/:planID',deletePlanHandler);

// function handler

function allApiHandler(req, res) {
  let appAPiArr = [];
  

  // console.log('allApiHandler');
  // console.log(req.query);
  let SQL ='SELECT id FROM city WHERE city =$1;';
  let safeValue = [req.query.search];
  Client.query(SQL,safeValue).then(data =>{
    console.log(!(data.rows.length));
    if(!(data.rows.length)){
      let SQL= 'insert into city (city) values($1) returning id;';
      let safevalue=[req.query.search];
      Client.query(SQL,safevalue).then(data0=>{
        console.log(data0.rows[0].id)
        let a = locationHandler(req, res,data0.rows[0].id)
          .then(data1 => {
            // console.log('inside-locationHandler------------', data1);
            appAPiArr.push(data1);
            let b = weatherHandler(req, res)
              .then(data2 => {
                // console.log('inside-weatherHandler------------', data2);
                appAPiArr.push(data2);
                let c = findHotelsHandler(req, res,data0.rows[0].id)
                  .then(data3 => {
                  // console.log('inside-findHotelsHandler------------', data3);
                    appAPiArr.push(data3);
                    let d = findTransportHandler(req, res,data0.rows[0].id)
                      .then(data4 => {
                        // console.log('inside-findTransportHandler------------', data4);
                        appAPiArr.push(data4);
                        // console.log('1111111111111111111111111111111111111111111111111', data2.country);
                        let f = covidHandler(data2.country)
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
    else{
      let id =data.rows[0].id;
      console.log('ttttttttt',id);
      let SQL ='select * from city as c join locationdata as l on l.city_id = c.id join hoteldata as h on h.city_id=c.id join transportdata as t on t.city_id = c.id where c.id =$1;';
      let safevalue= [data.rows[0].id];
      Client.query(SQL,safevalue).then(result =>{
        result.rows.forEach(ele=>appAPiArr.push(ele));
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
      });
    }

  });

  // console.log('**********************');
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


function locationHandler(req, res,id) {
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
      let map = getMap(keyVal2, data.latitude, data.longitude);
      arr.push(data, map);
      return getPhoto(keyVal, text)
        .then(nnata => {
          //console.log('nnata', nnata);
          let idx = Math.floor(Math.random() * 10 + 1);
          if (idx > (nnata.length - 1)) {
            //console.log('nnata.length', nnata.length);
            //console.log('sdsdds', arr);
            arr.push(nnata);
          } else {
            arr.push(nnata[idx]);
            //console.log('sdsdds', arr);
          }
          let map_url = arr[1];
          let city_url= arr[2].photoLink;
          let SQL= 'INSERT INTO locationdata ( map_url , city_url,city_id) VALUES ($1,$2,$3);';
          let safeValues= [map_url,city_url,id];
          Client.query(SQL,safeValues).then(data=> console.log('done'));

          // console.log('arrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
          // console.log('arrrr', arr, nnata);
          //res.render('pages/test', { allData: arr });
          return arr;
        })

        .catch(error => {
          //console.log('Error in getting data from Google Books server')
          console.error(error);
          //res.render('pages/error', { errors: error });
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


function findHotelsHandler(req, res,id) {
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
          });

      });

      hotelsArray.forEach(element => {
        let SQL= 'INSERT INTO hoteldata ( hotel_image, hotel_name , hotel_price , hotel_rate,city_id) VALUES ($1,$2,$3,$4,$5);';

        let safeValues= [element.hotel_image,element.hotel_name,element.hotel_price,element.hotel_rate,id];
        Client.query(SQL,safeValues).then(data=> console.log('done'));
      });
      //res.send(hotelsArray);
      return gData;

    })

    .catch(error => {
      // console.log('inside superagent');
      // console.log('Error in getting data from hotels server');
      console.error(error);
      //res.send(error);
    });
  // console.log('after superagent');
}


function findTransportHandler(req, res,id) {
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
      });
      //res.send(transArray);
      transArray.forEach(element => {
        let SQL= 'INSERT INTO transportdata ( station_name, station_type , transport_price,city_id) VALUES ($1,$2,$3,$4);';

        let safeValues= [element.station_name,element.station_type,element.transport_price,id];
        Client.query(SQL,safeValues).then(data=> console.log('done'));
      });
      return gData;
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



// DataBase Functions

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

function deletePlanHandler (req,res){
  let SQL = `DELETE FROM booking WHERE id=$1;`;
  let value = [req.params.planID];
  Client.query(SQL,value)
    .then(res.redirect('/'));
  // res.render(`pages/saved`,{obj:safeValues});

}

function showPlanDetails (req,res){
  let SQL = `SELECT * FROM booking WHERE id=$1;`;
  let value = [req.params.PlanID];
  Client.query(SQL,value)
    .then((result) => {
      res.render('pages/details',{plan:result.rows[0]});
    });
}

function updatePlanHandler (req,res){
  // console.log(req.params.PlanID);
  let {city,image_url,date,hotel,transport} = req.body;
  let SQL = `UPDATE booking SET city=$1,image_url=$2,date=$3,hotel=$4,transport=$5 WHERE id=$6;`;
  let safeValues = [city,image_url,date,hotel,transport,req.params.PlanID];
  Client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/`);
      // res.render(`pages/saved`,{obj:safeValues});
      res.redirect(`/details/${req.params.planID}`);



    }).catch(error=>{
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
  this.updated = (covidData.updated)?covidData.updated:'NO DATA';
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
  // console.log('----------------------------------------------------------------------------------');
  // console.log('Hotel');
  let minRate = 1;
  let maxRate = 5;
  let minPrice = 20;
  let maxPrice = 300;
  this.hotel_name = hotelData.name;
  this.hotel_image = (data.length) ? data : 'https://image.freepik.com/free-vector/lifestyle-hotel-illustration_335657-398.jpg';
  this.hotel_rate = Math.floor(Math.random() * (maxRate - minRate) + minRate);
  this.hotel_price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
  // console.log('this.name--->', this.name, 'this.imageLinks---->', this.imageLinks, this.rate, this.price);
}


function Transport(transData) {
  let minPrice = 10;
  let maxPrice = 50;
  this.station_name = transData.name;
  this.station_type = transData.type;
  this.transport_price = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice);
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
Client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
  });

// add dev branch
