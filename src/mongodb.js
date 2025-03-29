const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/registration", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection successful");
}).catch((err) => {
    console.error("No connection:", err);
});

const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});


const User = mongoose.model("User", loginSchema);
module.exports = User;
