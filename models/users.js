const Joi = require("joi");
const {
  constants: { emailValidateRegex },
} = require("../utils");
const { model, Schema } = require("mongoose");

const userBodySchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailValidateRegex).required(),
});

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: emailValidateRegex,
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  avatarURL: String,
  token: String,
});

const User = model("user", userSchema);

module.exports = {
  User,
  userBodySchema,
};
