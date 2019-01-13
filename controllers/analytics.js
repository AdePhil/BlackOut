const Response = require("../models/Response");
const Answer = require("../models/Answer");
const User = require("../models/User");
const XLSX = require("xlsx");
const path = require("path");

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

exports.billByCount = async (req, res) => {
  const questionNo = req.body.questionNo;
  const questionByCount = await Answer.billByCount(questionNo);
  res.json(questionByCount);
};

exports.locationByCount = async (req, res) => {
  const locationByCount = await Response.locationByCount();
  return res.json(locationByCount);
};

exports.locations = async (req, res) => {
  res.render("locations", { title: "locations" });
};

exports.generateReport = async (req, res) => {
  const responses = await Response.generateReport();
  // console.log(responses);
  const sheetName = "Responses";
  const workBook = XLSX.utils.book_new();
  workBook.SheetNames.push(sheetName);

  //  console.log(excelData);
  let header = ["id","Locations"];
  let rows = responses.map((response, i) => {
    if(i == 0){
      header =  [...header, ...response.questions];
    }
    console.log(response);
    return [`${response._id}`, response.location ,...response.answers];
  });

  //console.log(row);
  //console.log(header);

  rows = [header, ...rows];

  const data = XLSX.utils.aoa_to_sheet(rows);
  workBook.Sheets[sheetName] = data;

  const workBookBinary = XLSX.write(workBook, {
    bookType: "xlsx",
    type: "buffer"
  });

  const fileName = "report.xlsx"; // The default name the browser will use
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

  //res.download(workBookBinary);
  res.send(new Buffer(workBookBinary));
};
