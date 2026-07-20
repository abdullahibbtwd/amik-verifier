import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 283;
const LOGO_HEIGHT = 283;

type LogoProps = {
  className?: string;
  href?: string | null;
  priority?: boolean;
  variant?: "default" | "light";
};

export function Logo({
  className,
  href = "/",
  priority = false,
  variant = "default",
}: LogoProps) {
  const image = (
    <Image
      src="/Amik.png"
      alt="Amik Verifier & Data"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={cn(
        "size-10 object-contain lg:size-14",
        variant === "light" && "brightness-0 invert",
        className
      )}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return image;
}
