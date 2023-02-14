import React, { HTMLAttributes, ButtonHTMLAttributes } from "react";
import classNames from "~/utils/classNames"
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The thing to render inside the button
   */
  children: React.ReactNode;
  /**
   *  Bg Color for button
   */
  bgColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   *  Bg Color for button
   */
  textColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   *  Bg Color for button when active
   */
  activeBgColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   *  Bg Color for button
   */
  borderColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   *  Border color for button when focused
   */
  borderFocusColor?: React.HTMLAttributes<HTMLButtonElement>["className"];
  /**
   * Button contents
   */
  label: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  children,
  bgColor = "bg-green-500",
  textColor = "text-white",
  activeBgColor = "hover:bg-green-400 focus:bg-green-400",
  borderColor = "border-gray-400/10",
  borderFocusColor = "focus-within:border-green-400",
  label,
  ...props
}: ButtonProps) => {


  const { type, className, ...otherProps } = props;

  let paddingSize = "py-2.5 px-5";
  let textSize = "text-sm";

  return (
    <button
      type={type}
      {...otherProps}
      className={classNames(
        "text-bold border rounded-md inline-block leading-none shadow-sm duration-200",
        paddingSize,
        textSize,
        bgColor,
        textColor,
        activeBgColor,
        borderColor,
        borderFocusColor,
        className
      )}
    >
      {children}
    </button>
  );
};
