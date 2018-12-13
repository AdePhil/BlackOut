const Response = require("../models/Response");
const Answer = require("../models/Answer");
const User = require("../models/User");

exports.dashboard = async (req, res) => {
  const responsesPromise = Response.count();
  const usersPromise = User.find({
    $and: [
      { email: { $regex: "^((?!tes).)*$", $options: "i" }, isAdmin: false }
    ]
  }).count();
  const answersPromise = Answer.count();
  const questionsPromise = Answer.distinct("question");

  const result = await Promise.all([
    responsesPromise,
    usersPromise,
    answersPromise,
    questionsPromise
  ]);

  const [responseCount, usersCount, answersCount, questions] = result;
  res.render("home", {
    responseCount,
    usersCount,
    answersCount,
    questionsCount: questions.length,
    title: "admin-home"
  });
};

exports.questionByCount = async (req, res) => {
  const questionNo = req.body.questionNo;
  const questionByCount = await Answer.questionByCount(questionNo);
  res.json(questionByCount);
};

exports.billByCount = async(req, res) => {
  const questionNo = req.body.questionNo;
  const questionByCount = await Answer.billByCount(questionNo);
  res.json(questionByCount);
}

exports.locationByCount = async (req, res) => {
  const locationByCount = await Response.locationByCount();
  return res.json(locationByCount);
};

exports.locations = async (req, res) => {
  res.render("locations", { title: "locations" });
};
