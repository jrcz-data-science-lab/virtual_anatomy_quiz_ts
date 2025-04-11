// "use client";

// import { useEffect, useRef, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";

// export function useWarnIfUnsavedChanges(
//   shouldBlock: boolean,
//   onConfirm?: () => void
// ) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [lastPathname, setLastPathname] = useState(pathname);
//   const [confirmedNavigation, setConfirmedNavigation] = useState(false);
//   const blockRef = useRef(shouldBlock);

//   useEffect(() => {
//     blockRef.current = shouldBlock;
//   }, [shouldBlock]);

//   useEffect(() => {
//     const handleBeforeUnload = (event: BeforeUnloadEvent) => {
//       if (blockRef.current) {
//         event.preventDefault();
//         event.returnValue = ""; // This is required for Chrome to show the confirmation dialog
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);

//   useEffect(() => {
//     if (pathname !== lastPathname) {
//       if (blockRef.current && !confirmedNavigation) {
//         const confirmLeave = window.confirm(
//           "You have unsaved changes. Are you sure you want to leave this page?"
//         );
//         if (!confirmLeave) {
//           // Prevent route update
//           router.push(lastPathname); // Force back to the previous route
//         } else {
//           setConfirmedNavigation(true);
//           setLastPathname(pathname);
//           if (onConfirm) onConfirm();
//         }
//       } else {
//         setLastPathname(pathname);
//       }
//     }
//   }, [pathname]);
// }
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
        router.push(window.location.pathname); // Stay on current page
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
