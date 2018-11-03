const express = require('express');
var nano = require('nano')('http://localhost:5984');
var test_db = nano.db.use('hydrants');


// running a view
test_db.view('condition', 'new_view', function (err, body) {
    if (!err) {
        var rows = body.rows; //the rows returned
        console.log(JSON.stringify(body));
        console.log(rows);
    }
}
);