"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
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
          <Link href="/create" className="mr-5 hover:text-gray-900">
            Create
          </Link>
          <Link href="/planned" className="mr-5 hover:text-gray-900">
            Planned
          </Link>
          <Link href="/groups" className="mr-5 hover:text-gray-900">
            Groups
          </Link>
          <Link href="/results" className="mr-5 hover:text-gray-900">
            Results
          </Link>
        </nav>
        <Avatar>
          <AvatarImage src="https://i.pinimg.com/736x/b4/bb/b2/b4bbb2198b036fe1024571ec6b60f8b8.jpg" />
          <AvatarFallback>XD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Navbar;
