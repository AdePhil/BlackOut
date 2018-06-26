const mongoose = require('mongoose');


const responseSchema = new mongoose.Schema({

  response: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String

});


module.exports = mongoose.model('Response', responseSchema);
