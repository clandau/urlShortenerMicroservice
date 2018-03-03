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

mongoose.connect(process.env.MONGODB_URI);
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
    short_url: {type: String, required: true, unique: true}
});
const Url = mongoose.model('Url', urlSchema);

//function to make sure that the address to shorten is valid
let validAddress = ((addressToValidate) => {
    return urlRegex.test(addressToValidate) && dns.lookup(addressToValidate, (err, address, family) => {
        return address ? true : false;
    })});

//function to create a new database entry and short url
let createNewShortUrl = function(longUrl, done) {
    ++randomNum;
    Url.findOne({'short_url' : randomNum }, (err, data) => {
        if(err) console.log(err);
        else if(data !== null) {
            console.log('url exists');
            createNewShortUrl(longUrl, (err, data) => {
                return err ? err : data;
            });
        }
        else {
            console.log('unique id, adding to DB');
            let newUrlHolder = new Url({original_url: longUrl, short_url: randomNum});
            newUrlHolder.save((err, data) => {
            err ? done(err) : done(null, data);
            })
        }
    });
};

app.get('/api/shorturl/new/:url(*)', (req, res, next) => {
    let enteredUrl = req.params.url;
    if(!validAddress(enteredUrl)) {
        res.send({ 'error' : "invalid URL" })
    }
    else {
        createNewShortUrl(enteredUrl, (err, data) => {
            if(data) {
            res.send({'original_url': enteredUrl, 'short_url': data.short_url});
            }
            if(err) console.log(err);
        });
    }
});

//identify when someone's visiting a short url and redirect them to the requested long url site
app.get('/api/shorturl/:shortUrl', (req, res, next) => {
        let urlShort = req.params.shortUrl;
        let originalUrl;
        findShortUrl(urlShort, (err, data) => {
            if(err) console.log(err);
            else {
            let longUrl = data;
            res.redirect(longUrl);
            }
        });
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
        createNewShortUrl(enteredUrl, (err, data) => {
            if(data) {
            res.send({'original_url': enteredUrl, 'short_url': data.short_url});
            }
            if(err) console.log(err);
        });
    }
});

//function to check for short url in database
let findShortUrl = function(urlString, done) {
    Url.findOne({ 'short_url': urlString }, 'original_url short_url', function (err, url) {
        if (err) done(err);
        if(url === null) {
            done(null, url);
        }
        else {
        let longUrl = url.original_url;
        return done(null, longUrl);  
        }
      });
    };

//handle page not found errors
app.get('*', function(req, res){
    res.sendFile(__dirname + '/views/oops.html', 404);
    });

const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})