"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom React hook that warns the user if they attempt to navigate away from the page
 * with unsaved changes. It listens for window close and browser navigation events.
 *
 * @param {boolean} hasUnsavedChanges - A flag indicating whether there are unsaved changes.
 */
export const useWarnIfUnsavedChanges = (hasUnsavedChanges: boolean) => {
  const router = useRouter();

  useEffect(() => {
    /**
     * Handles the window close event by warning the user if there are unsaved changes.
     * @param {BeforeUnloadEvent} event - The event fired when the window is being closed.
     */
    const handleWindowClose = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = ""; // Required for some browsers to show prompt
    };

    const handleRouteChange = (url: string) => {
      if (
        hasUnsavedChanges &&
        !confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        // Cancel route change
        router.push(window.location.pathname);
        return;
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (
        hasUnsavedChanges &&
        !confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        history.pushState(null, "", window.location.pathname); // Prevent navigation
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      window.removeEventListener("popstate", handlePopState);
      // router.push = originalPush;
    };
  }, [hasUnsavedChanges]);
};
