const express = require('express')
const app = express()
const PORT = process.env.PORT || 8000

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

const cors = require('cors')
app.use(cors({optionsSuccessStatus: 200}))

const bodyParser = require('body-parser')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})


const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})