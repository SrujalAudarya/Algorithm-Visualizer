import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, Zap, Clock, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import searchingHero from "@/assets/searching-intro-hero.jpg";

const searchingTypes = [
  {
    name: "Linear Search",
    complexity: "O(n)",
    description: "Sequentially checks each element from the beginning until the target is found or the list ends.",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/20",
  },
  {
    name: "Binary Search",
    complexity: "O(log n)",
    description: "Repeatedly divides a sorted array in half, eliminating half of the remaining elements each step.",
    color: "from-glow-accent/20 to-glow-accent/5",
    border: "border-glow-accent/20",
  },
  {
    name: "Jump Search",
    complexity: "O(√n)",
    description: "Jumps ahead by fixed steps in a sorted array, then performs a linear scan in the identified block.",
    color: "from-glow-warm/20 to-glow-warm/5",
    border: "border-glow-warm/20",
  },
];

const features = [
  { icon: BarChart3, label: "Visual Bars", desc: "Watch the search scan through data" },
  { icon: Zap, label: "Sound Effects", desc: "Hear each comparison step" },
  { icon: Clock, label: "Speed Control", desc: "Slow down to understand each step" },
  { icon: Search, label: "3 Algorithms", desc: "Compare different approaches" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SearchingIntroPage = () => {
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
              <img src={searchingHero} alt="Searching visualization" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                What is <span className="text-gradient-primary">Searching</span>?
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-6">
                Searching is the process of finding a specific element within a data structure. It is one of the most common operations in programming, from database lookups to finding files on your computer.
              </p>
              <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
                The efficiency of a search depends on the data structure and whether the data is sorted. Understanding search algorithms helps you pick the right tool for optimal performance.
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
              Searching <span className="text-gradient-primary">Algorithms</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground mb-8 max-w-xl">
              Explore 3 fundamental searching algorithms with different speed and data requirements.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {searchingTypes.map((type) => (
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
              onClick={() => navigate("/searching")}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all glow-primary"
            >
              Start Visualizing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-muted-foreground text-sm mt-3">
              Interactive searching with real-time animations & sound
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SearchingIntroPage;
