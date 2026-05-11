import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Every page section lives inside this container.
 * This guarantees centered, max-w-[1200px] layout on all screen sizes.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-8 lg:px-12 ${className ?? ""}`}>
      {children}
    </div>
  );
}
