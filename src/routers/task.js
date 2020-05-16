const express = require('express');
const Task = require('../models/task');
const router = express.Router();

router.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    try {
        const result = await task.save();
        res.status(201).send(result);
    }catch(error){
        res.status(400).send(error);
    }
})

router.get('/tasks', async (req,res) => {
    try {
        const result = await Task.find({});
        res.send(result);
    } catch(error){
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', async (req,res) => {
    const _id = req.params.id;
    try {
        const result = await Task.findById(_id);
        if(!result){
            return res.status(404).send();
        }
        res.send(result);
        
    } catch(error){
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', async (req,res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every( update => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(404).send({error: "Not a valid operation"} );
    }
    try {
        const result = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!result) {
            return res.status(404).send();
        }
        res.send(result);
    }catch(err){
        res.status(400).send();
    }
})

router.delete('/tasks/:id', async (req,res) => {
    try {
        const result = await Task.findByIdAndDelete(req.params.id);
        if(!result){
            return res.status(404).send(result);
        }
        res.send(result);
    }catch(err){
        res.status(500).send();
    }
})

module.exports = router;