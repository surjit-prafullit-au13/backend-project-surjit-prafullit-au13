const express = require('express')
const config = require('./config/config')

const app = express()                       //initialising express

const Controller = require('./controller/route');
app.use('/', Controller);

app.listen(config.port,()=>{
    console.log(`Listening to port http://localhost:${config.port}`)
})