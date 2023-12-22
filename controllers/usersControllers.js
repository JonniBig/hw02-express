const bcrypt = require("bcryptjs");
const {
  users: { User, userBodySchema },
} = require("../models");

const signUp = async (req, res, next) => {
  const userBody = req.body;

  const { error } = userBodySchema.validate(userBody);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  const isEmailInUse = User.findOne({ email: userBody.email });
  console.log("isEmailInUse: ", isEmailInUse);
  if (isEmailInUse) {
    res.status(409).json({ message: "Email in use" });
    return;
  }
  const hashPassword = await bcrypt.hash(userBody.password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });
  res
    .status(201)
    .json({ subcription: newUser.subscription, email: newUser.email });
};
const signIn = async (req, res, next) => {};
const logOut = async (req, res, next) => {};
const getCurrentUser = async (req, res, next) => {};

module.exports = { signUp, signIn, logOut, getCurrentUser };
