"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function WorkspacesTeamPage() {
  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0a0d14] overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm">
          Manage your organization members, invite new collaborators, and configure access roles. 
          Members here have access to all workspaces within the organization according to their role.
        </p>

        <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] overflow-hidden">
          <OrganizationProfile 
            routing="hash"
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "w-full shadow-none",
                card: "w-full shadow-none bg-transparent m-0",
                navbar: "hidden", // Hide clerk internal navbar to keep it seamless
                pageScrollBox: "p-6",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
