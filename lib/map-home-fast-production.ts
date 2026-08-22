import type { HomeSection } from "@/services/home-section.service";
import {
  mapHomeWhyModfirst,
  type WhyModfirstViewModel,
} from "@/lib/map-home-why-modfirst";

/** Same payload shape as why_modfirst — reuse mapper */
export type FastProductionViewModel = WhyModfirstViewModel;

export function mapHomeFastProduction(
  section: HomeSection | null | undefined
): FastProductionViewModel | null {
  return mapHomeWhyModfirst(section);
}
