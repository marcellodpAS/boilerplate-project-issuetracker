'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Serve static files
app.use('/public', express.static(__dirname + '/public'));

// Enable CORS for FCC testing
app.use(cors({ origin: '*' }));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve sample front-end
app.route('/:project/').get((req, res) => {
  res.sendFile(__dirname + '/views/issue.html');
});

// Serve index page
app.route('/').get((req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// FCC testing routes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // for testing
