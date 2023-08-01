const mongoose = require('mongoose')
var url = "mongodb+srv://nauryzbekdias2:Barcelona2603@disa.giygccp.mongodb.net/?retryWrites=true&w=majority";

const initDatabase = async () => {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
};

module.exports = { initDatabase }