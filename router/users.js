//modules
const express = require('express')
const auth = require('../middleware/auth') 
//models
const User = require('../models/users')

const router = new express.Router()

//create data//

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

/*
the idea of logout is simple
1)when you login for any system, you generate an auth token
2) when you want to logout one of those session you delete 
that token for the tokens list,
3) that user cannot be authenticated again (cuz you didnt habe the element)
*/
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


//read data//
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