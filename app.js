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
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const urlSchema = new schema({
    original_url: {type: String, required: true},
    short_url: {type: String, required: true}
});
const Url = mongoose.model('Url', urlSchema);

//parse url to get the url the user wishes to shorten
app.get('/api/shorturl/new/:original_url?', (req, res) => {
    //test to see if url is valid, if not, send error JSON
    //if so, do the work

})


const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})