const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  users: { User, userBodySchema, userVerifySchema },
} = require("../models");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const { sendEmail } = require("../helpers/sendEmail");
const dotenv = require("dotenv");
dotenv.config();

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
  const verificationToken = nanoid();
  const avatarURL = gravatar.url(userBody.email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: newUser.email,
    subject: "verification email",
    html: `<a href='${process.env.PROJECT_URL}/users/verify/${verificationToken}'
     target="_blank">click to verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.status(201).json({
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

  if (!user.verify) {
    res.status(400).json({ message: "You need to verify your email first" });
    return;
  }

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

const verification = async (req, res, next) => {
  const verificationToken = req.params.verificationToken;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  res.status(200).json({
    message: "Verification successful",
  });
};

const verifyAgain = async (req, res, next) => {
  const userBody = req.body;

  const { error } = userVerifySchema.validate(userBody);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }

  const { email } = userBody;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.verify) {
    res.status(400).json({ message: "Verification has already been passed" });
    return;
  }
  const verifyEmail = {
    to: user.email,
    subject: "verification email",
    html: `<a href='${process.env.PROJECT_URL}/users/verify/${user.verificationToken}'
     target="_blank">click to verify email</a>`,
  };
  await sendEmail(verifyEmail);
  res.status(200).json({
    message: "Verification email sent",
  });
};

module.exports = {
  signUp,
  signIn,
  logOut,
  getCurrentUser,
  uploadAvatar,
  verification,
  verifyAgain,
};
