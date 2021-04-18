'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
// const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };
// const client = new pg.Client(options);
const client = new pg.Client( { connectionString: process.env.DATABASE_URL,
  // ssl:{rejectUnauthorized: false
  // }

} );

const methodOverride = require('method-override');

// setupes

const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(methodOverride('_method'));



// routes
app.get('/weather/result' ,weatherHandler);
app.get('/weather' ,weatherRender);



// unfound route
app.get('*', (req, res) => res.status(404).send('This route does not exist'));


// functions
function weatherRender(req,res){
  res.render('./pages/weather');
}

function weatherHandler (req,res) {
  let key = process.env.WEATHER_KEY;
  let cityName=req.query.search;
  cityName.charAt(0).toUpperCase() + cityName.slice(1);
  let url =`http://api.weatherstack.com/current?access_key=${key}&query=${cityName}`;




  superagent(url)
    .then(result => {
      let dataWeather = result.body;
      let myData = new Weather(dataWeather);
      console.log('fffffffffffffffffffffff');

      res.render('pages/test' , {bookDataArray:myData});
      // res.send(myData);
    });
  // res.send('your server work');
}


//constructors
function Weather(result){
  this.cityName = result.request.query;
  this.country= result.location.country;
  this.time =result.location.localtime;
  this.temperature =result.current.temperature;
  this.weather_icons=result.current.weather_icons;
  this.weather_descriptions=result.current.weather_descriptions;
}


//listen
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
  });

