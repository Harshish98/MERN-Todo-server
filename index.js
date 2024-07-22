const express = require("express");
const app = express();
const dotenv = require("dotenv");
const router = require("./router");
const ConnectDb = require("./config/db");
const cors = require('cors');

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   credentials: true, 
// };
app.use(cors())
app.use(express.json());
dotenv.config();
app.use(router);

ConnectDb().then(() => {
  app.listen(3020, () => {
    console.log("app listening on port......3020");
  });
});

