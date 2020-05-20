const express = require('express');
const Task = require('../models/task');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save();
        return res.status(201).send(task);
    }catch(e){
        return res.status(500).send();

    }
    })

router.get('/tasks', auth, async (req,res) => {
    try {
        const result = await Task.find({owner: req.user._id});
        return res.send(result);
    } catch(error){
        return res.status(500).send(error);
    }
})

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id;
    try {
        const result = await Task.findOne({_id,owner:req.user._id});
        if(!result){
            return res.status(404).send();
        }
        return res.send(result);
        
    } catch(error){
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async (req,res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every( update => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(404).send({error: "Not a valid operation"} );
    }
    console.log("here");
    try {
        const result = await Task.findOneAndUpdate({_id: req.params.id, owner: req.user._id}, req.body, {new: true, runValidators: true})
        if(!result) {
            return res.status(404).send();
        }
        return res.send(result);
    }catch(err){
        console.log(err);
        return res.status(400).send();
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        const result = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!result){
            return res.status(404).send(result);
        }
        return res.send(result);
    }catch(err){
        return res.status(500).send();
    }
})

module.exports = router;