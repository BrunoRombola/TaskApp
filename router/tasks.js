//modules
const express = require('express')
const auth = require('../middleware/auth')
//models
const Task = require('../models/tasks')

const router = new express.Router()

//create data//
router.post('/tasks',auth,async (req,res)=>{
    const task = new Task({
        ...req.body,//copy all elements on reqbody ES6
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    } 
})

//read data//

router.get('/tasks', auth,async (req,res)=>{
    try{
        await req.user.populate('tasks').execPopulate()
        //const tasks = await Task.find({owner: req.user._id})
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send("Error on tasksReading")
    }
})

router.get('/tasks/:id', auth,async (req,res)=>{
    const _id = req.params.id
    try{

        const task = await Task.findOne({_id, owner: req.user._id})
               
        
        if(!task){return res.status(404).send()}
        res.send(task)
    }catch(e){
        res.status(500).send("Error on reading tasks")
    }
    

})

//updating data

router.patch('/task/:id', auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description', 'completed']
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidUpdate){return res.status(400).send("Error: the selected element to update is invalid")}
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
    if(!task){
        return res.status(404).send("Error: the tasks do not exist.")
    }
    updates.forEach((update)=> task[update] = req.body[update])
    await task.save()
    res.send(task)
    } catch (e) {
        res.status(500).send(e)
        
    }
})
//deleting data

router.delete('/tasks', async(req, res)=>{
    
    try{
        const tasks = Task.findOneAndDelete({})
        
        res.status(200).send('Deleted all files')
    }catch(e){
        res.status(400)
    }

})
router.delete('/tasks/:id', async(req,res)=>{

    try{
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task){ return res.status(404).send("Error: the task by id:", req.params.id, "do not exist")}
        res.status(200).send("the task: ", task, "has been deleted")
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router