import { ForgotPasswordCommandInput } from "@aws-sdk/client-cognito-identity-provider";
import {
  ForgotPasswordCommand,
  LimitExceededException,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "~/aws.server";
import { WEB_CLIENT_ID } from "~/utils/env";

/**
 * This function is used to send a code to the user's email address.
 */
export async function sendResetPasswordCode(email: string) {
  const forgotPasswordCommandInput: ForgotPasswordCommandInput = {
    ClientId: WEB_CLIENT_ID,
    Username: email,
  };

  try {
    const req = await cognito.send(
      new ForgotPasswordCommand(forgotPasswordCommandInput)
    );
    console.log("req", req);
    return {
      success: true,
    };
  } catch (error) {
    // let's not expose any detail to the user - user not authenticated at this point
    console.log("error", error);
    if (error instanceof LimitExceededException) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Error sending code",
    };
  }
}
