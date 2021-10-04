//modules
const express = require('express')
const auth = require('../middleware/auth') 
const multer = require('multer')

//models
const User = require('../models/users')

const router = new express.Router()
const pfp = multer({
    dest: './avatars',
    limits: {
        fileSize: 1000000//1mb
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('upload a image'))
        }
    }
})
//post data//
router.post('/users/me/avatar',pfp.single('pfp'),(req,res)=>{
    console.log(req.file)
    res.send()
})
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})
router.post('/users/logout',auth,async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})
router.post('/users/logoutAll',auth, async(req,res)=>{
    try{
        req.user.tokens = []
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//get data//
router.get('/users/me', auth , async (req,res)=>{
    res.send(req.user)
})
router.get('/users/:id',async (req,res)=>{
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user){ return res.statsu(404).send()}
        res.send(user)
    }catch{
        res.status(500).send()
    }
})

//update data//
router.patch('/users/me', auth, async(req, res)=>{
    const updates = Object.keys(req.body)//separate the keys of the object "req.body"
    const allowedUpdates = ['name','email','password','age'] //array to comprobe if the keys are those
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))//return true on "updateValidation" if all the members of "allowedUpdates" are the same of the keys.
    
    if(!isValidOperation){return res.status(400).send("Error: the update element required is invalid.")}//this make sure that i use a correct key to update.

    try{
        //const user = await User.findByIdAndUpdate(req.params.id, req.body,{new: true, runValidators: true})
        updates.forEach((update) => req.user[update] = req.body[update])
        res.status(200).send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

//delete data//
router.delete('/users', async(req, res)=>{
    
    try{
        const users = User.deleteMany({})
        
        res.status(200).send('Deleted all files')
    }catch(e){
        res.status(400)
    }

})
router.delete('/users/me', auth, async(req,res)=>{

    try{
        await req.user.remove()//simplify the delete elements
        res.send(req.user)
    }
    catch(e){
        res.status(500).send()
    }
})


module.exports = router