const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const morgan = require('morgan');
const fileUpload = require('express-fileUpload');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const colors = require('colors');

//load env vars
dotenv.config({ path: './config/config.env' });

//connect to databas
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

//body parser
app.use(express.json());

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//file uploading
app.use(fileUpload());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`error: ${err.message}`.red);
  //close server & exit process
  server.close(() => process.exit(1));
});
