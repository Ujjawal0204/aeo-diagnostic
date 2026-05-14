import { ReactNode, CSSProperties } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Container({ children, className, style }: ContainerProps) {
  return (
    <div
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: 1200,
        paddingLeft: "clamp(32px, 5vw, 48px)",
        paddingRight: "clamp(32px, 5vw, 48px)",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
      className={className ?? ""}
    >
      {children}
    </div>
  );
}
