import React from 'react';
import { motion } from 'framer-motion';

export interface VoiceWaveformProps {
  isRecording: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording }) => {
  if (!isRecording) return null;

  const barCount = 18;

  return (
    <div className="flex items-center justify-center gap-1 py-2 px-4 bg-forest/5 rounded-full border border-forest/15">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 bg-forest rounded-full"
          animate={{
            height: isRecording ? [6, 26, 10, 32, 8][(i % 5)] : 4,
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 0.6 + (i % 4) * 0.15,
            ease: 'easeInOut',
            delay: (i * 0.05),
          }}
          style={{ height: 12 }}
        />
      ))}
    </div>
  );
};
