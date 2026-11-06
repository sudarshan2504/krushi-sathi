import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface VoiceWaveformProps {
  isRecording?: boolean;
  variant?: 'recording' | 'speaking';
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isRecording = true,
  variant = 'recording',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const barCount = 14;
  const isRed = variant === 'recording' || isRecording;
  const barColor = isRed ? 'bg-red-500' : 'bg-forest';

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-[3px] h-6 px-3 ${className}`}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.span
          key={i}
          className={`w-[2px] h-5 rounded-full ${barColor}`}
          style={{ transformOrigin: 'center' }}
          animate={
            shouldReduceMotion
              ? { scaleY: 0.45, opacity: 0.8 }
              : {
                  scaleY: [0.25, 0.95, 0.35, 0.8, 0.3][i % 5],
                  opacity: [0.55, 1, 0.7, 0.9, 0.55][i % 5],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 0.45 + (i % 3) * 0.12,
                  ease: 'easeInOut',
                  delay: i * 0.035,
                }
          }
        />
      ))}
    </div>
  );
};
