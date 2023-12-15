const express = require('express');
const app = express();
const port = 3000;

const mongoose = require("mongoose");
mongoose.connect('mongodb://mongo/secret-santa');

app.use(express.urlencoded());
app.use(express.json());

const userRoute = require('./routes/userRoute');
const groupRoute = require('./routes/groupRoute');

app.use('/users', userRoute);
app.use('/', groupRoute);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})