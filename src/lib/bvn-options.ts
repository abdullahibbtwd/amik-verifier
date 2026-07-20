import type { OptionSelectItem } from "@/lib/nin-options";

export const bvnLookupOptions: OptionSelectItem[] = [
  {
    value: "view-details",
    label: "View Details",
    description: "Verify BVN and view basic account holder details only",
    price: 250,
  },
  {
    value: "generate-slip",
    label: "Generate BVN Slip",
    description: "Full BVN slip with complete details, bank info, and downloadable PDF",
    price: 750,
    badge: "Full Details",
  },
];

export const mockBvnLookupResult = {
  success: {
    viewDetails: {
      fullName: "Chidi Nwosu",
      bank: "GTBank",
      phone: "0803 *** 4521",
      dateOfBirth: "1988-11-03",
    },
    generateSlip: {
      fullName: "Chidi Nwosu",
      bank: "GTBank",
      phone: "0803 456 4521",
      dateOfBirth: "1988-11-03",
      bvn: "22987654321",
      accountStatus: "Active",
      enrollmentBranch: "Victoria Island, Lagos",
    },
  },
  failure: {
    message:
      "No record found for the provided BVN. Please check the number and try again.",
  },
};
