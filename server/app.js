require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

mongoose.connect("mongodb+srv://admin-avanti:Test123@cluster0.lt3vm.mongodb.net/bankDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

require("./models/user");

app.use(require("./routes/auth"));

app.listen(5000);
