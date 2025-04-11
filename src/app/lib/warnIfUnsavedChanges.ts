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
        throw "Route change aborted."; // Prevent route change
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    window.addEventListener("popstate", handleWindowClose); // catch browser back/forward

    const originalPush = router.push;
    router.push = async (...args) => {
      if (
        hasUnsavedChanges &&
        !confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        return;
      }
      // @ts-ignore
      return originalPush.apply(router, args);
    };

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      window.removeEventListener("popstate", handleWindowClose);
      router.push = originalPush;
    };
  }, [hasUnsavedChanges, router]);
};
