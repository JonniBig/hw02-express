const express = require("express");

const {
  users: { signIn, signUp, logOut, getCurrentUser },
} = require("../../controllers");

const router = express.Router();

router.post("/register", signUp);

router.post("/login", signIn);
router.post("/logout", logOut);

router.get("/current", getCurrentUser);

module.exports = router;
