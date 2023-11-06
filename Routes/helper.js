const apiUrl = "https://pro-goose-67.hasura.app/v1/graphql";
const adminSecret =
  "jboElHn7eyalm39pZ1n3vMpGk5egruSsHUuXVa4M0VIRUavnb4jzc6c2OslBGWwv";
const _ = require("lodash");

let helper = {
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
};

module.exports = helper;
