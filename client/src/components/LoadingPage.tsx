import { motion } from "framer-motion";
import { CheckCircle2, FileText, Sparkles, Upload } from "lucide-react";

const loadingSteps = [
  { label: "Reading workspace", icon: FileText },
  { label: "Checking resume data", icon: Upload },
  { label: "Preparing insights", icon: Sparkles }
];

export default function LoadingPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="relative mx-auto h-44 max-w-sm">
          <motion.div
            className="absolute left-1/2 top-5 h-32 w-24 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            animate={{ y: [0, -8, 0], rotate: [0, -1.5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="border-b border-neutral-100 p-3">
              <div className="h-2 w-12 rounded-full bg-[#2563eb]" />
              <div className="mt-2 h-1.5 w-16 rounded-full bg-neutral-200" />
            </div>
            <div className="space-y-2 p-3">
              <div className="h-1.5 rounded-full bg-neutral-200" />
              <div className="h-1.5 w-4/5 rounded-full bg-neutral-200" />
              <div className="h-1.5 w-3/5 rounded-full bg-neutral-200" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-5 left-8 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]"
            animate={{ y: [0, 9, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Upload size={21} />
          </motion.div>

          <motion.div
            className="absolute bottom-5 right-8 flex size-12 items-center justify-center rounded-xl bg-green-50 text-[#16a34a]"
            animate={{ y: [0, -7, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <CheckCircle2 size={21} />
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-0 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-950 text-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={18} />
          </motion.div>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase text-[#2563eb]">ResumeIQ</p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-950">Preparing your workspace</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            We are checking your session and getting your resume data ready.
          </p>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={step.label}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-xs font-semibold text-neutral-700"
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: index * 0.18 }}
            >
              <step.icon size={14} className="text-[#2563eb]" />
              {step.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
