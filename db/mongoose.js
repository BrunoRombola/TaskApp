const mongoose = require('mongoose')
const DBURL = 'mongodb://127.0.0.1:27017'
mongoose.connect(DBURL,{
    useNewUrlParser: true,
    useCreateIndex: true
})