"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import "./label.css";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={`custom-label ${className || ""}`}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };