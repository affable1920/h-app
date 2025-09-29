import { type ButtonHTMLAttributes, type ReactNode, memo } from "react";

// Union types - these create a set of allowed string values
type Size = "sm" | "md" | "lg" | "xl";
type Variant = "contained" | "outlined";
type Color = "primary" | "accent" | "danger";

// Interface extending HTMLButtonElement - this means our Button gets ALL native button props
// like onClick, disabled, type, etc. automatically
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; // ReactNode allows text, JSX, arrays, etc.

  // Optional props with default values (using ? makes them optional)
  variant?: Variant;
  color?: Color;
  size?: Size;

  // Icon props - more flexible naming
  startIcon?: ReactNode;
  endIcon?: ReactNode;

  // Loading state
  loading?: boolean;

  // Full width option
  rounded?: boolean;
}

const Button = memo(
  ({
    children,
    variant = "contained", // Default values using ES6 destructuring
    color = "primary",
    size = "sm",
    startIcon,
    endIcon,
    loading = false,
    rounded = false,
    className = "",
    ...rest // Spread operator captures all other props
  }: ButtonProps) => {
    const sizeClasses = {
      sm: "sm",
      md: "md",
      lg: "lg",
      xl: "xl",
    };

    const variantClasses = {
      outlined: "outlined",
      contained: "contained",
    };

    const colorClasses = {
      accent: "accent",
      danger: "danger",
      primary: "primary",
    };

    // Template literal for combining classes - more readable than array.join()
    const giveColor = variantClasses[variant] === "contained";

    const buttonClasses = [
      "btn",
      sizeClasses[size],
      variantClasses[variant],
      giveColor && colorClasses[color],
      rounded && "rounded-full",
      loading && "cursor-wait",
      className,
    ]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");

    return (
      <button
        className={buttonClasses}
        {...rest} // Spread all other props to the button element
      >
        {/* Conditional rendering - only show if exists */}
        {/* {loading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
        ) : (
          startIcon
        )} */}
        {startIcon}

        {children}
        {endIcon && endIcon}
      </button>
    );
  }
);

// Display name for debugging - helpful in React DevTools
Button.displayName = "Button";
export default Button;
