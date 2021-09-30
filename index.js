//modules
const express = require('express')
require('./db/mongoose')

const bcrypt = require('bcryptjs')
const userRouter = require('./router/users')
const taskRouter = require('./router/tasks')

const app = express()
//ports and connections:
const port = process.env.PORT || 3000

//middleware


app.use(express.json())
//routers
app.use(userRouter)
app.use(taskRouter)
//connection to port
app.listen(port,()=>{console.log('Server Connected',port)})