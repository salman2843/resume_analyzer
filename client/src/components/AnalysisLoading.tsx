import { motion } from "framer-motion";
import { BrainCircuit, FileSearch, ListChecks, Sparkles } from "lucide-react";

const steps = [
  { label: "Reading resume", icon: FileSearch },
  { label: "Checking structure", icon: ListChecks },
  { label: "Scoring content", icon: BrainCircuit },
  { label: "Finding improvements", icon: Sparkles }
];

type AnalysisLoadingProps = {
  compact?: boolean;
};

export default function AnalysisLoading({ compact = false }: AnalysisLoadingProps) {
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4"}>
      <div className="flex items-center gap-3">
        <motion.span
          className="flex size-10 items-center justify-center rounded-lg bg-sky-700 text-white"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        >
          <Sparkles size={18} />
        </motion.span>
        <div>
          <p className="text-sm font-semibold text-sky-950">AI analysis in progress</p>
          <p className="text-xs text-sky-700">Building a structured resume report.</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-700 ring-1 ring-sky-100"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
          >
            <step.icon size={14} className="text-sky-700" />
            {step.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
