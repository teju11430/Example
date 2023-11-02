const express = require("express");
const router = express.Router();

router.post("/insert-signin", async (req, res) => {
  try {
    if (!req.body.email || !req.body.phone || !req.body.password) {
      return res.status(400).json({ error: "Please provide the body" });
    }

    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    const mutation = `
      mutation InsertSignin($email: String!, $phone: Int!, $password: String!) {
        insert_signin(objects: { email: $email, phone: $phone, password: $password }) {
          affected_rows
        }
      }
    `;

    const apiUrl = "https://pro-goose-67.hasura.app/v1/graphql";
    const adminSecret =
      "jboElHn7eyalm39pZ1n3vMpGk5egruSsHUuXVa4M0VIRUavnb4jzc6c2OslBGWwv";

    const { default: fetch } = await import("node-fetch");

    const response = await (
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { email, phone, password },
        }),
      })
    ).json;

    const responseData = response;

    if (responseData.errors) {
      return res
        .status(400)
        .json({ error: "Failed to insert data into the table" });
    } else {
      return res.status(200).json({ message: "Data inserted successfully" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

module.exports = router;
