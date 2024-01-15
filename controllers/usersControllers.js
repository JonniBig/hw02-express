const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  users: { User, userBodySchema },
} = require("../models");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const gravatar = require("gravatar");

const signUp = async (req, res, next) => {
  const userBody = req.body;

  const { error } = userBodySchema.validate(userBody);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  const isEmailInUse = await User.exists({ email: userBody.email });
  if (isEmailInUse) {
    res.status(409).json({ message: "Email in use" });
    return;
  }
  const hashPassword = await bcrypt.hash(userBody.password, 10);

  const avatarURL = gravatar.url(userBody.email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });
  res
    .status(201)
    .json({
      subcription: newUser.subscription,
      email: newUser.email,
      avatarURL: newUser.avatarURL,
    });
};

const signIn = async (req, res, next) => {
  const userBody = req.body;
  const { error } = userBodySchema.validate(userBody);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const user = await User.findOne({ email: userBody.email });
  const isPasswordMatches = await bcrypt.compare(
    userBody.password,
    user.password
  );
  if (!isPasswordMatches) {
    res.status(401).json({ message: "Email or password is wrong" });
    return;
  }
  const payload = { _id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};
const getCurrentUser = async (req, res, next) => {
  const user = req.user;
  res.json({ email: user.email, subscription: user.subscription });
};
const logOut = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};
const avatarPath = path.resolve("public", "avatars");

const uploadAvatar = async (req, res, next) => {
  const user = req.user;
  if (!req.file) {
    res
      .status(400)
      .json({ message: 'Please add avatar image to field "avatar"' });
    return;
  }
  const { path: tmpPath, filename } = req.file;

  const newPath = path.join(avatarPath, filename);
  const oldPath = tmpPath;

  await fs.rename(oldPath, newPath);
  jimp.read(newPath, (err, selectedFile) => {
    if (err) throw err;
    selectedFile.resize(250, 250).write(newPath);
  });
  const userAvatarPath = path.join("avatars", filename);
  await User.findByIdAndUpdate(user._id, { avatarURL: userAvatarPath });
  res.status(200).json({
    avatarURL: userAvatarPath,
  });
};

module.exports = { signUp, signIn, logOut, getCurrentUser, uploadAvatar };
