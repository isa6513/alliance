export type FeaturedImpactAction = {
  actionId: number;
  emphasis: string;
  rest: string;
};

export const FEATURED_IMPACT_ACTIONS: readonly FeaturedImpactAction[] = [
  {
    actionId: 84,
    emphasis: "We raised $2,552",
    rest: "for Helen Keller International by making small adjustments to our personal spending habits.",
  },
  {
    actionId: 75,
    emphasis: "We submitted 3 formal comments",
    rest: "on U.S. federal AI policy dockets, informed by member and expert opinions.",
  },
  {
    actionId: 56,
    emphasis: "We showed that AI companies violate privacy expectations",
    rest: "by running a small experiment with friends and family.",
  },
  {
    actionId: 14,
    emphasis: "We caused 11 cafe locations",
    rest: "to adopt bring-your-own-cup policies by helping them attain media recognition.",
  },
] as const;
