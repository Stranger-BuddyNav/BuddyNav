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

// unfound route
app.get('*', (req, res) => res.status(404).send('This route does not exist'));

// routes


// function handler


//constructors


//listen
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
  });

// add dev branch
