"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Bot, BookOpenIcon } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center z-10 group relative">
            <h1 className="font-getvoip text-sm sm:text-base md:text-lg font-bold text-foreground tracking-wide relative">
              <span className="absolute -top-2 sm:-top-3 -right-8 sm:-right-10 bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 leading-tight rounded-md shadow-md uppercase tracking-wider">
                BETA
              </span>
              <span className="hidden sm:inline">QUICKBOTS</span>
              <span className="sm:hidden">QUICKBOTS</span>
            </h1>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Dashboard button - visible on desktop for signed-in users */}
            <SignedIn>
              <Button
                asChild
                variant="default"
                size="sm"
                className="hidden md:flex"
              >
                <Link href="/bots" className="flex items-center gap-2">
                  Dashboard
                </Link>
              </Button>
            </SignedIn>

            {/* Get Started button - visible on desktop for signed-out users */}
            <SignedOut>
              <Button
                asChild
                variant="default"
                size="sm"
                className="hidden md:flex"
              >
                <Link href="/bots" className="flex items-center gap-2">
                  Get Started
                </Link>
              </Button>
            </SignedOut>

            <SignedOut>
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="redirect">
                  <Button variant="ghost" size="sm" className="text-sm ">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
            {/* Theme toggle - visible on desktop */}
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>

            {/* Desktop menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href="/docs"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpenIcon className="h-4 w-4" />
                    <span>Docs</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle - visible on mobile */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>

            {/* Mobile menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href="/bots"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/docs"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpenIcon className="h-4 w-4" />
                    <span>Docs</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">
                    Pricing
                  </Link>
                </DropdownMenuItem>

                <SignedOut>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-2">
                    <SignInButton mode="redirect">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm"
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="redirect">
                      <Button size="sm" className="w-full text-sm">
                        Get Started
                      </Button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
