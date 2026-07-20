import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type ButtonLinkProps = Omit<
  ComponentProps<typeof Button>,
  "render" | "nativeButton"
> & {
  href: string;
};

export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props} />
  );
}
