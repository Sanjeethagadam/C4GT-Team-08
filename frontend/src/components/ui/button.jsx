import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#052659] via-[#08336e] to-[#0A3670] text-white border border-[#5483B3]/40 shadow-xs hover:from-[#021024] hover:to-[#052659] hover:border-[#0090FF]/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-white",
        destructive:
          "bg-gradient-to-r from-rose-600 to-rose-700 text-white border border-rose-500 shadow-xs hover:from-rose-700 hover:to-rose-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border border-[#7DA0CA]/50 bg-white/90 text-[#052659] hover:bg-[#C1E8FF]/30 hover:border-[#5483B3] hover:text-[#021024] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] text-[#052659] border border-[#7DA0CA]/40 hover:bg-[#C1E8FF] hover:border-[#5483B3] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "text-[#052659] hover:bg-[#C1E8FF]/30 hover:text-[#021024]",
        link: "text-[#0090FF] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
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
