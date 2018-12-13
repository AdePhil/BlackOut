const Answer = require('../models/Answer');
const Response = require('../models/Response');

exports.post = async (req, res) => {
  const { responses, location } = req.body;
  const userId = req.user._id;


  AnswersPromise = responses.map(answer => {
    return new Answer({
      question: answer.question,
      questionNo: answer.questionNo,
      responses: answer.responses
    }).save();
  });



  try {

    const savedAnswers = await Promise.all(AnswersPromise);
    const answersIds = savedAnswers.map(answer => answer._id);
    const savedResponse = await new Response({
      response: answersIds,
      user: userId,
      location
    }).save();

    res.json({
      savedResponse
    });

  } catch (error) {
    res.json({ error });
  }



}