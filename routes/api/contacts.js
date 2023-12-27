const express = require("express");

const {
  contacts: {
    getAllContactsController,
    getContactByIdController,
    addContactController,
    deleteContactController,
    updateContactController,
    updateFavoriteContactController,
  },
} = require("../../controllers");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, getAllContactsController);

router.get("/:contactId", authenticate, getContactByIdController);

router.post("/", authenticate, addContactController);

router.delete("/:contactId", authenticate, deleteContactController);

router.put("/:contactId", authenticate, updateContactController);

router.patch(
  "/:contactId/favorite",
  authenticate,
  updateFavoriteContactController
);

module.exports = router;
