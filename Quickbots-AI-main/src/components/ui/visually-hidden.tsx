"use client";

import * as React from "react";
import { VisuallyHidden as RadixVisuallyHidden } from "@radix-ui/react-visually-hidden";

export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => {
  return <RadixVisuallyHidden>{children}</RadixVisuallyHidden>;
};
