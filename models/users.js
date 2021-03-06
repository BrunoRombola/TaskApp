const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Task = require('./tasks')
const userSchema = new mongoose.Schema({
    name: {
        type: String,           
        required: true,         
        trim: true,             //evita espacios
        lowercase: true         
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/]
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){if(value.toLowerCase().includes('pasword')){ throw new Error('Password can\'t contain the string "password"')}}
    },
    age: {
        type: Number,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

//create virtual elements
userSchema.virtual('tasks',{
    ref: 'Task',
    localField:'_id',//which element will be related to tasks
    foreignField:'owner'//which element of tasks will be on relation
})

userSchema.methods.toJSON = function(){
    const user = this
    const userData = user.toObject()//allow me to manipulate the userdata without modify the user data

    delete userData.password
    delete userData.tokens
    return userData
}
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisisme')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

// hash the password before saving
userSchema.pre('save', async function (next){
    const user = this
    
    if(user.isModified('password')){    
        user.password = await bcrypt.hash(user.password,8)
    }
    next()  

})
//delete user tasks when user was delete
userSchema.pre('remove', async function(next){
    
    Task.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User