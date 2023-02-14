import {
  CodeMismatchException,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  InvalidParameterException,
  InvalidPasswordException,
  LimitExceededException,
  ExpiredCodeException,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "~/aws.server";
import { WEB_CLIENT_ID } from "~/utils/env";
export async function resetPasswordWithCode(
  code: string,
  email: string,
  confirmPassword: string
) {
  const confirmForgotPasswordCommand: ConfirmForgotPasswordCommandInput = {
    ClientId: WEB_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: confirmPassword,
  };
  try {
    const confirmResetPasswordRequest = await cognito.send(
      new ConfirmForgotPasswordCommand(confirmForgotPasswordCommand)
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log("error", error);
    if (error instanceof ExpiredCodeException) {
      return {
        success: false,
        error: error.message,
      };
    }
    if (error instanceof CodeMismatchException) {
      return {
        success: false,
        error: error.message,
      };
    } else if (error instanceof LimitExceededException) {
      return {
        success: false,
        error: error.message,
      };
    } else if (error instanceof InvalidParameterException) {
      const isRegexError = error.message.includes(
        "Member must satisfy regular expression pattern"
      );
      return {
        success: false,
        error: isRegexError
          ? "Passwords should contain at least one lowercase letter, one uppercase letter and one number"
          : error.message,
      };
    } else if (error instanceof InvalidPasswordException) {
      return {
        success: false,
        error: error.message,
      };
    } else {
      return {
        success: false,
        error: "Error updating user password",
      };
    }
  }
}
