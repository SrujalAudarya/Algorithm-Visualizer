import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import PathfindingVisualizer from "@/components/PathfindingVisualizer";

const PathfindingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <div className="pt-24 pb-8">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate("/pathfinding-intro")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Pathfinding Overview
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Pathfinding <span className="text-gradient-primary">Visualizer</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Draw walls on the grid, pick an algorithm, and watch it find the path.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PathfindingVisualizer />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PathfindingPage;
