import {
  GetUserCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  TooManyFailedAttemptsException,
  UserNotFoundException,
  InvalidParameterException,
  InvalidPasswordException,
  LimitExceededException,
  NotAuthorizedException,
  PasswordResetRequiredException,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "~/aws.server";
import { WEB_CLIENT_ID } from "~/utils/env";

export class NewPasswordRequired extends Error {
  userIdForSRP: string;
  session: string;
  constructor(userIdForSRP: string, session: string) {
    super();
    this.userIdForSRP = userIdForSRP;
    this.session = session;
  }
}
export async function login(email: string, password: string) {
  const initiateAuthCommandInput: InitiateAuthCommandInput = {
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: WEB_CLIENT_ID,
  };

  try {
    const response = await cognito.send(
      new InitiateAuthCommand(initiateAuthCommandInput)
    );
    // return challenge param user id to be used for reseting password
    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      throw new NewPasswordRequired(
        response.ChallengeParameters?.USER_ID_FOR_SRP as string,
        response.Session as string
      );
    }

    const user = await cognito.send(
      new GetUserCommand({
        AccessToken: response.AuthenticationResult?.AccessToken,
      })
    );

    return {
      success: true,
      response: {
        userName: user.Username,
        accessToken: response.AuthenticationResult?.AccessToken,
        refreshToken: response.AuthenticationResult?.RefreshToken,
      },
    };
  } catch (error) {
    if (error instanceof NewPasswordRequired) {
      console.log(JSON.stringify(error));
      return {
        success: false,
        code: "NewPasswordRequired",
        userId: error.userIdForSRP,
        session: error.session,
        error: "New password required",
      };
    }

    if (error instanceof NotAuthorizedException) {
      return {
        success: false,
        code: "NotAuthorizedException",
        error: error.message,
      };
    } else if (error instanceof LimitExceededException) {
      return {
        success: false,
        code: "LimitExceededException",
        error: error.message,
      };
    } else if (error instanceof InvalidParameterException) {
      const isRegexError = error.message.includes(
        "Member must satisfy regular expression pattern"
      );
      return {
        success: false,
        code: "InvalidParameterException",
        error: isRegexError
          ? "Passwords should contain at least one lowercase letter, one uppercase letter and one number"
          : error.message,
      };
    } else if (error instanceof InvalidPasswordException) {
      return {
        success: false,
        code: "InvalidPasswordException",
        error: error.message,
      };
    } else if (error instanceof TooManyFailedAttemptsException) {
      return {
        success: false,
        code: "TooManyFailedAttemptsException",
        error: error.message,
      };
    } else if (error instanceof LimitExceededException) {
      return {
        success: false,
        code: "LimitExceededException",
        error: error.message,
      };
    } else if (error instanceof UserNotFoundException) {
      return {
        success: false,
        code: "UserNotFoundException",
        error: error.message,
      };
    } else if (error instanceof PasswordResetRequiredException) {
      return {
        success: false,
        code: "PasswordResetRequiredException",
        error: error.message,
      };
    } else {
      console.log("error", error);
      return {
        success: false,
        error: "Error updating user password",
      };
    }
  }
}
