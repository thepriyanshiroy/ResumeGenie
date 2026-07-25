import { forwardRef } from "react";
import clsx from "clsx";

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={clsx(
      "block text-sm font-medium leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
