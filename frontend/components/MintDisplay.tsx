// This component will use motion from framer-motion to animate the mint address for the token.
// The component will be a flaming box with the mint address inside it.
// The flames will be realistic and animated.

import { motion } from "framer-motion";

const MintAddress = process.env.NEXT_PUBLIC_CPT_TOKEN_MINT;

const MintDisplay = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-6 inline-block bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 p-1 rounded-lg shadow-lg transform transition-all duration-300 cursor-pointer "
    >
      {/* Box will be clickable and take user to solscan  */}
      <div
        className="bg-background text-foreground px-2 py-2 rounded-lg "
        onClick={() =>
          window.open(`https://solscan.io/token/${MintAddress}`, "_blank")
        }
      >
        <span className="font-mono text-sm md:text-base">
          <strong>Mint Address:</strong>{" "}
          <span className="text-xs">{MintAddress}</span>
        </span>
      </div>
    </motion.div>
  );
};

export default MintDisplay;
