const mongoose = require('mongoose')
const mongooseString = process.env.MONGO_BASE_URL
mongoose.set('strictQuery', false);
mongoose.connect(mongooseString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})