const { isValidObjectId } = require("mongoose");
const {
  Contact,
  addContactSchema,
  updateFavoriteSchema,
} = require("../models/contacts");

const getAllContactsController = async (req, res, next) => {
  const contacts = await Contact.find();
  res.json(contacts);
};

const getContactByIdController = async (req, res, next) => {
  const contactId = req.params.contactId;
  const isValidId = isValidObjectId(contactId);
  if (!isValidId) {
    res.status(400).json({ message: `${contactId} isn't a valid contactId!` });
    return;
  }

  const contact = await Contact.findById(contactId);

  res.json(contact);
};

const addContactController = async (req, res, next) => {
  const body = req.body;

  const { error } = addContactSchema.validate(body);

  if (error) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }

  const newContact = await Contact.create(body);
  res.status(201).json(newContact);
};

const deleteContactController = async (req, res, next) => {
  const contactId = req.params.contactId;
  const isValidId = isValidObjectId(contactId);
  if (!isValidId) {
    res.status(400).json({ message: `${contactId} isn't a valid contactId!` });
    return;
  }
  const deletedContact = await Contact.findByIdAndDelete(contactId);

  res.json(deletedContact);
};

const updateContactController = async (req, res, next) => {
  const contactId = req.params.contactId;
  const isValidId = isValidObjectId(contactId);
  if (!isValidId) {
    res.status(400).json({ message: `${contactId} isn't a valid contactId!` });
    return;
  }
  const body = req.body;
  const { error } = addContactSchema.validate(body);

  if (error) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }

  const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });

  res.json(updatedContact);
};

const updateFavoriteContactController = async (req, res) => {
  const contactId = req.params.contactId;
  const isValidId = isValidObjectId(contactId);
  if (!isValidId) {
    res.status(400).json({ message: `${contactId} isn't a valid contactId!` });
    return;
  }
  const body = req.body;
  const { error } = updateFavoriteSchema.validate(body);

  if (error) {
    res.status(400).json({ message: "missing required favourite field" });
    return;
  }
  const result = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  res.json(result);
};

module.exports = {
  getAllContactsController,
  getContactByIdController,
  addContactController,
  deleteContactController,
  updateContactController,
  updateFavoriteContactController,
};
