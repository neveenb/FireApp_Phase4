const nano = require('nano')('http://localhost:5984');
const express = require('express');
const bodyparser = require('body-parser');
const cookierParser = require('cookie-parser');
const session = require('express-session');
const fs=require('fs');
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use ( express.static ( __dirname));

function serveStaticFile (res, path , contentType , responseCode ) {
    if (!responseCode) responseCode = 200 ;
    fs.readFile (__dirname +'/public'+path, function (err,data) {
    if (err)
    {
        res.writeHead ( 500 , { 'Content-Tye' : 'text/plain' });
        res.end ( '500 - Internal Error' );
    }
    else
    {
        res.writeHead ( responseCode , { 'Content-Type' : contentType });
        res.end (data);
    }
    });
}

app.use(cookierParser());

let status = nano.use('hydrant_status');

let history = nano.use('hydrant_history');


let port = process.env.PORT || 8080;
app.set('PORT', port);

app.get('/home',(req,res)=>{
    serveStaticFile(res,`/html/citymap.html`,'text/html',200);
});

app.get('/img/:path',(req,res)=>{
    serveStaticFile(res,`/img/${req.params.path}`,'image/png',200);
})

app.get('/api/listAllHydrant', async (req, res) => {
    try {
        let body = await status.view('location', 'getLocation', { include_docs: false });
        let out = [];
        body.rows.forEach(data => {
            out.push(data.value);
        });
        res.send(out);
    } catch (err) {
        res.status(500).send('Unable to access database');
    }
});

app.get('/api/hydrantLocation', async (req, res) => {
    try {
        let body = await status.view('location', 'getLocation', { include_docs: false, key: req.query.hydrantName });
        res.send(body.rows[0].value);
    } catch (err) {
        res.status(500).send('Unable to access database');
    }
})

app.get('/api/hydrantCondition', async (req, res) => {
    try {
        let body = await status.view('condition', 'currentCondition', { include_docs: false, key: req.query.hydrantName });
        res.send(body.rows[0].value);
    } catch (err) {
        res.status(500).send('Unable to access database');
    }
});



app.listen(app.get('PORT'), () => {
    console.log(`Listening on port ${port}`);
});