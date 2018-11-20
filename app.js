const express = require('express'); //importing express
const bodyParser = require('body-parser'); //importing body-parser
const nano = require('nano')('http://localhost:5984'); //nano for couchDB
var app = express();    //creating the express app
app.use(bodyParser.urlencoded({extended:false})); //using body-parser in the app for URL encoded requests

const fire_trucks = nano.use('fire_trucks'); //using the fire_trucks database

app.post('/heartrate',(req,res)=>{  //route to place a new pin in the database
    console.log(req.body);

    litteredPlaces.insert({coordinates:{lat:Number(req.body.lat),lng:Number(req.body.lng)}}).then((body)=>{
        console.log(body);
        res.status(200).send('Inserted');   //response that pin has been placed
    });
});

app.get('/getpins',(req,res)=>{ //route to get all pins from the database
    console.log('Received a request from:'+req.hostname);
    var pins = [];  //create an array to receive each pin
    litteredPlaces.view('iot', 'coords').then((body) => {   //calling the view to get pins
        body.rows.forEach((doc) => {    //iterating through each document in the view result
          console.log(doc.value);
          console.log(doc.value.lat);
          pins.push(doc.value);         //adding pin to the array
        });
        console.log(pins);
        res.status(200).json(pins);     //sending back the array as a JSON response
      });   
    
});

module.exports = app;                   