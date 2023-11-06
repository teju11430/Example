const app = {
  insertSignUp: `
    mutation InsertSignUp($email: String!, $phone: Int!, $password: String!) {
      insert_signin(objects: { email: $email, phone: $phone, password: $password }) {
        affected_rows
      }
    }
  `,

  checkSignup: `
  query CheckSignin($email: String!) {
    signin(where: { email: { _eq: $email } }) {
      id
      password
    }
  }
`,
};
module.exports = app;
