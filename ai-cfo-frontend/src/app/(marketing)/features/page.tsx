import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const features = [
  { group: "Core Architecture", items: [
    { name: "Global Overview", img: "/marketing-photos/Overview/OVER-1.png", desc: "Live aggregation of all corporate subsidiaries and performance metrics." },
    { name: "Accounts Payables", img: "/marketing-photos/Accounts Payables/AP-1.png", desc: "Automated OCR extraction, PO-matching, and invoice processing pipeline." },
    { name: "Upload Data", img: "/marketing-photos/Upload Data/UD-1.png", desc: "Secure drop-zone for spreadsheets, PDFs, and third-party exports." },
    { name: "Connectors", img: "/marketing-photos/Connectors/C-1.png", desc: "Pre-built API bridges to your existing ERPs and banking portals." },
    { name: "Excel Add-in", img: "/marketing-photos/Excel Add-in/EA-1.png", desc: "Native Microsoft Excel integration for direct push/pull syncing." },
  ]},
  { group: "AI & Intelligence", items: [
    { name: "AI CFO Chat", img: "/marketing-photos/AI CFO Chat/AI-CFO-CHAT-1.png", desc: "A conversational interface connected directly to your ledger and budgets." },
    { name: "Data Query (AI)", img: "/marketing-photos/Data Query (AI)/DQ-1.png", desc: "Instantly translate natural language into complex PostreSQL financial queries." },
    { name: "Anomaly Hub", img: "/marketing-photos/Anomaly Hub/AH-1.png", desc: "7-layer ML pipeline flagging duplicate payments and ledger manipulation." },
    { name: "Scenarios", img: "/marketing-photos/Scenarios/SC-1.png", desc: "Monte Carlo simulation engine testing 1,000 statistical outcomes." },
    { name: "Intelligence Feed", img: "/marketing-photos/Intelligence/I-1.png", desc: "A chronological feed of auto-generated insights and warnings." },
  ]},
  { group: "Reporting & Workflows", items: [
    { name: "Finance Report", img: "/marketing-photos/Finance Report/FR-1.png", desc: "One-click P&L, Balance Sheet, and narrative board summaries." },
    { name: "Budgeting", img: "/marketing-photos/Budgeting/B-1.png", desc: "Collaborative line-item planning and variance analysis." },
    { name: "KPI Builder", img: "/marketing-photos/KPI Builder/KPI-1.png", desc: "Custom formula constructor mapping complex data to visual gauges." },
    { name: "Org Chat", img: "/marketing-photos/Org Chat/ORG-1.png", desc: "Secure internal messaging tied directly to invoice anomaly resolutions." },
    { name: "Notifications", img: "/marketing-photos/Notifications/N-1.png", desc: "Real-time alerts for high-risk vendor payments or target breaches." },
  ]},
  { group: "Enterprise Governance", items: [
    { name: "Audit Trails", img: "/marketing-photos/Audit Trails/AT-1.png", desc: "Immutable SOC2-ready logging of every user action and data mutation." },
    { name: "Workspaces", img: "/marketing-photos/Workspaces/W-1.png", desc: "Strict data siloing for multiple corporate entities or consulting clients." },
    { name: "Workspace Settings", img: "/marketing-photos/Workspace Settings/WS-1.png", desc: "Granular configuration, billing, and system preference controls." },
    { name: "Permissions", img: "/marketing-photos/Permissions/P-1.png", desc: "Role-Based Access Control (RBAC) ensuring lowest-privilege security." },
    { name: "Team Directory", img: "/marketing-photos/Team Directory/TD-1.png", desc: "Centralized employee management and MFA provisioning." },
  ]}
];

export default function FeaturesGallery() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white">
      <MarketingHeader />
      
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          The Complete Architecture
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mb-16">
          Every screen, every module, every AI model. Take a visual tour of the entire CFOlytics platform.
        </p>

        <div className="space-y-24">
          {features.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{section.group}</h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items.map((item, i) => (
                  <div key={i} className="group rounded-2xl overflow-hidden bg-[#0f172a] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl hover:shadow-blue-500/10">
                    <div className="h-48 w-full bg-[#0a0d14] overflow-hidden border-b border-white/5 relative">
                      {/* Image zoom effect */}
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500" />
                      {/* Interactive pill */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white">Live</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
