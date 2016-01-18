var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var pg = require('pg');


app.use( bodyParser.json() );       // to support JSON-encoded bodies
//app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//    extended: true
//}));








app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL+'?ssl=true', function(err, client, done) {
    client.query('SELECT * FROM RouteTimesTable', function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("Error " + err); }
      else
      { response.render('pages/db', {results: result.rows} ); }
    });
  });
})

app.post('/postRouteTimes', function (req, res) {

    console.log(JSON.stringify(req.headers));
    if (req.headers.id != undefined && req.headers.time != '0:00:00' && (req.headers.name.trim() != "")){
        pg.connect(process.env.DATABASE_URL+'?ssl=true', function(err, client, done) {
            client.query(
                'INSERT into RouteTimesTable (id, name, time) VALUES($1, $2, $3) RETURNING id',
                [req.headers.id, req.headers.name.trim(), req.headers.time],
                function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('row inserted with id: ' + result.rows[0].id);
                    }

                        console.log('Client will end now!!!');
                        client.end();

                        res.send("done");

                });
        });
    }

});

app.get('/getRouteTimes', function(req, response) {
    console.log("get routes times:");
    console.log(req.headers.id);
    //console.log(JSON.stringify(req.headers));
    //
    pg.connect(process.env.DATABASE_URL+'?ssl=true', function(err, client, done) {
        client.query('SELECT * FROM RouteTimesTable WHERE id = '+req.headers.id+' ORDER BY time ASC limit 10', function(err, result) {
            done();
            if (err)
            { console.error(err); response.send("Error " + err); }
            else
            {
               // console.log(JSON.stringify(result));
                response.send(JSON.stringify(result.rows));
            }
        });
    });
});