const mongoose = require('mongoose');


const responseSchema = new mongoose.Schema({

  response: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    type: String,
    trim: true
   },
  address: {
    type: String,
    trim: true
},
  street: {
    type: String,
    trim: true
},
  region: {
    type: String,
    trim: true
},
});

responseSchema.statics.locationByCount = function(){
  return this.aggregate([
    {
        $match: {
            keywords: { $not: { $size: 0 } }
        }
    },
    { $unwind: "$street" },
    {
        $group: {
            _id: '$street',
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            count: { $gte: 1 }
        }
    },
]);
}

responseSchema.statics.generateReport = function () {
    return this.aggregate([
        { $lookup: { from: 'answers', localField: 'response', foreignField: '_id', as: 'response' } },
        { $unwind: "$response" },
        { $unwind: "$response.responses" },
        { $project: { location: 1, question: "$response.question", questionNo: "$response.questionNo", answer: "$response.responses" } },
        {
            $group: {

                _id: "$_id",
                answers: { $push: "$answer" },
                questions: { $push: "$question" },
                location: { $first: "$location" }
            }
        },
        // { $project: { _id: 0 } },
        { $sort: { location: -1 } }
    ]);
}


module.exports = mongoose.model('Response', responseSchema);
