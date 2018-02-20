const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));
const schema = mongoose.Schema;

const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

const bodyParser = require('body-parser');
let urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const urlSchema = new schema({
    original_url: {type: String, required: true},
    short_url: {type: String, required: true}
});
const Url = mongoose.model('Url', urlSchema);

app.get('/api/shorturl/new/:url(*)', (req, res, next) => {
    console.log(req.params.url);
    next();
})

//parse url to get the url the user wishes to shorten
app.post('/api/shorturl/new/', urlEncodedParser, (req, res, next) => {
    //test to see if url is valid, if not, send error JSON
    console.log('got a post request');
    //if so, do the work
    console.log(req.params.newUrl);
    // res.send('welcome, ' + req.body)
    next();
})


const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})