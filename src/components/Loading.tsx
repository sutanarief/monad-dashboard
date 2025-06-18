import { motion } from "framer-motion";
const tileImages = [
  "/blue.png",
  "/red.png",
  "/green.png",
  "/yellow.png",
  "/purple.png",
];

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen bg-gray-900">
      <div className="relative w-[200px] h-[200px]">
        {tileImages.map((src, index) => (
          <motion.img
            key={index}
            src={src}
            alt={`tile-${index}`}
            className="absolute w-8 h-8"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 200, opacity: 1 }}
            transition={{
              duration: 1,
              delay: index * 0.2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 160}px`, // acak posisi horizontal
            }}
          />
        ))}
      </div>
      <img src="/monad.svg" className="mt-10"/>
    </div>
  );
};
