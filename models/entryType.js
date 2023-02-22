const { number } = require("joi");
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  is_Vaccinated: Boolean,
  birthdate: { type: Date, default: new Date() },
  gender: { type: String, required: true },
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
