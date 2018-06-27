const Answer = require('../models/Answer');
const Response = require('../models/Response');

exports.post = async (req, res) => {
  const { responses, location } = req.body;
  console.log(responses);
  console.log('req user obj', req.user._id);
  const userId = req.user._id;


  AnswersPromise = responses.map(answer => {
    console.log(answer);
    return new Answer({
      question: answer.question,
      questionNo: answer.questionNo,
      responses: answer.responses
    }).save();
  });



  try {

    const savedAnswers = await Promise.all(AnswersPromise);
    console.log("savedAnswers", savedAnswers);
    const answersIds = savedAnswers.map(answer => answer._id);
    console.log(userId);

    const savedResponse = await new Response({
      response: answersIds,
      user: userId,
      location
    }).save();

    console.log("savedResponse", savedResponse);

    res.json({
      savedResponse
    });

  } catch (error) {
    res.json({ error });
  }



}