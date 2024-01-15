const express = require("express");

const {
  users: { signIn, signUp, logOut, getCurrentUser, uploadAvatar },
} = require("../../controllers");
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();

router.post("/register", signUp);

router.post("/login", signIn);
router.post("/logout", authenticate, logOut);

router.get("/current", authenticate, getCurrentUser);

router.patch("/avatars", authenticate, upload.single("avatar"), uploadAvatar);

module.exports = router;
