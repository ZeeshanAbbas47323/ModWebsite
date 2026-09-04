export interface ShowcaseImage {
  src: string;
  alt: string;
  /** Landscape art, so it takes the full width of the mosaic. */
  wide?: boolean;
}

/**
 * Artwork for the two home showcase sections.
 *
 * Supplied as files rather than through the CMS, so it lives here next to the
 * hero slides. The copy for these sections still comes from `home-sections`.
 */
export const WHY_MODFIRST_IMAGES: ShowcaseImage[] = [
  { src: "/images/showcase/branded-tees-pair.png", alt: "Two branded t-shirts printed front and chest", wide: true },
  { src: "/images/showcase/branded-tote.png", alt: "Screen-printed tote bag carried over the shoulder" },
  { src: "/images/showcase/stationery-set.png", alt: "Branded stationery set with business cards" },
  { src: "/images/showcase/branded-notebook.png", alt: "Foil-printed notebook cover" },
  { src: "/images/showcase/notebook-handoff.png", alt: "Printed notebooks being handed over" },
  { src: "/images/showcase/impact-report.png", alt: "Printed impact report opened flat" },
];

export const FAST_PRODUCTION_IMAGES: ShowcaseImage[] = [
  { src: "/images/showcase/embroidered-hoodie.png", alt: "Embroidered logo on a black hoodie", wide: true },
  { src: "/images/showcase/business-cards.png", alt: "Stack of two-colour business cards" },
  { src: "/images/showcase/brand-flatlay.png", alt: "Flat lay of branded print collateral" },
  { src: "/images/showcase/tote-and-mug.png", alt: "Branded tote bag and matching mug" },
  { src: "/images/showcase/embroidered-cap.png", alt: "Embroidered cap held up to the camera" },
];
