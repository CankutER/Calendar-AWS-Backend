import { AuthService } from "../Auth/AuthService";

const authService = new AuthService();

async function testSignUp() {
  const user = await authService.signUp({
    username: "username",
    password: "pass",
    attributes: { email: "mail@mail.com" },
  });
}
async function testConfirmSignUp() {
  const result = await authService.confirmSignUp("username", "verif code");
}
async function testIfLoggedIn() {
  await authService.ifLoggedIn();
}
async function testLogin() {
  const result = authService.login("username", "pass");
}
testLogin();
