const express = require('express'), http = require('http'), app = express();
var path = require('path'), bodyParser = require('body-parser'), fs = require('fs');

const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/dist/church-children-app'));

// get from database
app.route('/api/get/settings').get((req, res) => {
    fs.readFile('./src/assets/database/dates.txt', 'utf8', function(err, contents) {
        if (err) return console.log(err);
        res.send({ settings: contents })
    });   
})

app.post('/api/post/settings',function(req, res) {
    fs.writeFile('./src/assets/database/dates.txt', req.body["dates"], function (err) {
        if (err) return console.log(err);
    });
})
  

app.get('/', (req, res) => res.sendFile('index.html', {root: path.join(__dirname)}));

const server = http.createServer(app);

server.listen(port, () => console.log('Running...'));


