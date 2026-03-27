import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BarChart3, Clock, Layers, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import sortingHero from "@/assets/sorting-intro-hero.jpg";

const sortingTypes = [
  {
    name: "Bubble Sort",
    complexity: "O(n²)",
    description: "Repeatedly swaps adjacent elements if they are in the wrong order, bubbling the largest to the end.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20",
  },
  {
    name: "Selection Sort",
    complexity: "O(n²)",
    description: "Finds the minimum element and places it at the beginning, repeating for each position.",
    color: "from-glow-accent/20 to-glow-accent/5",
    border: "border-glow-accent/20",
  },
  {
    name: "Insertion Sort",
    complexity: "O(n²)",
    description: "Builds the sorted array one element at a time by inserting each into its correct position.",
    color: "from-glow-warm/20 to-glow-warm/5",
    border: "border-glow-warm/20",
  },
  {
    name: "Merge Sort",
    complexity: "O(n log n)",
    description: "Divides the array in half, sorts each half recursively, then merges them back together.",
    color: "from-glow-green/20 to-glow-green/5",
    border: "border-glow-green/20",
  },
  {
    name: "Quick Sort",
    complexity: "O(n log n)",
    description: "Picks a pivot, partitions elements around it, and recursively sorts the partitions.",
    color: "from-glow-rose/20 to-glow-rose/5",
    border: "border-glow-rose/20",
  },
  {
    name: "Heap Sort",
    complexity: "O(n log n)",
    description: "Builds a max heap from the array, then repeatedly extracts the maximum to sort.",
    color: "from-glow-blue/20 to-glow-blue/5",
    border: "border-glow-blue/20",
  },
];

const features = [
  { icon: BarChart3, label: "Visual Bars", desc: "Watch elements move in real time" },
  { icon: Zap, label: "Sound Effects", desc: "Hear each comparison and swap" },
  { icon: Clock, label: "Speed Control", desc: "Adjust animation speed freely" },
  { icon: Layers, label: "6 Algorithms", desc: "Compare different approaches" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SortingIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      <div className="pt-20 sm:pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-3 sm:px-4">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative glass rounded-2xl overflow-hidden mb-12"
          >
            <div className="absolute inset-0">
              <img src={sortingHero} alt="Sorting visualization" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                What is <span className="text-gradient-primary">Sorting</span>?
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-6">
                Sorting is the process of arranging elements in a specific order — ascending or descending. It is one of the most fundamental operations in computer science, used in databases, search engines, and countless applications.
              </p>
              <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
                Different sorting algorithms have different trade-offs in terms of speed, memory usage, and stability. Understanding these algorithms helps you choose the right tool for every situation.
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

          {/* Sorting Types Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Types of Sorting <span className="text-gradient-primary">Algorithms</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8 max-w-xl">
              Explore 6 popular sorting algorithms, each with unique characteristics and performance profiles.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {sortingTypes.map((type) => (
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
              onClick={() => navigate("/sorting")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all glow-primary"
            >
              Start Visualizing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-muted-foreground text-sm mt-3">
              Interactive sorting with real-time animations & sound
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SortingIntroPage;
