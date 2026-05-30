const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        required: true
    },

    balance: {
        type: Number,
        default: 0
    },

    role: {
        type: String,
        default: "user"
    }
});

module.exports = mongoose.model("User", UserSchema);