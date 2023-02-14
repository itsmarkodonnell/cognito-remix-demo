import React, { useEffect } from "react";
import { useField } from "remix-validated-form";
import classNames from "../../utils/classNames";
// import "../app/styles/app.css";
interface TextInputProps {
  /**
   * Label for the input
   */
  label?: string;
  /**
   *  Bg Color for text area
   */
  bgColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   *  Bg Color for input select
   */
  borderColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   *  Border active colour for input select
   */
  borderFocusColor?: React.HTMLAttributes<HTMLButtonElement>["className"];

  /**
   * For use to connect to a form
   */
  formId?: string;
}
type A = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

/**
 * Primary UI component for user interaction
 */
export const TextInput = ({
  type = "text",
  bgColor = "bg-gray-50",
  borderColor = "border-gray-900/10",
  borderFocusColor = "focus:border-green-400",
  ...props
}: TextInputProps & Omit<A, "size">) => {
  const { className, formId, hidden } = props;
  const { error, getInputProps } = useField(props.name as string, {
    formId: props.formId,
  });

  let paddingSize =  "py-2.5 px-4";
  let textSize = "text-xs";

  return (
    <div className={classNames("relative", hidden && "hidden")}>
      <label
        className={classNames("mt-1 text-left font-normal", textSize)}
        htmlFor={props.name}
      >
        {props.label}
        {props.required && <span className="ml-1 text-green-500">*</span>}
      </label>

      <input
        {...props}
        hidden
        type={type}
        onChange={props.onChange || undefined}
        className={
          type === "checkbox"
            ? "mt-1 block rounded-md border font-normal text-stock focus:outline-none focus:ring-0"
            : classNames(
              "mt-1 block w-full rounded-md border font-normal text-stock focus:outline-none focus:ring-0 ",
              bgColor,
              borderColor,
              borderFocusColor,
              paddingSize,
              textSize,
              className
            )
        }
        {...getInputProps()}
      />
      {error ? (
        <span className="absolute -bottom-4 text-xs italic leading-none text-green-400">
          {error}
        </span>
      ) : (
        <span className="absolute -bottom-4 text-xs italic leading-none text-green-400">
          &nbsp;
        </span>
      )}
    </div>
  );
};
