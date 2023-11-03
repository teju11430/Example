const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/insert-signup", async (req, res) => {
  try {
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    if (!email || !password || !phone) {
      return res.status(400).json({ error: "Please provide the body" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('signup hash', hashedPassword);

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
        variables: { email, phone, password: hashedPassword },
      }),
    });

    const responseData = await response.json();
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

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide the email and password" });
    }

    const query = `
      query CheckSignin($email: String!) {
        signin(where: { email: { _eq: $email } }) {
          id
          password
        }
      }
    `;

    const apiUrl = "https://pro-goose-67.hasura.app/v1/graphql";
    const adminSecret =
      "jboElHn7eyalm39pZ1n3vMpGk5egruSsHUuXVa4M0VIRUavnb4jzc6c2OslBGWwv";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": adminSecret,
      },
      body: JSON.stringify({
        query,
        variables: { email },
      }),
    });

    const responseData = await response.json();

    console.log("Email:", email);
    console.log("Response Data:", responseData);

    if (responseData.error) {
      return res.status(400).json({ error: "Failed to check login" });
    } else if (
      responseData.data.signin &&
      responseData.data.signin.length > 0
    ) {
      const storedPasswordHash = responseData.data.signin[0].password;
      const id = responseData.data.signin[0].id;

      const passwordMatch = await bcrypt.compare(
        password,
        storedPasswordHash
      );

      if (passwordMatch) {
        return res.status(200).json({ message: "Password matched", id });
      } else {
        return res.status(401).json({ error: "Password does not match" });
      }
    } else {
      return res.status(404).json({ error: "No data match found" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

module.exports = router;
