/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

//Error Handling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//Import Router
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Global Middleware
//Set Security http headers
app.use(helmet());
//Logging for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

//body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//GLOBAL HANDLING ERROR
app.use(globalErrorHandler);

module.exports = app;
