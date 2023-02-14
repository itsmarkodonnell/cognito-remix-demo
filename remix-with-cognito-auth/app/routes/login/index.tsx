import type {
    LoaderArgs,
    MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useActionData, useTransition } from "@remix-run/react";
import * as React from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { ValidatedForm } from "remix-validated-form";
import { TextInput } from "~/components/form-primatives/TextInput";
import { Button } from "~/components/form-primatives/Button";
import { ActionData } from "../login"
import { FloatingLink } from "~/components/FloatingLink";
export async function loader({ request }: LoaderArgs) {
    return json({});
}

export const meta: MetaFunction = () => {
    return {
        title: "itsmarkodonnell | Login",
    };
};

export const loginValidator = withZod(
    z.object({
        email: z.string().min(1, { message: "Email is required" }),
        password: z.string().min(1, { message: "Password is required" }),
    })
);
export const setNewPasswordOnLoginValidator = withZod(
    z.object({
        password: z.string().min(1, { message: "Password is required" }),
        userId: z.string().min(1, { message: "User ID is required" }),
    })
);

export default function LoginIndex() {
    const [mode, setMode] = React.useState<"login" | "resetPassword">("login");


    const actionData = useActionData<ActionData>();

    React.useEffect(() => {
        if (actionData) {
            console.log(actionData)
            if (actionData?.action === 'login' && !actionData.success || actionData?.action === 'login') {
                setMode('login')
            }
            if ((actionData?.code === 'NewPasswordRequired') || (actionData?.action === 'setNewPasswordOnLogin' && !actionData.success)) {
                setMode('resetPassword')
            }
        }
    }, [actionData])
    return (
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
            {mode === "login" && (
                <LoginForm />
            )}
            {mode === 'resetPassword' && (
                <SetNewPasswordOnLoginForm />
            )}
            <FloatingLink />
        </div>
    );
}

const SetNewPasswordOnLoginForm = () => {
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const transition = useTransition();
    const actionData = useActionData<ActionData>();
    return (

        <div className="mx-auto w-full max-w-sm ">
            <div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                    Choose a permanent password
                </h2>
            </div>

            <div className="mt-8">
                <div className="mt-6">
                    <ValidatedForm
                        method="post"
                        validator={setNewPasswordOnLoginValidator}
                        action="/login"
                        className="space-y-6"
                    >
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
                        <input type="hidden" name="userId" value={actionData?.userId} />
                        <input type="hidden" name="session" value={actionData?.session} />

                        <div>
                            <Button
                                className="w-full"
                                label="Log in"
                                name="_action"
                                value="setNewPasswordOnLogin"
                                type="submit"
                            >
                                {transition.state === "submitting"
                                    ? "Logging in..."
                                    : "Log in"}
                            </Button>
                        </div>
                    </ValidatedForm>
                </div>
            </div>
        </div>
    )
}
const LoginForm = () => {
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const transition = useTransition();
    return (
        <div className="mx-auto w-full max-w-sm ">
            <div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                    Sign into your account
                </h2>
            </div>

            <div className="mt-8">
                <div className="mt-6">
                    <ValidatedForm
                        method="post"
                        validator={loginValidator}
                        className="space-y-6"
                        action="/login"
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
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link to="/login/forgot-password" className="font-medium text-brand-400 hover:text-brand-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                className="w-full"
                                label="Log in"
                                name="_action"
                                value="login"
                                type="submit"
                            >
                                {transition.state === "submitting"
                                    ? "Logging in..."
                                    : "Log in"}
                            </Button>
                        </div>
                    </ValidatedForm>
                </div>
            </div>
        </div>
    )
}
