const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use('/movielens/', express.static(path.join(__dirname + '/movielens')));
app.get('/movielens/',function(req, res){
  res.sendFile(path.join(__dirname + '/movielens/index.html'));
  //__dirname : It will resolve to your project folder.
});

app.listen(process.env.port || port);

// $ npm init --y
// $ npm install --save express
// $ node app.js
console.log(`Running at http://localhost:${port}/movielens`);