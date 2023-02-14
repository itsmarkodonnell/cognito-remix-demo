import type {
    ActionArgs,
    LoaderArgs,
    MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useActionData } from "@remix-run/react";
import * as React from "react";
import { setNewPasswordOnLogin } from "~/models/auth/set-new-password-on-login"
import { login } from "~/models/auth/login";
import toast from "react-hot-toast";
import { createUserSession, getUserSessionFromCookie } from "~/utils/cookies/auth-session-cookies.server";
import { safeRedirect, validateEmail, validatePassword } from "~/utils/utils";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { accessTokenVerifier } from "~/models/utils/withAuth.server";

export async function loader({ request }: LoaderArgs) {
    const session = await getUserSessionFromCookie(request);
    let accessToken = session.get("accessToken");
    if (accessToken) {
        try {
            // verify the token
            const token = await accessTokenVerifier.verify(accessToken);
            // redirect
            return redirect("/dashboard");
        } catch (err) {
            console.log("Not logged in");
        }
        accessToken = null;
    }
    return json({});
}

export type ActionType = "login" | "setNewPasswordOnLogin";

export type ActionData = {
    action: ActionType;
    success: boolean;
    error?: string;
    userId?: string;
    code?: string;
    session?: string;
};

export async function action({ request }: ActionArgs) {
    const formData = await request.formData();

    if (formData.get("_action") === "setNewPasswordOnLogin") {
        const userId = formData.get("userId") as string;
        const session = formData.get("session") as string;
        const newPassword = formData.get("password") as string;
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.status) {
            return json(
                {
                    action: "login",
                    success: false,
                    error: passwordValidation.error,
                },
                { status: 400 }
            );
        }

        const setNewPasswordOnLoginRequest = await setNewPasswordOnLogin(userId, newPassword, session)


        let redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");

        const { email, userName, accessToken, refreshToken } = setNewPasswordOnLoginRequest.response;
        return await createUserSession({
            request,
            userInfo: {
                userName,
                email: email as string,
                accessToken: accessToken as string,
                refreshToken: refreshToken as string,
            },
            redirectTo,
        });
    }

    if (formData.get("_action") === "login") {
        const email = formData.get("email");
        const password = formData.get("password")?.toString();

        if (!validateEmail(email)) {
            return json(
                {
                    action: "login",
                    success: false,
                    error: "Email is invalid",
                },
                { status: 400 }
            );
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.status) {
            return json(
                {
                    action: "login",
                    success: false,
                    error: passwordValidation.error,
                },
                { status: 400 }
            );
        }
        try {
            const loginRequest = await login(email as string, password as string);
            if (!loginRequest?.success) {
                if (loginRequest?.code === "NewPasswordRequired") {
                    return json(
                        {
                            action: "login",
                            success: false,
                            code: "NewPasswordRequired",
                            userId: loginRequest.userId,
                            session: loginRequest.session,
                            error: loginRequest.error
                        },
                        { status: 400 }
                    );
                }
                return json(
                    {
                        action: "login",
                        success: false,
                        error: loginRequest?.error,
                    },
                    { status: 401 }
                );
            }

            let redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");

    
            return await createUserSession({
                request,
                userInfo: {
                    userName: loginRequest?.response?.userName as string,
                    accessToken: loginRequest?.response?.accessToken as string,
                    refreshToken: loginRequest?.response?.refreshToken as string,
                    email: email,
                },
                redirectTo,
            });

        } catch (error) {
            console.log({ error });
        }
    }
};

export const meta: MetaFunction = () => {
    return {
        title: "itsmarkodonnell | Login",
    };
};

export default function LoginPage() {

    const actionData = useActionData<ActionData>();
    React.useEffect(() => {
        if (actionData?.action === "login") {
            if (!actionData.success) {
                toast(
                    (t) => (
                        <div className="flex w-full min-w-min items-center font-medium text-stock">
                            <ExclamationCircleIcon className="mr-2 h-7 w-7 text-yellow-500" />
                            <span className="w-full">{actionData.error}</span>
                            <div className="">
                                <button onClick={() => toast.dismiss(t.id)}>
                                    {<XMarkIcon className="ml-5 h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    ),
                    {
                        position: "top-right",
                    }
                );
            }
        }
    }, [actionData]);
    return (
        <div className="flex min-h-full">
            <div className="relative hidden w-0 flex-1 lg:block border border-l-0 border-y-0 border-r-4 border-green-600">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1658297063569-162817482fb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
                    alt=""
                />
            </div>
            <Outlet />
        </div>
    );
}