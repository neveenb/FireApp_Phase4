const nano = require('nano')('http://localhost:5984');
const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));


function serveStaticFile(res, path, contentType, responseCode) {
    if (!responseCode) responseCode = 200;
    fs.readFile(__dirname + '/public' + path, function (err, data) {
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

app.use(cookieParser());

app.use(session({
    genid: (req) => {
        return uuid() // use UUIDs for session IDs
    },
    secret: "idontreallycare",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}));

let status = nano.use('hydrant_status');

let history = nano.use('hydrant_history');

let user = nano.use('users');

let fire_trucks = nano.use('fire_trucks');

let port = process.env.PORT || 8080;
app.set('PORT', port);

app.get('/html/:path', (req, res) => {
    if (req.session.username)
        serveStaticFile(res, `/html/${req.params.path}`, 'text/html');
    else
        res.redirect('http://localhost:8080/home');
})

app.use(express.static(__dirname + '/public'));

app.get('/home', (req, res) => {
    // res.redirect('http://localhost:8080/html/citymap.html');
    if (!req.session.username)
        serveStaticFile(res, `/html/login.html`, 'text/html', 200);
    else
        serveStaticFile(res, `/html/homepage.html`, 'text/html', 200);
});

app.get('/api/listAllHydrant', async (req, res) => {
    try {
        let body_loc = await status.view('location', 'getLocation', { include_docs: false });
        let body_con = await status.view('condition', 'currentCondition', { include_docs: false });
        let out = [];
        for (var i = 0; i < body_loc.rows.length; i++) {
            condition = body_con.rows[i].value;
            location = body_loc.rows[i].value;
            out.push({
                name: condition.name,
                temperature: condition.temperature,
                pressure: condition.pressure,
                condition: condition.condition,
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

app.get('/api/listAllTrucks', async (req, res) => {
    try {
        let body_loc = await fire_trucks.view('location', 'getLocation', { include_docs: false });
        let body_con = await fire_trucks.view('firemen', 'getFiremen', { include_docs: false });
        let out = [];
        for (var i = 0; i < body_loc.rows.length; i++) {
            firemen = body_con.rows[i].value;
            location = body_loc.rows[i].value;
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


app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.status(500).send({ msg: 'An Error Occurred Logging you out' });
        } else {
            res.send(200);
        }
    });

})

app.post('/api/login', async (req, res) => {

    let body = await user.view('User', 'getUserData', { include_docs: false, key: req.body.username });
    if (body.rows.length) {
        bcrypt.compare(req.body.password, body.rows[0].value, (err, success) => {
            if (err) {
                res.status(500).send('An Error Occured');
            }
            else if (success) {
                req.session.username = body.rows[0].value;
                res.send('http://localhost:8080/home');
            } else {
                res.send('Wrong Password');
            }
        })
    } else {
        res.status(404).send('User Does Not Exist');
    }
})

app.get('/api/hydrantLocation', async (req, res) => {
    try {
        let body = await status.view('location', 'getLocation', { include_docs: false, key: req.query.hydrantName });
        res.send(body.rows[0].value);
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
})

app.get('/api/hydrantCondition', async (req, res) => {
    try {
        let body = await status.view('condition', 'currentCondition', { include_docs: false, key: req.query.hydrantName });
        res.send(body.rows[0].value);
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
});

app.get('/api/allHydrantCondition', async (req, res) => {
    try {
        let body = await status.view('condition', 'currentCondition', { include_docs: false });
        let output = [];
        body.rows.forEach(data => {
            output.push(data.value);
        });

        res.send(output);
    } catch (err) {
        console.log(err);
        res.status(500).send('Unable to access database');
    }
})

app.listen(app.get('PORT'), () => {
    console.log(`Listening on port ${port}`);
});