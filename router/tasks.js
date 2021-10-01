//modules
const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()
//models
const Task = require('../models/tasks')

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
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1 
    }
    
    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
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
router.patch('/tasks/:id', auth, async(req, res)=>{
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
router.delete('/tasks', auth, async(req, res)=>{
    
    try{
        const tasks = Task.findOneAndDelete({owner: req.user._id})
        
        res.status(200).send('Deleted all files')
    }catch(e){
        res.status(400)
    }

})
router.delete('/tasks/:id',auth, async(req,res)=>{

    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){ return res.status(404).send("Error: the task by id:", req.params.id, "do not exist")}
        res.send("the task: ", task, "has been deleted")
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router