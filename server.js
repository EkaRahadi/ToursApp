/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaughtException ! Shutting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

//Read env configuration
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connection Successful !'));

const server = app.listen(process.env.PORT, () =>
  console.log(`Listening on port ...${process.env.PORT}`)
);

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection ! Shutting down ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
