"use client";

import { useEffect, useState } from "react";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { Shield, ShieldAlert, CheckCircle, Save, Loader2, XCircle } from "lucide-react";

interface TeamPermission {
  user_id: string;
  user_email: string;
  can_view_reports: boolean;
  can_upload_data: boolean;
  can_manage_budgets: boolean;
  can_manage_ap: boolean;
  can_run_simulations: boolean;
}

export default function TeamPermissionsPage() {
  const { getToken, orgId, userId: currentUserId } = useAuth();
  const { organization, memberships } = useOrganization({ memberships: true });
  const [permissions, setPermissions] = useState<TeamPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  
  const botId = orgId || "default_org";
  
  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      // We pass the active org role as a header so Django knows if it's an admin
      const member = memberships?.data?.find(m => m.publicUserData?.userId === currentUserId);
      const orgRole = member?.role || "org:admin"; 

      const res = await fetch(`https://ai-cfo-api-ehckcffwdxbug5eg.centralindia-01.azurewebsites.net/api/team/permissions/?bot_id=${botId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-User-Id": currentUserId || "",
          "X-Org-Role": orgRole
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (e) {
      console.error("Failed to load permissions", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (memberships?.data) {
      fetchPermissions();
    }
  }, [memberships?.data, botId]);

  const togglePermission = async (userId: string, userEmail: string, feature: keyof TeamPermission, currentValue: boolean) => {
    setUpdatingUser(userId);
    try {
      const token = await getToken();
      const member = memberships?.data?.find(m => m.publicUserData?.userId === currentUserId);
      const orgRole = member?.role || "org:admin";

      const res = await fetch(`https://ai-cfo-api-ehckcffwdxbug5eg.centralindia-01.azurewebsites.net/api/team/permissions/update/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-User-Id": currentUserId || "",
          "X-Org-Role": orgRole
        },
        body: JSON.stringify({
          bot_id: botId,
          user_id: userId,
          user_email: userEmail,
          feature: feature,
          value: !currentValue
        })
      });

      if (res.ok) {
        await fetchPermissions(); // Reload UI
      } else {
        alert("Failed to update permission. Check your Admin privileges.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Helper to extract a permission value correctly or default to false
  const getPermValue = (userId: string, feature: keyof TeamPermission) => {
    const row = permissions.find(p => p.user_id === userId);
    if (!row) return feature === 'can_view_reports'; // Default allow reports
    return row[feature] as boolean;
  };

  if (!organization) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center mt-20">
        <ShieldAlert className="h-20 w-20 text-amber-500 mx-auto mb-6 opacity-80" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-4">
          Organization Required
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Team permissions are an enterprise feature. Please select or create an organization using the switcher in the top right to manage roles.
        </p>
      </div>
    );
  }

  // Check if current user is admin
  const isCFO = memberships?.data?.find(m => m.publicUserData?.userId === currentUserId)?.role === "org:admin";

  if (!isCFO) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center mt-20">
        <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-6 opacity-80" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-600 mb-4">
          Access Denied
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          You do not have the required <strong>Administrator (CFO)</strong> permissions to view or modify granular team access rules. Please contact your organization owner.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Enterprise RBAC</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage granular feature toggles for your team members.</p>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#0f172a] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-black/40 text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Team Member</th>
                <th className="px-6 py-4 text-center">Clerk Role</th>
                <th className="px-4 py-4 text-center">Data Upload</th>
                <th className="px-4 py-4 text-center">View Reports</th>
                <th className="px-4 py-4 text-center">Budgeting</th>
                <th className="px-4 py-4 text-center">AP Automation</th>
                <th className="px-4 py-4 text-center">Simulations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {memberships?.data?.map((member) => {
                const user = member.publicUserData;
                if (!user || !user.identifier || !user.userId) return null;
                const userId = user.userId as string;
                const identifier = user.identifier as string;

                const isAdmin = member.role === "org:admin";
                const isUpdating = updatingUser === userId;

                const features: { key: keyof TeamPermission, label: string }[] = [
                  { key: 'can_upload_data', label: 'Upload Data' },
                  { key: 'can_view_reports', label: 'View Reports' },
                  { key: 'can_manage_budgets', label: 'Budgeting' },
                  { key: 'can_manage_ap', label: 'AP Auto' },
                  { key: 'can_run_simulations', label: 'Simulations' }
                ];

                return (
                  <tr key={userId} className="hover:bg-white/[0.02] transition-colors relative">
                    <td className="px-6 py-4 flex items-center gap-3 font-medium text-white">
                      <img src={user.imageUrl} className="h-8 w-8 rounded-full border border-white/10" alt="avatar" />
                      <div>
                        {identifier}
                        {userId === currentUserId && <span className="ml-2 text-xs text-amber-500">(You)</span>}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        isAdmin 
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}>
                        {member.role.replace('org:', '').toUpperCase()}
                      </span>
                    </td>

                    {/* Features Matrix */}
                    {features.map((f) => {
                      const hasAccess = isAdmin ? true : getPermValue(userId, f.key);
                      
                      return (
                        <td key={f.key} className="px-4 py-4 text-center align-middle">
                          <button
                            disabled={isAdmin || isUpdating}
                            onClick={() => togglePermission(userId, identifier, f.key, hasAccess)}
                            className={`p-2 rounded-lg transition-all ${
                              isAdmin ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10 active:scale-95"
                            }`}
                            title={isAdmin ? "Admins have all permissions by default" : `Toggle ${f.label}`}
                          >
                            {hasAccess ? (
                              <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-600 mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {isLoading && (
            <div className="p-8 flex justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Synchronizing with Django Vault...
            </div>
          )}
        </div>
      </div>
      
      <p className="text-slate-500 text-sm italic mt-4 text-center block">
        Note: Changes are applied instantly. Organization Admins permanently possess all capabilities.
      </p>
    </div>
  );
}
