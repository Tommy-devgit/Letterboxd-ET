export const ratingColors = {
  low: "#e0362d",
  fair: "#f27f3d",
  good: "#f2c94c",
  great: "#8fd14f",
  perfect: "#54b948",
  empty: "#31404d",
} as const;

export function getRatingColor(rating: number | null | undefined) {
  if (!rating) return ratingColors.empty;
  if (rating <= 1.5) return ratingColors.low;
  if (rating <= 2.5) return ratingColors.fair;
  if (rating <= 3.5) return ratingColors.good;
  if (rating < 5) return ratingColors.great;
  return ratingColors.perfect;
}

export const uiTokens = {
  radius: {
    sm: "rounded-[3px]",
    md: "rounded-[4px]",
    lg: "rounded-[6px]",
  },
  panel: "border border-border-muted bg-[#101820]",
  panelHover: "transition-colors hover:border-[#536575]",
} as const;
