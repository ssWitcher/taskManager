const express = require('express');

const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/users/login', async (req,res) => {
    try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateToken();
    res.send({
        user,
        token
    })
    } catch(e) {
        console.log(e);
        return res.status(401).send();
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateToken();
        const result = await user.save(); 
        return res.status(201).send({result,token});
    }catch(error){
        return res.status(400).send(error);
    }
})



router.get('/users/me', auth, async (req,res) => {
    return res.send(req.user);

})

router.get('/users/:id', async (req,res) => {
    const _id = req.params.id;
    try {
        const result = await User.findById(_id);
        if(!result){
            return res.status(404).send();
        }
        return res.send(result);
        
    } catch(error){
        return res.status(500).send(error);
    }
})

router.patch('/users/:id', async (req,res) => {
    const allowedUpdates = ['name', 'email', 'password','age']
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every( update => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(404).send({error: "Not a valid operation"} );
    }
    try {
        //const result = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const result = await User.findById(req.params.id);
        updates.forEach(update => result[update] = req.body[update]);
        await result.save();
        if(!result) {
            return res.status(404).send();
        }
        return res.send(result);
    }catch(err){
        return res.status(400).send();
    }
})

router.delete('/users/:id', async (req,res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if(!result){
            return res.status(404).send(result);
        }
        return res.send(result);
    }catch(err){
        return res.status(500).send();
    }
})

module.exports = router;