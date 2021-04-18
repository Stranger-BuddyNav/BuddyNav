/* eslint-disable no-unused-vars */
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

// adding DATABASE URL for localhost:

// const client = new pg.Client(process.env.DATABASE_URL);

// adding DATABASE URL for Heroku:

// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false } });

// setupes
const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(methodOverride('_method'));


app.get('/', homeRouteHandler);//home route
app.get('/hotels', findHotelsHandler);
app.get('/transport',findTransportHandler);
app.get('*', notFoundHandler); //error handler

// routes
function homeRouteHandler(req, res) {
  res.render('pages/index');

}

//https://hotels-com-provider.p.rapidapi.com/v1/hotels/search?locale=en_US&sort_order=STAR_RATING_HIGHEST_FIRST&adults_number=1&destination_id=1708350&checkout_date=2022-03-27&checkin_date=2022-03-26&currency=USD&accommodation_ids=20,8,15,5,1&guest_rating_min=4&amenity_ids=527,2063&theme_ids=14,27,25&price_max=500&price_min=10&page_number=1&children_ages=4,0,15&star_rating_ids=3,4,5&rapidapi-key=37f8f76320msh4273ee6e5569175p1780a4jsn5c21b7acde99

function findHotelsHandler(req,res){
  let hotelsArray =[];
  let cityName = req.query.city;
  let hotelsKey = process.env.HOTELS_KEY;
  let hotelsURL =`https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=${cityName}&rapidapi-key=${hotelsKey}`;
  superagent.get(hotelsURL) //send request to weatherbit.io API
    .then(geoData => {
      console.log('inside superagent');
      // console.log(geoData);
      // let gData= geoData.body.searchResults.results;
      let gData= geoData.body.suggestions[1].entities;

      gData.map(val => {
        const newHotel = new Hotel(val);
        hotelsArray.push(newHotel);
      });
      res.send(hotelsArray);

    })

    .catch(error => {
      console.log('inside superagent');
      console.log('Error in getting data from hotels server');
      console.error(error);
      res.send(error);
    });
  console.log('after superagent');
}

function findTransportHandler(req,res){
  let transArray =[];
  let cityName = req.query.city;
  let transKey = process.env.TRANSPORT_KEY;
  let hotelsURL =`https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=ammnan&rapidapi-key=37f8f76320msh4273ee6e5569175p1780a4jsn5c21b7acde99`;
  superagent.get(hotelsURL) //send request to weatherbit.io API
    .then(geoData => {
      console.log('inside superagent');
      // console.log(geoData);
      // let gData= geoData.body.searchResults.results;
      let gData= geoData.body.suggestions[3].entities;

      gData.map(val => {
        const newTrans = new Transport(val);
        transArray.push(newTrans);
      });
      res.send(transArray);

    })

    .catch(error => {
      console.log('inside superagent');
      console.log('Error in getting data from hotels server');
      console.error(error);
      res.send(error);
    });
  console.log('after superagent');
}


function notFoundHandler(req, res) {
  res.send('Error Code 404');
}

//constructors
function Hotel (hotelData){
  this.name = hotelData.name;
}

function Transport (transData){
  this.name = transData.name;
  this.type = transData.type;
}


//listen

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// client.connect()
//   .then(() => {
//     app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
//   });

