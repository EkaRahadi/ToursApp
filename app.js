/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');

//Import Router
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Middleware
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

//Custom middleware
app.use((req, res, next) => {
  console.log('Hello from middleware!');

  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
