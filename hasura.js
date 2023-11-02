const express = require("express");
const router = express.Router();

router.post("/insert-signup", async (req, res) => {
  try {
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    if (!email || !password || !phone) {
      return res.status(400).json({ error: "Please provide the body" });
    }

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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": adminSecret,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { email, phone, password },
      }),
    });

    const responseData = await response.json(); // Correctly parse the response
    console.log(responseData);
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

router.post("/check-signin", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ error: "Please provide the email and password" });
    }

    const query = `
      query CheckSignin($email: String!, $password: String!) {
        signin(where: { email: { _eq: $email }, password: { _eq: $password } }) {
          id
        }
      }
    `;

    const apiUrl = "https://pro-goose-67.hasura.app/v1/graphql";
    const adminSecret =
      "jboElHn7eyalm39pZ1n3vMpGk5egruSsHUuXVa4M0VIRUavnb4jzc6c2OslBGWwv";

    const { default: fetch } = await import("node-fetch");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": adminSecret,
      },
      body: JSON.stringify({
        query,
        variables: { email, password },
      }),
    });
    const responseData = await response.json();

    if (responseData.errors) {
      return res.status(400).json({ error: "Failed to check login" });
    } else if (responseData.data.signin.length > 0) {
      const id = responseData.data.signin[0].id;
      return res.status(200).json({ message: "Match found", id });
    } else {
      return res.status(404).json({ message: "No data match found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

module.exports = router;
