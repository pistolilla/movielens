const PROJECT_DIR = "/movielens";
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(PROJECT_DIR, express.static(path.join(__dirname + PROJECT_DIR)));
app.listen(process.env.port || port);
console.log(`Running at http://localhost:${port}${PROJECT_DIR}/index.html`);

// $ npm init --y
// $ npm install --save express
// $ node app.js