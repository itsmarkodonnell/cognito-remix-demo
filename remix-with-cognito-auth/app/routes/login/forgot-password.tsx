import type {
    ActionFunction,
    LoaderArgs,
    MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useTransition } from "@remix-run/react";
import * as React from "react";
import toast from "react-hot-toast";
import { createUserSession, getUserSessionFromCookie } from "~/utils/cookies/auth-session-cookies.server";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { resetPasswordWithCode } from "~/models/auth/reset-password-with-code"
import { sendResetPasswordCode } from "~/models/auth/send-reset-password-code";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { accessTokenVerifier } from "~/models/utils/withAuth.server";
import { ValidatedForm } from "remix-validated-form";
import { TextInput } from "~/components/form-primatives/TextInput";
import { Button } from "~/components/form-primatives/Button";
import { safeRedirect, validatePassword } from "~/utils/utils";
import { login } from "~/models/auth/login";

import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import { FloatingLink } from "~/components/FloatingLink";

export async function loader({ request }: LoaderArgs) {
    const userSession = await getUserSessionFromCookie(request);
    let accessToken = userSession.get("accessToken");
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

type ActionType = "sendForgotPasswordCode" | "resetPasswordWithCode";

type ActionData = {
    action: ActionType;
    email?: string;
    success: boolean;
    error?: string;
    userId?: string;
    code?: string;
    session?: string;
};


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    if (formData.get("_action") === "sendForgotPasswordCode") {
        const email = formData.get("email") as string;
        const { success, error } = await sendResetPasswordCode(email);
        return json({ action: "sendForgotPasswordCode", email, success, error }, { status: success ? 200 : 400 });
    }
    if (formData.get("_action") === "resetPasswordWithCode") {
        const email = formData.get("email") as string;
        const code = formData.get("code") as string;
        const password = formData.get("password") as string;
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.status) {
            return json(
                {
                    action: "resetPasswordWithCode",
                    email,
                    success: false,
                    error: passwordValidation.error,
                },
                { status: 400 }
            );
        }
        const { success, error } = await resetPasswordWithCode(code, email, password);

        if (success) {
            const loginRequest = await login(email, password);
            if (loginRequest.success) {
                let redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");
                return await createUserSession({
                    request,
                    userInfo: {
                        userName: loginRequest?.response?.userName as string,
                        email: email,
                        accessToken: loginRequest?.response?.accessToken as string,
                        refreshToken: loginRequest?.response?.refreshToken as string,
                    },
                    redirectTo,
                });
            }
        }
        return json({ action: "resetPasswordWithCode", success, error }, { status: success ? 200 : 400 });
    }

};

export const meta: MetaFunction = () => {
    return {
        title: "itsmarkodonnell | Forgot password",
    };
};

export const sendForgotPasswordCodeValidator = withZod(
    z.object({
        email: z.string().min(1, { message: "Email is required" }),
    })
);

export const resetPasswordWithCodeValidator = withZod(
    z.object({
        email: z.string().min(1, { message: "Email is required" }),
        code: z.string().min(1, { message: "Code is required" }),
        password: z.string().min(1, { message: "Password is required" }),
    })
);

export default function ForgotPassword() {

    const actionData = useActionData<ActionData>();
    const [mode, setMode] = React.useState<"sendCode" | "resetPassword">("sendCode");
    React.useEffect(() => {
        if (actionData) {
            if (actionData?.action === 'sendForgotPasswordCode' && !actionData.success) {
                setMode('sendCode')
            }
            if ((actionData?.action === 'sendForgotPasswordCode' && actionData.success) || (actionData?.action === 'resetPasswordWithCode' && !actionData.success)) {
                setMode('resetPassword')
            }
        }
    }, [actionData])
    React.useEffect(() => {
        if (actionData?.action === "sendForgotPasswordCode") {
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
            } else {
                toast(
                    (t) => (
                        <div className="flex w-full min-w-min items-center font-medium text-stock">
                            <HandThumbUpIcon className="mr-2 h-7 w-7 text-green-500" />
                            <span className="w-full">Code sent to your email</span>
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
        if (actionData?.action === "resetPasswordWithCode") {
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

        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
            {mode === "sendCode" && (
                <SendCodeForm />
            )}
            {mode === 'resetPassword' && (
                <ResetPasswordWithCode />
            )}
            <FloatingLink />
        </div>

    );
}

const SendCodeForm = () => {
    const emailRef = React.useRef<HTMLInputElement>(null);
    const transition = useTransition();
    const actionData = useActionData<ActionData>();
    return (

        <div className="mx-auto w-full max-w-sm ">
            <div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                    Reset Password
                </h2>
            </div>

            <div className="mt-8">
                <div className="mt-6">
                    <ValidatedForm
                        method="post"
                        validator={sendForgotPasswordCodeValidator}
                        className="space-y-6"
                    >
                        <div className="space-y-1">
                            <label
                                htmlFor=""
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <div className="mt-1">
                                <TextInput
                                    ref={emailRef}
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link to="/login" className="font-medium text-brand-400 hover:text-brand-500">
                                    Remembered? Login here
                                </Link>
                            </div>
                        </div>
                        <div>
                            <Button
                                className="w-full"
                                label="Send code"
                                name="_action"
                                value="sendForgotPasswordCode"
                                type="submit"
                            >
                                {transition.state === "submitting"
                                    ? "Sending..."
                                    : "Send code"}
                            </Button>
                        </div>
                    </ValidatedForm>
                </div>
            </div>
        </div>
    )
}
const ResetPasswordWithCode = () => {
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const codeRef = React.useRef<HTMLInputElement>(null);
    const transition = useTransition();
    const actionData = useActionData<ActionData>();
    return (
        <div className="mx-auto w-full max-w-sm ">
            <div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                    Choose new password
                </h2>
            </div>

            <div className="mt-8">
                <div className="mt-6">
                    <ValidatedForm
                        method="post"
                        validator={resetPasswordWithCodeValidator}
                        className="space-y-6"
                        action="/login/forgot-password"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <TextInput
                                    ref={emailRef}
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    defaultValue={actionData?.email}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <TextInput
                                    ref={passwordRef}
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label
                                htmlFor="code"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Code
                            </label>
                            <div className="mt-1">
                                <TextInput
                                    ref={codeRef}
                                    name="code"
                                    type="code"
                                    autoComplete="code"
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                className="w-full"
                                label="Log in"
                                name="_action"
                                value="resetPasswordWithCode"
                                type="submit"
                            >
                                {transition.state === "submitting"
                                    ? "Resting password in..."
                                    : "Log in"}
                            </Button>
                        </div>
                    </ValidatedForm>
                </div>
            </div>
        </div>
    )
}
