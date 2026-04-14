"use client";

import Link from "next/link";
import {
  Download, ExternalLink, CheckCircle2,
  FileCode2, TableProperties, UploadCloud, Sparkles
} from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "Download the manifest file",
    icon: Download,
    color: "indigo",
    description: "The manifest.xml file tells Excel where to find your CFOlytics add-in and how to display it in the ribbon.",
    action: (
      <a
        href="/manifest.xml"
        download="cfolytics-manifest.xml"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors mt-3"
      >
        <Download size={13} /> Download manifest.xml
      </a>
    ),
  },
  {
    step: 2,
    title: "Sideload the add-in in Excel",
    icon: FileCode2,
    color: "violet",
    description: "Sideloading installs the add-in locally for development without publishing to the Office Store.",
    substeps: [
      "Open Microsoft Excel (Desktop)",
      "Go to: Insert → Add-ins → My Add-ins",
      "Click &quot;Manage My Add-ins&quot; → &quot;Upload My Add-in&quot;",
      "Select the downloaded manifest.xml file",
      "Click Upload — CFOlytics will appear in the Home ribbon",
    ],
  },
  {
    step: 3,
    title: "Open the CFOlytics task pane",
    icon: TableProperties,
    color: "cyan",
    description: "After sideloading, you will see a CFOlytics button in the Excel Home ribbon.",
    substeps: [
      "In the Excel Home tab, find the &quot;CFOlytics&quot; group in the ribbon",
      "Click &quot;Open CFOlytics&quot; to open the task pane on the right side",
      "Paste your Workspace ID (Bot ID) into the task pane input field",
    ],
  },
  {
    step: 4,
    title: "Use the add-in features",
    icon: Sparkles,
    color: "emerald",
    description: "The CFOlytics task pane has 4 tabs for different financial operations:",
    features: [
      { icon: "📊", label: "KPIs", desc: "View live financial KPIs from your workspace" },
      { icon: "⬇️", label: "Push", desc: "Write KPI data directly into Excel cells starting at A1" },
      { icon: "⬆️", label: "Sync", desc: "Select a data range in Excel and sync it to CFOlytics as transactions" },
      { icon: "💰", label: "Budget", desc: "Pull monthly budget allocations into the active sheet" },
    ],
  },
];

const COLOR_STYLES: Record<string, { border: string; bg: string; text: string; num: string }> = {
  indigo: { border: "border-indigo-500/20", bg: "bg-indigo-500/10", text: "text-indigo-400", num: "bg-indigo-600" },
  violet: { border: "border-violet-500/20", bg: "bg-violet-500/10", text: "text-violet-400", num: "bg-violet-600" },
  cyan:   { border: "border-cyan-500/20",   bg: "bg-cyan-500/10",   text: "text-cyan-400",   num: "bg-cyan-600" },
  emerald:{ border: "border-emerald-500/20",bg: "bg-emerald-500/10",text: "text-emerald-400",num: "bg-emerald-600" },
};

export default function ExcelSetupPage() {
  return (
    <div className="w-full min-h-full bg-[#0a0d14] p-6 pb-16">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Microsoft Excel Add-in Setup</h1>
            <p className="text-sm text-slate-500 mt-0.5">Connect your Excel spreadsheets directly to the CFOlytics AI Finance platform.</p>
          </div>
        </div>

        {/* Quick Access Banner */}
        <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Preview the task pane in your browser</p>
            <p className="text-xs text-slate-500 mt-0.5">Test the add-in UI before sideloading into Excel.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/excel-addin/taskpane"
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1e2637] hover:bg-[#2a3448] text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
            >
              <ExternalLink size={12} /> Open Preview
            </Link>
            <a
              href="/manifest.xml"
              download="cfolytics-manifest.xml"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Download size={12} /> Download Manifest
            </a>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((s) => {
            const styles = COLOR_STYLES[s.color];
            const Icon = s.icon;
            return (
              <div key={s.step} className={`rounded-xl border ${styles.border} bg-[#0c0f17] overflow-hidden`}>
                {/* Step header */}
                <div className={`flex items-center gap-3 px-5 py-4 ${styles.bg}`}>
                  <span className={`flex-shrink-0 w-6 h-6 ${styles.num} rounded-full text-white text-xs font-bold flex items-center justify-center`}>
                    {s.step}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${styles.border} ${styles.bg}`}>
                    <Icon size={14} className={styles.text} />
                  </div>
                  <h2 className="text-sm font-semibold text-white">{s.title}</h2>
                </div>

                {/* Step content */}
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{s.description}</p>

                  {"substeps" in s && s.substeps && (
                    <ol className="space-y-2">
                      {s.substeps.map((sub, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400">
                          <span className={`flex-shrink-0 w-4 h-4 rounded-full ${styles.num} text-white text-[9px] font-bold flex items-center justify-center mt-0.5`}>
                            {i + 1}
                          </span>
                          {sub}
                        </li>
                      ))}
                    </ol>
                  )}

                  {"features" in s && s.features && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                      {s.features.map((f) => (
                        <div key={f.label} className="flex items-start gap-2.5 bg-[#0a0d14] border border-[#1e2637] rounded-lg px-3 py-2.5">
                          <span className="text-base flex-shrink-0">{f.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-white">{f.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {"action" in s && s.action}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sync format guide */}
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <UploadCloud size={14} className="text-amber-400" />
            Excel → Cloud Sync: Required Column Format
          </h3>
          <div className="overflow-x-auto rounded-lg border border-[#1e2637]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e2637] bg-[#0c0f17]">
                  {["date", "category", "amount", "transaction_type", "description (optional)"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-amber-500 font-mono font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["2026-04-01", "Marketing", "5000", "expense", "Q2 ad spend"],
                  ["2026-04-02", "SaaS Revenue", "25000", "revenue", "Monthly MRR"],
                  ["2026-04-03", "Engineering", "12000", "expense", "Salaries"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#1e2637] hover:bg-white/[0.02]">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-slate-400 font-mono">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-600 mt-2">Row 1 must be the header row. Column order doesn&apos;t matter as long as names match.</p>
        </div>

        {/* Completion note */}
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Production deployment</p>
            <p className="text-xs text-slate-400 mt-0.5">
              For production, update <code className="text-emerald-400 font-mono text-[10px]">manifest.xml</code> to replace <code className="font-mono text-[10px] text-slate-400">localhost:3000</code> with your live domain (HTTPS required). Then publish via Microsoft AppSource or internal organizational deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
