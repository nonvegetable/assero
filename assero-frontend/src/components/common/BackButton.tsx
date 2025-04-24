import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const BackButton = () => {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push('/')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute top-6 left-6 bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800"
    >
      <span>←</span>
      <span>Back</span>
    </motion.button>
  );
};

export default BackButton;