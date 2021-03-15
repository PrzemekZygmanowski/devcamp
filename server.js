const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/config.env' });

// connect to db
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const { connect } = require('mongoose');

const app = express();

//body parser
app.use(express.json());

// devlogging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// app.use(logger);

//mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
  )
);

//handle unhandled prmise rejections
process.on('unhandleRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server &exit process
  server.close(() => process.exit(1));
});
