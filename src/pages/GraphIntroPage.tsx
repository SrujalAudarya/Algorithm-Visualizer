import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, GitBranch, Clock, Layers, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImg from "@/assets/graph-intro-hero.jpg";

const graphTypes = [
  {
    name: "BFS Traversal",
    complexity: "O(V + E)",
    description: "Explores level by level using a queue. Great for shortest paths in unweighted graphs.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20",
  },
  {
    name: "DFS Traversal",
    complexity: "O(V + E)",
    description: "Explores as deep as possible before backtracking. Uses recursion or a stack.",
    color: "from-glow-accent/20 to-glow-accent/5",
    border: "border-glow-accent/20",
  },
  {
    name: "Kruskal's MST",
    complexity: "O(E log E)",
    description: "Builds minimum spanning tree by sorting edges and using Union-Find to avoid cycles.",
    color: "from-glow-warm/20 to-glow-warm/5",
    border: "border-glow-warm/20",
  },
  {
    name: "Prim's MST",
    complexity: "O(E log V)",
    description: "Grows MST from a start node by always picking the cheapest adjacent edge.",
    color: "from-glow-green/20 to-glow-green/5",
    border: "border-glow-green/20",
  },
];

const features = [
  { icon: GitBranch, label: "Interactive Graph", desc: "Watch nodes & edges animate" },
  { icon: Zap, label: "Sound Effects", desc: "Hear each node visit" },
  { icon: Clock, label: "Speed Control", desc: "Adjust animation speed freely" },
  { icon: Layers, label: "4 Algorithms", desc: "BFS, DFS, Kruskal, Prim" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GraphIntroPage = () => {
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative glass rounded-2xl overflow-hidden mb-12"
          >
            <div className="absolute inset-0">
              <img src={heroImg} alt="Graph algorithms visualization" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                What are <span className="text-gradient-primary">Graph Algorithms</span>?
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-6">
                Graphs consist of nodes (vertices) connected by edges. Graph algorithms help us traverse these structures, find shortest paths, detect cycles, and build minimum spanning trees.
              </p>
              <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
                From social networks to GPS navigation, graph algorithms power countless real-world applications. Understanding them is essential for solving complex connectivity problems.
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

          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Types of Graph <span className="text-gradient-primary">Algorithms</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8 max-w-xl">
              Explore 4 essential graph algorithms, from traversals to minimum spanning trees.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {graphTypes.map((type) => (
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={() => navigate("/graph")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all glow-primary"
            >
              Start Visualizing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-muted-foreground text-sm mt-3">
              Interactive graph traversal with real-time animations & sound
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GraphIntroPage;
