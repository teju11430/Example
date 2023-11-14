const express = require("express");
const app = express();
const hasuraRouter = require("./Routes/hasura");

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the hasura route for handling data insertion
app.use("/hasura", hasuraRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
