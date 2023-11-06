const apiUrl = "https://pro-goose-67.hasura.app/v1/graphql";
const adminSecret =
  "jboElHn7eyalm39pZ1n3vMpGk5egruSsHUuXVa4M0VIRUavnb4jzc6c2OslBGWwv";
const _ = require("lodash");
const bcrypt = require("bcrypt");
const app = require("../Utils/gql");

const helper = {
  query_variable: async (query, variables = {}, headers = {}) => {
    return (
      await fetch(apiUrl, {
        method: "POST",
        headers: _.merge(
          {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": adminSecret, // Use the admin secret here
          },
          headers
        ),
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      })
    ).json();
  },

  insertSignUp: async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      console.log("Signup hash", hashedPassword);

      const mutationForSignUp = await helper.query_variable(app.insertSignUp, {
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPassword,
      });

      console.log(mutationForSignUp);
      if (!req.body.email || !req.body.password || !req.body.phone) {
        return res.status(400).json({ error: "Please provide the body" });
      } else if (mutationForSignUp.errors) {
        return res
          .status(400)
          .json({ error: "Failed to insert data into the table" });
      } else if (mutationForSignUp.data.insert_signin.affected_rows > 0) {
        return res.status(200).json({ message: "Data inserted successfully" });
      } else {
        res.status(400).json({ message: "Something else went wrong." });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the request" });
    }
  },

  checkSignIn: async (req, res) => {
    try {
      const querySignIn = await helper.query_variable(app.checkSignup, {
        email: req.body.email,
      });

      if (querySignIn.error) {
        return res.status(400).json({ error: "Failed to check login" });
      } else if (
        querySignIn.data.signin &&
        querySignIn.data.signin.length > 0
      ) {
        const storedPasswordHash = querySignIn.data.signin[0].password;
        const id = querySignIn.data.signin[0].id;
        const password = req.body.password;
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
  },
};

module.exports = helper;
