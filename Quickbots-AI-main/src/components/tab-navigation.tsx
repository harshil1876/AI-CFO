"use client";

import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import PreviewLayoutForm from "@/features/preview/previewFormLayout";
import { cn } from "@/lib/utils";
import { Eye, BarChart3, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePreviewModal } from "@/contexts/preview-modal-context";

const routes = ["configure", "settings", "advance", "api-connect", "danger"];

const routeLabels: Record<string, string> = {
  configure: "Configure",
  settings: "Settings",
  "api-connect": "Api / Connect",
  advance: "Advance Settings",
  danger: "Danger Zone",
};

// Routes to show on screen
const visibleRoutes = ["configure", "settings"];
// Routes to put in dropdown
const dropdownRoutes = ["api-connect", "advance", "danger"];

interface TabsNavigationProps {
  slug: string;
  enableMobileAnalytics?: boolean;
  onOpenAnalytics?: () => void;
}

export function TabsNavigation({
  slug,
  enableMobileAnalytics,
  onOpenAnalytics,
}: TabsNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPreviewOpen, setIsPreviewOpen } = usePreviewModal();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const isDirtyRef = useRef(false);

  const current = pathname.split("/").pop();
  const activeTab = routes.includes(current ?? "") ? current : "configure";

  // Handle modal open/close - simple state management, no URL
  const handlePreviewOpenChange = (open: boolean) => {
    if (!open && isDirtyRef.current) {
      // User is trying to close with unsaved changes
      setShowConfirmDialog(true);
    } else {
      setIsPreviewOpen(open);
    }
  };

  // Handle preview button click
  const handlePreviewClick = () => {
    setIsPreviewOpen(true);
  };

  // Handle dirty state change from form
  const handleDirtyChange = (isDirty: boolean) => {
    isDirtyRef.current = isDirty;
  };

  // Handle confirmation dialog actions
  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    setIsPreviewOpen(false);
    isDirtyRef.current = false; // Reset dirty state after closing
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 pt-4 sm:pt-5 md:pt-6 overflow-x-hidden w-full min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Tabs value={activeTab} className={cn("w-full min-w-0")}>
          <TabsList
            className={cn(
              "flex items-center rounded-xl bg-muted px-1 sm:px-2 py-1.5 sm:py-2 border-border border",
              "gap-1 sm:gap-1.5",
              "w-full min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            )}
          >
            {/* Visible tabs */}
            {visibleRoutes.map((route) => (
              <TabsTrigger
                key={route}
                value={route}
                onClick={() => {
                  const newPath = `/bots/${slug}/${route}`;
                  router.push(newPath, { scroll: false });
                }}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-0.5 text-xs sm:text-sm font-medium shrink-0",
                  "transition-colors duration-200",
                  "hover:bg-muted/80 hover:text-foreground",
                  "data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:py-2 sm:data-[state=active]:py-2.5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "whitespace-nowrap"
                )}
              >
                {routeLabels[route] || route.replace("-", " ")}
              </TabsTrigger>
            ))}

            {/* Dropdown for remaining routes - hidden on lg+ screens */}
            <div className="hidden lg:contents">
              {dropdownRoutes.map((route) => (
                <TabsTrigger
                  key={route}
                  value={route}
                  onClick={() => {
                    const newPath = `/bots/${slug}/${route}`;
                    router.push(newPath, { scroll: false });
                  }}
                  className={cn(
                    "px-2 sm:px-3 py-1 sm:py-0.5 text-xs sm:text-sm font-medium shrink-0",
                    "transition-colors duration-200",
                    "hover:bg-muted/80 hover:text-foreground",
                    "data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:py-2 sm:data-[state=active]:py-2.5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "whitespace-nowrap"
                  )}
                >
                  {routeLabels[route] || route.replace("-", " ")}
                </TabsTrigger>
              ))}
            </div>

            {/* Dropdown for remaining routes - visible on smaller screens */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={
                      activeTab && dropdownRoutes.includes(activeTab)
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    className={cn(
                      "px-2 sm:px-3 py-1 sm:py-0.5 text-xs sm:text-sm font-medium h-auto shrink-0",
                      "transition-colors duration-200",
                      activeTab && dropdownRoutes.includes(activeTab)
                        ? "bg-white text-foreground shadow"
                        : "hover:bg-muted/80 hover:text-foreground",
                      "whitespace-nowrap"
                    )}
                  >
                    More
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {dropdownRoutes.map((route) => {
                    const label = routeLabels[route] || route.replace("-", " ");
                    return (
                      <DropdownMenuItem
                        key={route}
                        onClick={() => {
                          const newPath = `/bots/${slug}/${route}`;
                          router.push(newPath, { scroll: false });
                        }}
                        className={cn(
                          activeTab === route && "bg-muted font-semibold"
                        )}
                      >
                        {label}
                      </DropdownMenuItem>
                    );
                  })}
                  {/* Add Analytics to dropdown if enabled */}
                  {enableMobileAnalytics && onOpenAnalytics && (
                    <DropdownMenuItem onClick={onOpenAnalytics}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Add Preview button - always visible */}
            <div className="ml-auto shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={handlePreviewClick}
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-0.5 text-xs sm:text-sm font-medium h-auto",
                  "transition-all duration-200",
                  "bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
                  "border-blue-200 dark:border-blue-800",
                  "text-blue-700 dark:text-blue-300",
                  "hover:bg-linear-to-r hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40",
                  "hover:border-blue-300 dark:hover:border-blue-700",
                  "hover:shadow-sm",
                  "font-semibold whitespace-nowrap"
                )}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
          </TabsList>
        </Tabs>
      </div>

      {/* Preview Modal */}
      <Modal
        open={isPreviewOpen}
        onOpenChange={handlePreviewOpenChange}
        closeOnOverlayClick={false}
        classname="sm:max-w-6xl w-[95vw] max-w-[95vw] max-h-[95vh] p-3 sm:p-4 md:p-6 overflow-hidden flex flex-col"
      >
        <PreviewLayoutForm
          key={`preview-${slug}`}
          onDirtyChange={handleDirtyChange}
        />
      </Modal>

      {/* Confirmation Dialog for Unsaved Changes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in the preview form. Are you sure you
              want to close without saving? All your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
