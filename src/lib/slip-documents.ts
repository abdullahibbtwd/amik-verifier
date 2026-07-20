export type SlipDocument = {
  id: string;
  slipType: "NIN Slip" | "Standard Slip" | "Premium Slip";
  slipFilter: "nin-slip" | "standard-slip" | "premium-slip";
  identifier: string;
  name: string;
  amount: number;
  generatedAt: string;
};

export const slipFilterOptions = [
  { value: "all", label: "All slips" },
  { value: "nin-slip", label: "NIN Slip" },
  { value: "standard-slip", label: "Standard Slip" },
  { value: "premium-slip", label: "Premium Slip" },
] as const;

export type SlipFilter = (typeof slipFilterOptions)[number]["value"];

export const mockSlipDocuments: SlipDocument[] = [
  {
    id: "slip_001",
    slipType: "Premium Slip",
    slipFilter: "premium-slip",
    identifier: "12345678901",
    name: "Adaeze Okonkwo",
    amount: 1500,
    generatedAt: "2026-07-18T11:05:00Z",
  },
  {
    id: "slip_002",
    slipType: "Standard Slip",
    slipFilter: "standard-slip",
    identifier: "98765432109",
    name: "Chidi Nwosu",
    amount: 800,
    generatedAt: "2026-07-17T09:20:00Z",
  },
  {
    id: "slip_003",
    slipType: "NIN Slip",
    slipFilter: "nin-slip",
    identifier: "11223344556",
    name: "Fatima Bello",
    amount: 350,
    generatedAt: "2026-07-16T14:45:00Z",
  },
  {
    id: "slip_004",
    slipType: "Standard Slip",
    slipFilter: "standard-slip",
    identifier: "55667788990",
    name: "Emeka Okafor",
    amount: 800,
    generatedAt: "2026-07-14T08:10:00Z",
  },
  {
    id: "slip_005",
    slipType: "Premium Slip",
    slipFilter: "premium-slip",
    identifier: "66778899001",
    name: "Amina Yusuf",
    amount: 1500,
    generatedAt: "2026-07-12T16:30:00Z",
  },
];
