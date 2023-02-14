import { AdminGetUserCommand, AdminRespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognito } from "~/aws.server";
import { WEB_CLIENT_ID, USERPOOL_ID } from "~/utils/env";
/**
 * After user enters their temporary password they get the session string back to their front end. They can pass
 * that session string and their new password to this function to set their new password
 */
export const setNewPasswordOnLogin = async (
  userId: string,
  newPassword: string,
  session: string
) => {
  try {
    const changePasswordCommand = new AdminRespondToAuthChallengeCommand({
      ClientId: WEB_CLIENT_ID,
      UserPoolId: USERPOOL_ID,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        USERNAME: userId,
        NEW_PASSWORD: newPassword,
      },
      Session: session,
    });

    const changePasswordResponse = await cognito.send(changePasswordCommand);
    
    // get user from db or cognito here using userId
    
    // use admingetuser to get user from cognito

    const getUserCommand: AdminGetUserCommand = new AdminGetUserCommand({
      UserPoolId: USERPOOL_ID,
      Username: userId,
    });

    const user = await cognito.send(getUserCommand);

    if (changePasswordResponse.AuthenticationResult) {
      return {
        success: true,
        response: {
          userName: userId,
          email: user.UserAttributes?.find((attr) => attr.Name === 'email')?.Value,
          accessToken: changePasswordResponse.AuthenticationResult?.AccessToken,
          refreshToken:
            changePasswordResponse.AuthenticationResult?.RefreshToken,
        },
      };
    } else {
      throw new Error("Failed to reset password");
    }
  } catch (error) {
    throw error;
  }
};
