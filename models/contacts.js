const fs = require("fs/promises");
const Joi = require("joi");
const path = require("path");
const contactsPath = path.join(__dirname, "contacts.json");

const addContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

const listContacts = async () => {
  const conatcts = JSON.parse(await fs.readFile(contactsPath, "utf8"));
  return conatcts;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  return contacts.find((contact) => contact.id === contactId) ?? null;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const removedContact = contacts.find((contact) => contact.id === contactId);

  if (!removedContact) {
    return null;
  }
  const updatedContacts = contacts.filter(
    (contact) => contact.id !== contactId
  );
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

  return removedContact;
};

const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = {
    id: Date.now().toString(),
    name: body.name,
    email: body.email,
    phone: body.phone,
  };
  const updatedContacts = [...contacts, newContact];

  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();

  const updatedContacts = contacts.map((contact) => {
    if (contact.id === contactId) {
      return { ...contact, ...body };
    }
    return contact;
  });
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));

  const updatedContact = updatedContacts.find(
    (contact) => contact.id === contactId
  );
  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  addContactSchema,
};
