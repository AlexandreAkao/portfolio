import { useEffect, useRef } from 'react';

interface Props {
  direction?: 'left' | 'right';
}

const MARQUEE_TEXT =
  'FULL-STACK . DISTRIBUTED SYSTEMS . MICROSERVICES . CLEAN ARCHITECTURE . EVENT-DRIVEN . DDD . REACT . NODE.JS . ';

export default function AvantgardeMarquee({ direction = 'left' }: Props) {
  return (
    <div className="overflow-hidden py-6" aria-hidden="true">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee-${direction} 30s linear infinite`,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="font-heading text-[clamp(2rem,5vw,3.75rem)] font-bold text-text-secondary"
            style={{ opacity: 0.08 }}
          >
            {MARQUEE_TEXT}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
