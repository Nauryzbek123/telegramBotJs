const mongoose = require('mongoose');
const users = new mongoose.Schema({
    username:{
      type: String, 
      required: true,  
    }, 
    functionalgrade: {
        type:  Number, 
        default: 0,
    }, 
    uiuxgrade: {
        type: Number, 
        default: 0,
    }, 
    codegrade: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
})
module.exports = mongoose.model('Users',users);
