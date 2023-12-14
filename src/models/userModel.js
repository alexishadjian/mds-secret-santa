const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

let userSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
    },
    groupe_id: {
        type: String
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