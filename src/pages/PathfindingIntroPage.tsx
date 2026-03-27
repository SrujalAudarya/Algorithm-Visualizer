import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Grid3X3, Compass, Timer, Route } from "lucide-react";
import Navbar from "@/components/Navbar";
import pathfindingHero from "@/assets/pathfinding-intro-hero.jpg";

const pathfindingTypes = [
  {
    name: "Breadth-First Search",
    complexity: "O(V + E)",
    description: "Explores all neighbors level by level. Guarantees the shortest path in unweighted graphs.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20",
  },
  {
    name: "Depth-First Search",
    complexity: "O(V + E)",
    description: "Explores as deep as possible along each branch before backtracking. Does not guarantee shortest path.",
    color: "from-glow-accent/20 to-glow-accent/5",
    border: "border-glow-accent/20",
  },
  {
    name: "Dijkstra's Algorithm",
    complexity: "O((V+E) log V)",
    description: "Finds the shortest path by always expanding the closest unvisited node. Works with weighted graphs.",
    color: "from-glow-warm/20 to-glow-warm/5",
    border: "border-glow-warm/20",
  },
  {
    name: "A* Search",
    complexity: "O(E log V)",
    description: "Combines Dijkstra's with a heuristic to guide search toward the goal, making it faster in practice.",
    color: "from-glow-green/20 to-glow-green/5",
    border: "border-glow-green/20",
  },
];

const features = [
  { icon: Grid3X3, label: "Interactive Grid", desc: "Draw walls with your mouse" },
  { icon: Compass, label: "4 Algorithms", desc: "Compare BFS, DFS, Dijkstra, A*" },
  { icon: Timer, label: "Speed Control", desc: "Watch at your own pace" },
  { icon: Route, label: "Path Tracing", desc: "See the shortest path highlighted" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PathfindingIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative glass rounded-2xl overflow-hidden mb-12"
          >
            <div className="absolute inset-0">
              <img src={pathfindingHero} alt="Pathfinding visualization" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                What is <span className="text-gradient-primary">Pathfinding</span>?
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-6">
                Pathfinding is the process of finding the most efficient route between two points. It powers GPS navigation, video game AI, network routing, and robotics.
              </p>
              <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
                Different algorithms use different strategies — some guarantee the shortest path, while others trade optimality for speed. Understanding these trade-offs is essential in computer science.
              </p>
              <div className="flex flex-wrap gap-3">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm">
                    <f.icon className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-foreground font-medium">{f.label}</span>
                      <span className="text-muted-foreground ml-1.5 hidden sm:inline">· {f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Algorithm Cards */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Pathfinding <span className="text-gradient-primary">Algorithms</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8 max-w-xl">
              Explore 4 fundamental pathfinding algorithms used across computer science.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {pathfindingTypes.map((type) => (
                <motion.div
                  key={type.name}
                  variants={itemVariants}
                  className={`glass rounded-xl p-5 border ${type.border} hover:glow-primary transition-shadow duration-300`}
                >
                  <div className={`inline-flex px-3 py-1 rounded-md bg-gradient-to-r ${type.color} text-xs font-mono text-foreground mb-3`}>
                    {type.complexity}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{type.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={() => navigate("/pathfinding")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all glow-primary"
            >
              Start Visualizing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-muted-foreground text-sm mt-3">
              Interactive grid with real-time pathfinding & sound
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PathfindingIntroPage;
