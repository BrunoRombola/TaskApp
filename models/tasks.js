const mongoose = require('mongoose')

const taskSchema = new  mongoose.Schema({
    name:{
        type: String,
        required: true,
        lowercase: true
    },
    description:{
        type: String,
        required: true,
        lowercase: true
    },
    completed:{
        type: Boolean,
        default: false    
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'

    }

})


const Task = mongoose.model('Task', taskSchema)
module.exports = Task