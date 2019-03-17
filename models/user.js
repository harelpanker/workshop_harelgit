const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
   username: { type: String, unique: true, required: true },
   password: String,
   avatar: String,
   fullName: String,
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   email: { type: String, unique: true, required: true },
   isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);
 
module.exports = mongoose.model("User", userSchema);