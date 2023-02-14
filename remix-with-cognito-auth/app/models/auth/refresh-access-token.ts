import {
    InitiateAuthCommandInput,
  } from "@aws-sdk/client-cognito-identity-provider";
  import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
  import { cognito } from "~/aws.server";
  import {
    WEB_CLIENT_ID,
  } from "~/utils/env";

export async function refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    response?: { accessToken: string; refreshToken: string };
    error?: string;
  }> {
    const initiateAuthCommandInput: InitiateAuthCommandInput = {
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: WEB_CLIENT_ID,
    };
  
    try {
      const response = await cognito.send(
        new InitiateAuthCommand(initiateAuthCommandInput)
      );
      console.log("resfresh token response;", response);
      return {
        success: true,
        response: {
          accessToken: response.AuthenticationResult?.AccessToken!,
          refreshToken: response.AuthenticationResult?.RefreshToken!,
        },
      };
    } catch (error) {
      console.log("error resfresh token response:", error);
      return {
        success: false,
        error: "Error refreshing token",
      };
    }
  }