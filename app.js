const express = require('express')
const app = express()
const PORT = process.env.PORT || 8000

const cors = require('cors')
app.use(cors({optionsSuccessStatus: 200}))

app.use(express.static('public'))

app.get(__dirname + '/views/index.html')




const listener = app.listen(PORT, () => {
    console.log('You are listening on port ' + PORT)
})