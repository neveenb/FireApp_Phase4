//nano connected to couchdb install
const nano = require('nano')('http://localhost:5984');//
const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();
const genuuid = require('uuid/v4');
const bcrypt = require('bcrypt');

//middleware to match requests
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Serve up public folder
function serveStaticFile(res, path, contentType, responseCode) {
    if (!responseCode) responseCode = 200;
    //Read file
    fs.readFile(__dirname    + '/public' + path, function (err, data) {
        if (err) {
            res.writeHead(500, { 'Content-Tye': 'text/plain' });
            res.end('500 - Internal Error');
        }
        else {
            res.writeHead(responseCode, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}
//this is cookie-parsing middleware for login purposes
app.use(cookieParser());

app.use(session({
    genid: (req) => {
        return genuuid() // use UUIDs for session IDs
    },
    secret: "cookiesecret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}));
//selecting hydrant_status database 
let status = nano.use('hydrant_condition');

//selecting users database 
let user = nano.use('users');

//selecting fire trucks database 
let fire_trucks = nano.use('fire_trucks');

//set up port 8080
let port = process.env.PORT || 8080;

app.set('PORT', port);
//serverstatic file that contains the file path for username information
app.get('/html/:path', (req, res) => {
    if (req.session.username)
        serveStaticFile(res, `/html/${req.params.path}`, 'text/html');
    else
        //redirects back to the homepage
        res.redirect('http://localhost:8080/home');
})
//serve files in directly called public
app.use(express.static(__dirname + '/public'));

// GET method to generate login page
app.get('/home', (req, res) => {
    if (!req.session.username)
        serveStaticFile(res, `/html/login.html`, 'text/html', 200);
    else
        serveStaticFile(res, `/html/homepage.html`, 'text/html', 200);
});

// The path is to handle post requests for login
app.post('/api/login', async (req, res) => {
    //Fetch a user from Database with the username provided by the user
    let body = await user.view('User', 'getUserData', { include_docs: false, key: req.body.username });
    if (body.rows.length) {
        //The response from the database compares the password provided by the user. 
        bcrypt.compare(req.body.password, body.rows[0].value, (err, success) => {
            if (err) {
                res.status(500).send('An Error Occured');
            }
            else if (success) {
                // If the passwords match, a session cookie is assigned and the user is redirected to home page
                req.session.username = body.rows[0].value;
                res.send('http://localhost:8080/home');
            } else {
                // If the passwords do not match, the server notifies the client that passwords do not match
                res.send('WrongPassword');
            }
        })
    } else {
        // If the user is not found in the database, the client is notified
        res.status(404).send('UserNotFound');
    }
})

// Path to handle GET request to listallhydrant and send it to client
app.get('/api/listAllHydrant', async (req, res) => {
    try {
        let body_loc = await status.view('location', 'getLocation', { include_docs: false });
        let body_con = await status.view('condition', 'currentCondition', { include_docs: false });
        //block scope 
        let out = [];
        //for loop that contains the hydrant condition and locations for that enables push function 
        for (var i = 0; i < body_loc.rows.length; i++) {
            condition = body_con.rows[i].value;//
            location = body_loc.rows[i].value;
            //enabling push onto name, temperature, condition, pressure, lat long
            out.push({
                name: condition.name,
                temperature: condition.temperature,
                pressure: condition.pressure,
                condition: condition.condition,
                lat: location.lat,
                lng: location.lng
            });
        }
        //send out info
        res.send(out);
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
});

// Path to handle GET request to search fire truck and send it to client
app.get('/api/listAllTrucks', async (req, res) => {
    try {//let presents a block scope including doc 
        let body_loc = await fire_trucks.view('location', 'getLocation', { include_docs: false });
        let body_con = await fire_trucks.view('firemen', 'getFiremen', { include_docs: false });
        let out = [];
        //for loop for firemen and their locations icon
        for (var i = 0; i < body_loc.rows.length; i++) {
            firemen = body_con.rows[i].value;
            location = body_loc.rows[i].value;
            //firemen pushing data info for location, firemen, name, lat, long
            out.push({
                name: location.name,
                firemen: firemen.fireman,
                lat: location.lat,
                lng: location.lng
            });
        }
        res.send(out);
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
});

// Path to handle GET request to search for a specific hydrant location and send it to client
app.get('/api/hydrantLocation', async (req, res) => {
    try {
        //Call a view where the key is name of the hydrant
        let body = await status.view('location', 'getLocation', { include_docs: false, key: req.query.hydrantName });
        //If hydrant with given name exists, its location is sent to the client
        //Else Send an error message
        if (body.rows.length)
            res.send(body.rows[0].value);
        else
            res.status(404).send('HydrantNotFound');
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
});

// Path to handle GET request to search for a specific hydrant condition and send it to client
app.get('/api/hydrantCondition', async (req, res) => {
    try {//call a view where where the key is the name of the hydrant
        let body = await status.view('condition', 'currentCondition', { include_docs: false, key: req.query.hydrantName });
        //If hydrant with given name exists, its condition is sent to the client
        //Else Send an error message
        if (body.rows.length)
            res.send(body.rows[0].value);
        else
            res.status(404).send('HydrantNotFound');
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
});

// Path to handle GET request to search for a specific hydrant condition and send it to client
app.get('/api/allHydrantCondition', async (req, res) => {
    try {//call a view where where the key is the name of the hydrant
        let body = await status.view('condition', 'currentCondition', { include_docs: false });
        //If hydrant with given name exists, its condition is sent to the client

        let output = [];
        body.rows.forEach(data => {
            output.push(data.value);
        });
        //Else Send an error message
        res.send(output);
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
})

//app get request to the api/logout path
app.get('/api/logout', (req, res) => {
    //on session display
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            //Else Send an error message
            res.status(500).send({ msg: 'An Error Occurred Logging you out' });
        } else {
            res.send(200);
        }
    });

})

//listening to port during connection
app.listen(app.get('PORT'), () => {
    console.log(`Listening on port ${port}`);
});
