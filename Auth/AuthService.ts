import { SignUpParams } from "@aws-amplify/auth";
import { Amplify, Auth } from "aws-amplify";
import { config } from "./config";

Amplify.configure({
  mandatorySignIn: false,
  region: config.REGION,
  userPoolId: config.USER_POOL_ID,
  userPoolWebClientId: config.USER_POOL_CLIENT_ID,
  authenticationFlowType: "USER_PASSWORD_AUTH",
});

export class AuthService {
  public async signUp(params: SignUpParams) {
    let message: string;
    try {
      const { user } = await Auth.signUp(params);
      message = "Please check your mail to verify sign-up";
    } catch (err) {
      message = (err as { message: string }).message;
    }
    return message;
  }
  public async confirmSignUp(username: string, code: string): Promise<string> {
    let result: string;
    try {
      result = await Auth.confirmSignUp(username, code);
    } catch (err) {
      result = "Confirmation Failed";
    }
    return result;
  }
  public async login(username: string, password: string) {
    let result: string = "Successful Login";

    try {
      const user = await Auth.signIn(username, password);
      return { user, result };
    } catch (err) {
      result = (err as { message: string }).message;
      return result;
    }
  }
  public async ifLoggedIn(): Promise<boolean> {
    let result: boolean = true;
    try {
      const { attributes } = await Auth.currentAuthenticatedUser({
        bypassCache: false,
      });
    } catch (err) {
      result = false;
    }
    return result;
  }
}
