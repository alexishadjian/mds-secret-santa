const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let userSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Boolean
    }
});

userSchema.pre('save', async function(next) {                                                                                                                                        
    if (this.password) {                                                                                                                                                        
        let salt = await bcrypt.genSaltSync(10)                                                                                                                                     
        this.password = await bcrypt.hash(this.password, salt)                                                                                                                
    }                                                                                                                                                   
    next();                                                                                                                                                               
}) 

module.exports = mongoose.model('User', userSchema);