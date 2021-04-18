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

app.get('/',(req,res) => {
  res.send('your server ready to use !!');
});

app.get('/covid',(req,res) => {
  let countryName = req.query.country;
  let capitlizedCountry = countryName.charAt(0).toUpperCase() + countryName.slice(1);
  let url = `https://covid-api.mmediagroup.fr/v1/cases?country=${capitlizedCountry}`;
  superagent.get(url)
    .then(result => {
      // console
      let gettedData = result.body.All;
      let newCountry = new Covid (gettedData);
      res.render('../push/Mostafa/h', {countryobj:newCountry});
    });
});

// function handler

//constructors
function Covid (covidData){
  this.country = covidData.country;
  this.population = covidData.population;
  this.confirmed = covidData.confirmed;
  this.recovered = covidData.recovered;
  this.deaths = covidData.deaths;
  this.updated = covidData.updated;
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
