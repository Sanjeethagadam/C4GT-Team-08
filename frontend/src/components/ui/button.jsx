import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-xs active:scale-[0.99] font-semibold",
        purple: "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-xs active:scale-[0.99] font-semibold",
        purpleDeep: "bg-[#5B21B6] text-white hover:bg-[#4C1D95] shadow-xs active:scale-[0.99] font-semibold",
        navy: "bg-[#5B21B6] text-white hover:bg-[#4C1D95] shadow-xs active:scale-[0.99] font-semibold",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-xs active:scale-[0.99]",
        outline:
          "border border-[#E5E0F5] bg-white text-[#1F1B2D] hover:bg-[#F5F3FF] hover:text-[#7C3AED] hover:border-[#DDD6FE] shadow-xs",
        secondary:
          "bg-[#EDE9FE] text-[#5B21B6] hover:bg-[#DDD6FE] font-semibold",
        ghost: "hover:bg-purple-50 hover:text-[#7C3AED] text-[#6B6480] font-medium",
        link: "text-[#7C3AED] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
