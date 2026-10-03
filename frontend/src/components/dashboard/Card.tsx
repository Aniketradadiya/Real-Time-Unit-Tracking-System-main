import { type CSSProperties, type ReactNode } from "react";

type CardProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function Card({ className = "", style, children }: CardProps) {
  return (
    <div className={`gridos-card ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
