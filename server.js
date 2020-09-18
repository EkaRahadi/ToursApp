/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
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

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ...${process.env.PORT}`)
);
