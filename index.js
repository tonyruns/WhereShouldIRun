var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var pg = require('pg');


app.use( bodyParser.json() );       // to support JSON-encoded bodies
//app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//    extended: true
//}));




app.post('/test', function (req, res) {
    console.log('post');

});



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

app.get('/getRouteTimes', function(req, response) {
    console.log("get routes times:");
    console.log(req.headers.id);
    //console.log(JSON.stringify(req.headers));
    //
    pg.connect(process.env.DATABASE_URL+'?ssl=true', function(err, client, done) {
        client.query('SELECT * FROM RouteTimesTable', function(err, result) {
            done();
            if (err)
            { console.error(err); response.send("Error " + err); }
            else
            {
                console.log(JSON.stringify(result));
                response.send(JSON.stringify(result.rows));
            }
        });
    });
});