const mongoose = require('mongoose');


const responseSchema = new mongoose.Schema({

  response: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String

});

responseSchema.statics.locationByCount = function(){
  return this.aggregate([
    {
        $match: {
            keywords: { $not: { $size: 0 } }
        }
    },
    { $unwind: "$location" },
    {
        $group: {
            _id: '$location',
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            count: { $gte: 2 }
        }
    },
    // { $sort: { count: -1 } },
]);
}


module.exports = mongoose.model('Response', responseSchema);
