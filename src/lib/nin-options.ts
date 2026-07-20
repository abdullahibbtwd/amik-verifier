export type OptionSelectItem = {
  value: string;
  label: string;
  description?: string;
  price: number;
  badge?: string;
};

export const ninSlipOptions: OptionSelectItem[] = [
  {
    value: "nin-slip",
    label: "NIN Slip",
    description: "NIN Slip with core details",
    price: 350,
  },
  {
    value: "standard-slip",
    label: "Standard Slip",
    description: "Standard NIN slip with core details",
    price: 800,
    badge: "Popular",
  },
  {
    value: "premium-slip",
    label: "Premium Slip",
    description: "Premium NIN slip with photo, QR code, and enhanced details",
    price: 1500,
    badge: "Premium",
  },
];

export const mockNinRecentFiles = [
  {
    id: "nin_001",
    slipType: "Premium Slip",
    identifier: "12345678901",
    name: "Adaeze Okonkwo",
    amount: 1500,
    status: "verified" as const,
    date: "2026-07-18T11:05:00Z",
  },
  {
    id: "nin_002",
    slipType: "Digital Slip",
    identifier: "98765432109",
    name: "Chidi Nwosu",
    amount: 800,
    status: "verified" as const,
    date: "2026-07-17T09:20:00Z",
  },
  {
    id: "nin_003",
    slipType: "Non Slip",
    identifier: "11223344556",
    name: "Fatima Bello",
    amount: 350,
    status: "verified" as const,
    date: "2026-07-16T14:45:00Z",
  },
  {
    id: "nin_004",
    slipType: "Non Slip",
    identifier: "55443322110",
    name: null,
    amount: 350,
    status: "failed" as const,
    date: "2026-07-15T08:30:00Z",
  },
];
