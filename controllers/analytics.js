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
  const uniqueStreetPromise = Response.distinct("street");
  const uniqueRegionPromise = Response.distinct("region");

  const result = await Promise.all([
    responsesPromise,
    usersPromise,
    answersPromise,
    questionsPromise,
    uniqueStreetPromise,
    uniqueRegionPromise
  ]);


  const [responseCount, usersCount, answersCount, questions, streets, regions] = result;
  res.render("home", {
    responseCount,
    usersCount,
    answersCount,
    questionsCount: questions.length,
    streets,
    regions,
    title: "admin-home"
  });

};

exports.questionByCount = async (req, res) => {
  const questionNo = req.body.questionNo;
  const street = req.body.street || {};
  const region = req.body.region || {};

  const questionByCount = await Response.questionByCount(questionNo, street, region);
  res.json(questionByCount);
};

exports.billByCount = async (req, res) => {
  const questionNo = req.body.questionNo;
  const street = req.body.street || {};
  const region = req.body.region || {};

  const billByCount = await Response.billByCount(questionNo, street, region);
  res.json(billByCount);
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
  const sheetName = "Responses";
  const workBook = XLSX.utils.book_new();
  workBook.SheetNames.push(sheetName);

  let header = ["id","Locations"];
  let rows = responses.map((response, i) => {
    if(i == 0){
      header =  [...header, ...response.questions];
    }
    return [`${response._id}`, response.location ,...response.answers];
  });


  rows = [header, ...rows];

  const data = XLSX.utils.aoa_to_sheet(rows);
  workBook.Sheets[sheetName] = data;

  const workBookBinary = XLSX.write(workBook, {
    bookType: "xlsx",
    type: "buffer"
  });

  const fileName = "report.xlsx";
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

  res.send(new Buffer(workBookBinary));
};

exports.streetsByRegion = async (req, res) => {
  const region = req.body.region;
  const streets = await Response.streetsByRegion(region);

  res.json(streets);
}
