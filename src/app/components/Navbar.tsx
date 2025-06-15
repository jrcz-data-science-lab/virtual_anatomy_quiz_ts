"use client";

import Link from "next/link";
import { JSX } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Navbar component that displays the site's navigation menu.
 * It includes links to different pages and highlights the active link.
 * It also displays a user avatar with an image and a fallback.
 *
 * @returns {JSX.Element} The navbar component.
 */

const Navbar = (): JSX.Element => {
  const pathname = usePathname();

  /**
   * isActive determines whether a given path is the current path and
   * returns a class string appropriate for a link.
   * @param {string} path The path to check
   * @returns {string} A class string for a link
   */
  const isActive = (path: string): string => {
    return pathname === path
      ? "mr-5 text-gray-900"
      : "mr-5 hover:text-gray-900";
  };

  return (
    <header className="text-gray-600 body-font border-y-blue-600 border-b-2">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link
          href="/"
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
        >
          <span className="ml-3 text-xl">Quiz Manager</span>
        </Link>
        <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap items-center text-base justify-center">
          <Link href="/create" className={isActive("/create")}>
            Create
          </Link>
          <Link href="/planned" className={isActive("/planned")}>
            Planned
          </Link>
          <Link href="/groups" className={isActive("/groups")}>
            Groups
          </Link>
          <Link href="/results" className={isActive("/results")}>
            Results
          </Link>
        </nav>
        <Avatar>
          <AvatarFallback>HZ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Navbar;
