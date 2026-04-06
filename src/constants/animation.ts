export const SPRING = {
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
  },
  gentle: {
    type: 'spring' as const,
    stiffness: 60,
    damping: 20,
  },
  entrance: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1.2,
  },
  listItem: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 38,
  },
} as const;

export const DURATION = {
  copyRevert:   2000,
  floatCycle:   30000,
  staggerDelay: 0.06,
  exitFast:     0.15,
} as const;
