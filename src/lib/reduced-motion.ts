import { MotionGlobalConfig } from 'motion/react';

// Motion animates in JavaScript, where the stylesheet's reduced-motion rule
// cannot reach. Visitors who ask for less motion get every Motion animation at
// its end state; islands share this module instance, so one switch covers all.
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  MotionGlobalConfig.skipAnimations = true;
}
