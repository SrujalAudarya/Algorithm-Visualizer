import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40"
    >
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Algo<span className="text-primary">Vision</span>
          </span>
        </div>

        <span className="text-xs font-mono text-muted-foreground hidden sm:block">
          Interactive Algorithm Visualizer
        </span>
      </div>
    </motion.nav>
  );
};

export default Navbar;
