const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionNo: {
    type: String
  },
  question: {
    type: String
  },
  responses: {
    type: [String]
  }
});

answerSchema.statics.questionByCount = function(questionNo) {
  return this.aggregate([
    {
      $match: {
        keywords: { $not: { $size: 0 } },
        questionNo: questionNo
      }
    },
    { $unwind: "$responses" },
    {
      $group: {
        _id: "$responses",
        count: { $sum: 1 }
      }
    }
  ]);
};

answerSchema.statics.billByCount = function(questionNo) {
  return this.aggregate([
    {
      $match: {
        keywords: { $not: { $size: 0 } },
        questionNo: questionNo
      }
    },
    {
      $group: {
        _id: {
          $reduce: {
            input: "$responses",
            initialValue: "",
            in: { $concat: ["$$value", "$$this"] }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        _id: { $ne: "" }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model("Answer", answerSchema);
