const mongoose = require('mongoose')
require('dotenv').config({ path: "./dev.env" });
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    // useFindAndModify:true,
    useUnifiedTopology:true
    // useCreateIndex:true
})