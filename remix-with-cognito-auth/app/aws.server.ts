import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import {
  USERPOOL_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from "~/utils/env";

const cognito = new CognitoIdentityProviderClient({
  region: USERPOOL_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export { cognito };
