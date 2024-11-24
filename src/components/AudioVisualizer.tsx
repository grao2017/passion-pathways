import { motion } from "framer-motion";

interface AudioVisualizerProps {
  volumeLevel: number;
  isSessionActive: boolean;
}

export const AudioVisualizer = ({ volumeLevel, isSessionActive }: AudioVisualizerProps) => {
  if (!isSessionActive) return null;

  return (
    <motion.div
      className="w-4 h-4 bg-primary rounded-full"
      animate={{
        scale: [1, 1 + volumeLevel * 0.5],
      }}
      transition={{
        duration: 0.1,
      }}
    />
  );
};