const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async(req, res, next) => {
    try {
    const token = req.header('Authorization').replace('Bearer ','');
    const decoded = jwt.verify(token, 'thisisastringtogeneratetoken');
    const user = await User.findOne({_id: decoded, 'tokens.token': token});
    if(!user) {
        throw new Error();
    }
    req.user = user;
    }catch(e){
        return res.status(401).send("Unable to verify user's identity");
    }
    next();
}


module.exports = auth;