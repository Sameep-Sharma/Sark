"use client";

import React, {
  type ComponentPropsWithoutRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

export type InputFieldProps = ComponentPropsWithoutRef<"input"> & {
  wrapperClassName?: string;
};

export type SmoothInputProps = InputFieldProps;

export const SmoothInput = forwardRef<HTMLInputElement, SmoothInputProps>(
  (
    {
      className,
      wrapperClassName,
      type = "text",
      placeholder,
      style,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        <input
          {...props}
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "smooth-input-field w-full bg-transparent outline-none placeholder:text-foreground/40 text-inherit caret-[#f84242]",
            className,
          )}
          style={style}
        />
      </div>
    );
  },
);

SmoothInput.displayName = "SmoothInput";

export const Input = SmoothInput;
