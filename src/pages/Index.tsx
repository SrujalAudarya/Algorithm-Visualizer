import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Route, GitBranch, Search, TreePine, Puzzle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { lazy, Suspense } from "react";
const HeroScene = lazy(() => import("@/components/HeroScene"));
import cardSorting from "@/assets/card-sorting.jpg";
import cardPathfinding from "@/assets/card-pathfinding.jpg";
import cardGraph from "@/assets/card-graph.jpg";
import cardSearching from "@/assets/card-searching.jpg";
import cardTree from "@/assets/card-tree.jpg";
import cardBacktracking from "@/assets/card-backtracking.jpg";

const algorithms = [
  {
    id: "sorting",
    title: "Sorting Algorithms",
    description: "Bubble, Merge, Quick, Insertion, Selection sort & more with real-time sound.",
    icon: ArrowUpDown,
    image: cardSorting,
    count: 8,
  },
  {
    id: "pathfinding",
    title: "Pathfinding",
    description: "Dijkstra, A*, BFS & DFS — find the shortest path through interactive grids.",
    icon: Route,
    image: cardPathfinding,
    count: 5,
  },
  {
    id: "graph",
    title: "Graph Algorithms",
    description: "BFS, DFS, Kruskal's, Prim's and topological sorting on dynamic graphs.",
    icon: GitBranch,
    image: cardGraph,
    count: 6,
  },
  {
    id: "searching",
    title: "Searching",
    description: "Compare Linear Search, Binary Search and more step-by-step.",
    icon: Search,
    image: cardSearching,
    count: 3,
  },
  {
    id: "tree",
    title: "Tree Traversal",
    description: "Inorder, Preorder, Postorder and Level-order on binary trees.",
    icon: TreePine,
    image: cardTree,
    count: 4,
  },
  {
    id: "backtracking",
    title: "Backtracking",
    description: "N-Queens, Sudoku Solver, Maze generation and rat-in-a-maze.",
    icon: Puzzle,
    image: cardBacktracking,
    count: 4,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.4 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const AlgorithmCard = ({ algo }: { algo: typeof algorithms[0] }) => {
  const navigate = useNavigate();
  const Icon = algo.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
onClick={() => {
        const introRoutes: Record<string, string> = {
          sorting: "/sorting-intro",
          pathfinding: "/pathfinding-intro",
          searching: "/searching-intro",
          graph: "/graph-intro",
          tree: "/tree-intro",
          backtracking: "/backtracking-intro",
        };
        navigate(introRoutes[algo.id] || `/${algo.id}`);
      }}
      className="group relative cursor-pointer rounded-xl glass overflow-hidden transition-shadow duration-300 hover:glow-primary"
    >
      {/* Card Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={algo.image}
          alt={algo.title}
          loading="lazy"
          width={640}
          height={512}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md glass text-[10px] font-mono text-muted-foreground">
          {algo.count} algos
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">{algo.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{algo.description}</p>
        <div className="flex items-center gap-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span>Explore</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </motion.div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="relative h-[360px] sm:h-[420px] md:h-[480px] bg-background">
          {/* 3D Scene */}
          <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
            <HeroScene />
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-3 sm:mb-4">
                <span className="text-foreground">See Algorithms</span>
                <br />
                <span className="text-gradient-primary">Come Alive</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-4 sm:mb-6 px-2">
                Interactive visualizations with immersive sound effects. Understand sorting, pathfinding, graphs, and more — by watching them execute in real time.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground font-mono"
              >
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full glass">30+ Algorithms</span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full glass">Sound Effects</span>
                <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full glass">Step by Step</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Algorithms Section */}
      <section className="relative bg-grid">
        <div className="absolute inset-0 bg-radial-glow pointer-events-none opacity-50" />
        <div className="relative z-10 container max-w-6xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Choose a Category
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Pick an algorithm family to explore. Each category offers multiple algorithms with unique visualizations.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {algorithms.map((algo) => (
              <AlgorithmCard key={algo.id} algo={algo} />
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
