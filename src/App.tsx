import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SortingIntroPage from "./pages/SortingIntroPage.tsx";
import SortingPage from "./pages/SortingPage.tsx";
import PathfindingIntroPage from "./pages/PathfindingIntroPage.tsx";
import PathfindingPage from "./pages/PathfindingPage.tsx";
import SearchingIntroPage from "./pages/SearchingIntroPage.tsx";
import SearchingPage from "./pages/SearchingPage.tsx";
import GraphIntroPage from "./pages/GraphIntroPage.tsx";
import GraphPage from "./pages/GraphPage.tsx";
import TreeIntroPage from "./pages/TreeIntroPage.tsx";
import TreePage from "./pages/TreePage.tsx";
import BacktrackingIntroPage from "./pages/BacktrackingIntroPage.tsx";
import BacktrackingPage from "./pages/BacktrackingPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sorting-intro" element={<SortingIntroPage />} />
          <Route path="/sorting" element={<SortingPage />} />
          <Route path="/pathfinding-intro" element={<PathfindingIntroPage />} />
          <Route path="/pathfinding" element={<PathfindingPage />} />
          <Route path="/searching-intro" element={<SearchingIntroPage />} />
          <Route path="/searching" element={<SearchingPage />} />
          <Route path="/graph-intro" element={<GraphIntroPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/tree-intro" element={<TreeIntroPage />} />
          <Route path="/tree" element={<TreePage />} />
          <Route path="/backtracking-intro" element={<BacktrackingIntroPage />} />
          <Route path="/backtracking" element={<BacktrackingPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
