const vaclist = require("../models/entryType.js");
const express = require("express");
const Joi = require("joi");
const moment = require("moment");

const router = express.Router();

router.get("/data", async (req, res) => {
  try {
    const list = await vaclist.find().sort();
    res.send(list);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error: " + error.message);
  }
});
router.get("/count", async (req, res) => {
  try {
    //   const list = await vaclist.find().sort();
    //   res.send(list);
    console.log(req.query);
    const isVaccinated = req.query.is_Vaccinated === "true";
    // console.log(typeof isVaccinated);
    const data = await vaclist.aggregate([
      {
        $match: { is_Vaccinated: isVaccinated },
      },
      {
        $project: {
          age: {
            $divide: [
              { $subtract: [new Date(), "$birthdate"] },
              31536000000, // 1 year in milliseconds
            ],
          },
        },
      },
      {
        $group: {
          _id: { $floor: "$age" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          age: "$_id",
          count: 1,
        },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error: " + error.message);
  }
});

router.get("/results", async (req, res) => {
  try {
    const data = await vaclist.aggregate([
      {
        $addFields: {
          age: {
            $subtract: [{ $year: new Date() }, { $year: "$birthdate" }],
          },
        },
      },
      {
        $group: {
          _id: {
            gender: "$gender",
            age: "$age",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          gender: "$_id.gender",
          age: "$_id.age",
          count: 1,
        },
      },
    ]);
    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error: " + error.message);
  }
});

router.post("/vote", async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      is_Vaccinated: Joi.boolean(),
      birthdate: Joi.date(),
      gender: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const { name, is_Vaccinated, birthdate, gender, uid } = req.body;

    let list = new vaclist({ name, is_Vaccinated, birthdate, gender, uid });

    list = await list.save();
    res.send(list);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error.message);
  }
});
module.exports = router;
