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

const router = express.Router();

router.get("/", getAllContactsController);

router.get("/:contactId", getContactByIdController);

router.post("/", addContactController);

router.delete("/:contactId", deleteContactController);

router.put("/:contactId", updateContactController);

router.patch("/:contactId/favorite", updateFavoriteContactController);

module.exports = router;
