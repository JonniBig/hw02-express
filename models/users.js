const Joi = require("joi");
const {
  constants: { emailValidateRegex },
} = require("../utils");
const { model, Schema } = require("mongoose");

const userBodySchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().pattern(emailValidateRegex).required(),
});

const userVerifySchema = Joi.object({
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
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

userSchema.post("save", (error, data, next) => {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("some mongo error happened"));
  }
});

const User = model("user", userSchema);

module.exports = {
  User,
  userBodySchema,
  userVerifySchema,
};
