const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

//to validate entered addresses
const dns = require('dns');

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

//regex to test if the submitted url is valid
const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const urlSchema = new schema({
    original_url: {type: String, required: true},
    short_url: {type: String, required: true}
});
const Url = mongoose.model('Url', urlSchema);

var testLookup = dns.lookup('dns.com', (err, address, family) => {
    console.log(address);
    return address ? true : false;
});

let validAddress = ((addressToValidate) => {
    return urlRegex.test(addressToValidate) && dns.lookup(addressToValidate, (err, address, family) => {
        return address ? true : false;
    })});

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
    let enteredUrl = req.params.url;
    if(!urlRegex.test(req.params.url)) {
        res.send({ 'error' : "invalid URL" });
    }
    //test to see if url is valid, if not, send error JSON
    console.log('got a post request');
    //if so, do the work
    console.log(req.body.url);
    next();
})


const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})