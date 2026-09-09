export type MenuItem = {
  id: string;
  label: string;
  href?: string;
  children?: MenuItem[];
};

export const menuData: MenuItem[] = [
  {
    id: "dtf-transfer",
    label: "DTF Transfer",
    children: [
      {
        id: "standard-dtf-transfer",
        label: "Standard DTF Transfer",
        children: [
          {
            id: "create-own-gang-sheets",
            label: "Create Your Own Gang Sheets Online",
            href: "/products/build-your-dtf-gang-sheets-online",
          },
          {
            id: "upload-own-gang-sheets",
            label: "Upload Your Own DTF Custom Ganged Sheets",
            href: "/products/upload-your-ready-to-print-dtf-transfers",
          },
          {
            id: "transfers-by-size",
            label: "DTF Transfers - Transfers By Size",
            href: "/products/dtf-transfers-transfers-by-size",
          },
        ],
      },
      {
        id: "uv-dtf-transfer",
        label: "UV DTF Transfer",
        children: [
          { id: "uv-dtf-1", label: "Custom UV DTF Gang Sheets", href: "/categories/uv-dtf" },
        ],
      },
      {
        id: "sublimation-transfer",
        label: "Sublimation Transfer",
        children: [
          { id: "sublimation-1", label: "Custom Sublimation Transfers", href: "/categories/sublimation" },
        ],
      },
      {
        id: "glitter-dtf-transfers",
        label: "Glitter DTF Transfers",
        children: [
          { id: "glitter-1", label: "Custom Glitter DTF Transfers", href: "/products/upload-custom-glitter-dtf-gang-sheet-online" },
        ],
      },
      {
        id: "reflective-dtf-transfer",
        label: "Reflective DTF Transfer",
        children: [
          { id: "reflective-1", label: "Custom Reflective DTF Transfers", href: "/products/upload-your-reflective-dtf-gang-sheet" },
        ],
      },
    ],
  },
  {
    id: "mod-blanks",
    label: "MOD Blanks",
    children: [
      { id: "tshirts", label: "T-Shirts", href: "/categories/t-shirts" },
      { id: "hoodies", label: "Hoodies", href: "/categories/hoodies" },
    ],
  },
  {
    id: "embroidery",
    label: "Embroidery",
    href: "/embroidery-services",
  },
  {
    id: "sign-and-displays",
    label: "Sign and Displays",
    children: [
      { id: "banners", label: "Banners", href: "/products/custom-vinyl-banners-backdrops-maryland" },
      { id: "yard-signs", label: "Yard Signs", href: "/products/yardsign" },
    ],
  },
  {
    id: "resend-artwork",
    label: "Resend Artwork",
    href: "/products/dtf-custom-ganged-sheets",
  },
  {
    id: "dtf-supplies",
    label: "DTF Supplies",
    href: "/categories/dtf-supplies",
  },
  {
    id: "hat-heat-press",
    label: "Hat Heat Press",
    href: "/categories/heat-press",
  },
];
