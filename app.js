const express = require('express'); 
const bodyParser = require('body-parser'); 
const nano = require('nano')('http://localhost:5984'); 
//creating the express app
var app = express();    
//using body-parser in the app for URL encoded requests
app.use(bodyParser.urlencoded({extended:false})); 

//using the fire_trucks database
const fire_trucks = nano.use('fire_trucks'); 

 //route to place the heartrate of a person in the database
app.post('/heartrate',(req,res)=>{ 
    console.log(req.body);
    fire_trucks.insert(HeartRate).then((body)=>{
        console.log(body);
        res.status(200).send('Inserted');  
    });
});

module.exports = app;                   