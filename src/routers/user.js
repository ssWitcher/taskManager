const express = require('express');

const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/users/login', async (req,res) => {
    try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    let token = 0;
    if(user._id){   
        token = await user.generateToken();
    }else{
        throw new Error('User not found')
    }
    res.send({
        user,
        token
    })
    } catch(e) {
        console.log(e);
        return res.status(401).send();
    }
})

router.get('/users/logout', auth, async (req,res) => {
   try {
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token
        })
        await req.user.save();
        return res.send('Successfully Logged Out');
    }catch(e) {
        return res.status(500).send()
    }
})

router.get('/users/logoutall', auth, async (req,res) => {
    try {
         req.user.tokens = [];
         await req.user.save();
         return res.send('Successfully Logged Out');
     }catch(e) {
         return res.status(500).send()
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

router.patch('/users/me', auth, async (req,res) => {
    const allowedUpdates = ['name', 'email', 'password','age']
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every( update => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(404).send({error: "Not a valid operation"} );
    }
    try {
        //const result = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        return res.send(req.user);
    }catch(err){
        console.log(err);
        return res.status(500).send();
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.delete()
        return res.send(req.user);
    }catch(err){
        return res.status(500).send();
    }
})

module.exports = router;