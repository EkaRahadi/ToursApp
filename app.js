/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');

//Error Handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//GLOBAL HANDLING ERROR
app.use(globalErrorHandler);

module.exports = app;
