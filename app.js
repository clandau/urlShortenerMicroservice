const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const dns = require('dns');
const cors = require('cors');

const PORT = process.env.PORT || 8000;
//regex to test if the submitted url is valid
const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

//to validate entered addresses
dotenv.config();

const app = express();
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));
const schema = mongoose.Schema;

app.use(cors({optionsSuccessStatus: 200}));

let urlEncodedParser = bodyParser.urlencoded({ extended: false });

//counter to use for shortened URL
let randomNum = Math.floor(Math.random() * 9999);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const urlSchema = new schema({
    original_url: {type: String, required: true},
    short_url: {type: String, required: true}
});
const Url = mongoose.model('Url', urlSchema);

//function to make sure that the address to shorten is valid
let validAddress = ((addressToValidate) => {
    // console.log(addressToValidate);
    return urlRegex.test(addressToValidate) && dns.lookup(addressToValidate, (err, address, family) => {
        //console.log(address);
        return address ? true : false;
    })});

//function to create a new database entry and short url
let createNewShortUrl = function(longUrl, done) {
    let newUrlHolder = new Url({original_url: longUrl, short_url: randomNum});
    ++randomNum;
    newUrlHolder.save((err, data) => {
        if(err) done(err);
        done(null, data);
    });
};

//function to test createNewShortUrl function (works)
createNewShortUrl('http://www.google.com', (err, data) => {
    console.log(err ? err : data);
});

app.get('/api/shorturl/new/:url(*)', (req, res, next) => {
    let enteredUrl = req.params.url;
    if(!validAddress(enteredUrl)) {
        res.send({ 'error' : "invalid URL" })
    }
    else res.send({'url': req.params.url});
    next();
});

//parse url to get the url the user wishes to shorten
app.post('/api/shorturl/new/', urlEncodedParser, (req, res, next) => {
    if (!req.body) return res.sendStatus(400);
    let enteredUrl = req.body.url;

    //test to see if url is valid, if not, send error JSON
    if(!validAddress(enteredUrl)) {
        res.send({ 'error' : "invalid URL" })
    }
    //if so, do the work
    else {
        //create new url, post to DB, send to user
        res.send({'url': enteredUrl});
        console.log('success');
    }
    next();
})

const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})