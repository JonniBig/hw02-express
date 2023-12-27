const express = require("express");

const {
  users: { signIn, signUp, logOut, getCurrentUser },
} = require("../../controllers");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.post("/register", signUp);

router.post("/login", signIn);
router.post("/logout", authenticate, logOut);

router.get("/current", authenticate, getCurrentUser);

module.exports = router;
