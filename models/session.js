const mongoose = require("mongoose");

// Schema for sessions
const sessionSchema = new mongoose.Schema({
   title: String,
   text: String,
   image: String,
   time: Number,
   blocks: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Block"
      }
   ]
});
 
module.exports = mongoose.model("Session", sessionSchema);