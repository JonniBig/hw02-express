const app = require("./app");
const mongoose = require("mongoose");
const { sendEmail } = require("./helpers/sendEmail");

const DB_HOST = process.env.DB_HOST || "";

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
