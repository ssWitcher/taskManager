const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Not a valid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain the word password');
            }
        }

    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if( value < 0){
                throw new Error('Age cannot be a negative number');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.generateToken  = async function () {
    const user = this;

    try {
        const token = jwt.sign(user._id.toString(), 'thisisastringtogeneratetoken');
        user.tokens = user.tokens.concat({token});
        await user.save();
        return token;

    }catch(e) {
        return e;
    }


}

userSchema.statics.findByCredentials = async (email, password) => {
    try {
        const user = await User.findOne({email});
        if(!user) {
            throw new Error('User not found');
        }
        const isValidMatch = await bcrypt.compare(password, user.password);
       
        if(!isValidMatch){
            throw new Error("Password doesn't match");
        }
        return user;
    }catch(e) {
        return e;
    }
}

userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
})

const User = mongoose.model('User', userSchema);


module.exports = User;