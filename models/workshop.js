const mongoose = require('mongoose');

// Schema for workshops
const workshopSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   sessions: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Session"
      }
   ]
});

module.exports = mongoose.model('Workshop', workshopSchema);
