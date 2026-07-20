import {
  CreditCard,
  IdCard,
  Phone,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export type QuickAction = {
  label: string;
  icon: LucideIcon;
  href: string | null;
  fromPrice?: number;
};

export const quickActions: QuickAction[] = [
  {
    label: "Buy Data",
    icon: Smartphone,
    href: null,
    fromPrice: 650,
  },
  {
    label: "Buy Airtime",
    icon: Phone,
    href: null,
  },
  {
    label: "Verify NIN",
    icon: IdCard,
    href: "/lookup/nin",
    fromPrice: 350,
  },
  {
    label: "Verify BVN",
    icon: CreditCard,
    href: "/lookup/bvn",
    fromPrice: 250,
  },
];

export const lookupActions: QuickAction[] = [
  {
    label: "Verify NIN",
    icon: IdCard,
    href: "/lookup/nin",
    fromPrice: 350,
  },
  {
    label: "Verify BVN",
    icon: CreditCard,
    href: "/lookup/bvn",
    fromPrice: 250,
  },
];
