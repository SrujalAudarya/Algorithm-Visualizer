import { Code2, Github, Heart, Mail, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Sorting", path: "/sorting-intro" },
    { name: "Pathfinding", path: "/pathfinding-intro" },
    { name: "Graph", path: "/graph-intro" },
    { name: "Searching", path: "/searching-intro" },
    { name: "Tree Traversal", path: "/tree-intro" },
    { name: "Backtracking", path: "/backtracking-intro" },
  ];

  return (
    <footer className="border-t border-border/40 glass mt-20">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand — full width on small */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Code2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-base font-bold text-foreground">
                Algo<span className="text-primary">Vision</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Interactive algorithm visualizations with real-time animations and sound effects.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg glass text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@algovision.dev"
                className="p-2 rounded-lg glass text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Algorithms */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Algorithms</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.path}>
                  <button
                    onClick={() => navigate(cat.path)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left flex items-center gap-1.5 group"
                  >
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AlgoVision helps you understand complex algorithms through visual and auditory feedback, step by step.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                Real-time Animations
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                Sound Effects
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                Complexity Analysis
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AlgoVision. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-destructive" /> for learning
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
