const mongoose = require('mongoose');


const answerSchema = new mongoose.Schema({

  questionNo: {
    type: String,
  },
  question: {
    type: String,
  },
  responses: {
    type: [String],
  }
});

module.exports = mongoose.model('Answer', answerSchema);
