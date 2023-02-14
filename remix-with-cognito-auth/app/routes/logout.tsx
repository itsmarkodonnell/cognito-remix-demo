import { ActionArgs, redirect } from "@remix-run/node";

import { logoutSession } from "~/utils/cookies/auth-session-cookies.server";

export async function action({ request }: ActionArgs) {
  return logoutSession(request);
};

export async function loader() {
  return redirect("/");
}
