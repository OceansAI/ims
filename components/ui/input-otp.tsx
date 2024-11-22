"use client";

import * as React from "react";
import { DashIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "./input";

const InputOTP = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <Input
      ref={ref}
      type="text"
      autoComplete="one-time-code"
      className={cn("text-center text-2xl", className)}
      {...props}
    />
  )
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2",
      className
    )}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    char?: string;
  }
>(({ char, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative w-10 h-12",
      className
    )}
    {...props}
  >
    {char ? (
      <div className="absolute inset-0 flex items-center justify-center text-lg">
        {char}
      </div>
    ) : (
      <DashIcon className="absolute inset-0 m-auto text-muted-foreground w-4 h-4" />
    )}
    <div
      className={cn(
        "absolute inset-0 w-full h-full rounded-md ring-1 ring-inset transition-all duration-100",
        "ring-muted-foreground/20",
        "peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-background peer-focus:ring-primary"
      )}
    />
  </div>
));
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPGroup, InputOTPSlot };