const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let groupSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
    admin_id: {
        type: String,
        required: true
    },
    members: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User' 
    }]
});

module.exports = mongoose.model('Group', groupSchema);