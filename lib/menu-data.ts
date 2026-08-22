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
            href: "#",
          },
          {
            id: "upload-own-gang-sheets",
            label: "Upload Your Own DTF Custom Ganged Sheets",
            href: "#",
          },
          {
            id: "transfers-by-size",
            label: "DTF Transfers - Transfers By Size",
            href: "#",
          },
        ],
      },
      {
        id: "uv-dtf-transfer",
        label: "UV DTF Transfer",
        children: [
          { id: "uv-dtf-1", label: "Custom UV DTF Gang Sheets", href: "#" },
        ],
      },
      {
        id: "sublimation-transfer",
        label: "Sublimation Transfer",
        children: [
          { id: "sublimation-1", label: "Custom Sublimation Transfers", href: "#" },
        ],
      },
      {
        id: "glitter-dtf-transfers",
        label: "Glitter DTF Transfers",
        children: [
          { id: "glitter-1", label: "Custom Glitter DTF Transfers", href: "#" },
        ],
      },
      {
        id: "reflective-dtf-transfer",
        label: "Reflective DTF Transfer",
        children: [
          { id: "reflective-1", label: "Custom Reflective DTF Transfers", href: "#" },
        ],
      },
    ],
  },
  {
    id: "mod-blanks",
    label: "MOD Blanks",
    children: [
      { id: "tshirts", label: "T-Shirts", href: "#" },
      { id: "hoodies", label: "Hoodies", href: "#" },
    ],
  },
  {
    id: "embroidery",
    label: "Embroidery",
    href: "#",
  },
  {
    id: "dtg-printing-service",
    label: "DTG Printing Service",
    href: "#",
  },
  {
    id: "sign-and-displays",
    label: "Sign and Displays",
    children: [
      { id: "banners", label: "Banners", href: "#" },
      { id: "yard-signs", label: "Yard Signs", href: "#" },
    ],
  },
  {
    id: "resend-artwork",
    label: "Resend Artwork",
    href: "#",
  },
  {
    id: "rush-order",
    label: "Rush Order",
    href: "#",
  },
  {
    id: "dtf-supplies",
    label: "DTF Supplies",
    href: "#",
  },
  {
    id: "hat-heat-press",
    label: "Hat Heat Press",
    href: "#",
  },
];
