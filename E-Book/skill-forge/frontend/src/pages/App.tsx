
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@stackframe/react";
import { Button } from "@/components/ui/button";
import { UserButton } from "app/auth";

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <Button variant="link" onClick={() => navigate(to)} className="text-white">
      {children}
    </Button>
  );
};

export default function App() {
  const navigate = useNavigate();
  const user = useUser(); // Use the general useUser hook

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">SkillForge</h1>
          <nav className="flex items-center space-x-4">
            <NavLink to="/skills">Skills</NavLink>
            <NavLink to="/assessments">Assessments</NavLink>
            <NavLink to="/badges">Badges</NavLink>
          </nav>
          <UserButton />
        </div>
      </header>
      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Your Skill Passport</h2>
      </main>
    </div>
  );
}
