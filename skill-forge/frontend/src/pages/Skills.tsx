
import React, { useEffect, useState } from "react";
import brain from "brain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Skill, UserSkill } from "types";

const SKILL_LEVELS = [
  "Foundational",
  "Working",
  "Advanced",
  "Expert",
];

export default function Skills() {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSkills = async () => {
    try {
      const [availableRes, userRes] = await Promise.all([
        brain.get_available_skills(),
        brain.get_user_skills(),
      ]);
      setAvailableSkills(await availableRes.json());
      setUserSkills(await userRes.json());
    } catch (error) {
      toast.error("Failed to load skills.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async () => {
    if (!selectedSkill || !selectedLevel) {
      toast.warning("Please select a skill and a level.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await brain.add_user_skill({
        skill_name: selectedSkill,
        skill_level: selectedLevel,
      });

      if (response.ok) {
        const newSkill = await response.json();
        setUserSkills([newSkill, ...userSkills]);
        toast.success(`Skill "${selectedSkill}" added successfully!`);
        setSelectedSkill("");
        setSelectedLevel("");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add skill: ${errorData.detail}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Add Skill Card */}
        <Card>
          <CardHeader>
            <CardTitle>Add a New Skill</CardTitle>
            <CardDescription>
              Select a skill from the list and specify your proficiency level.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="skill-select">Skill</label>
              <Select
                value={selectedSkill}
                onValueChange={setSelectedSkill}
                disabled={isLoading}
              >
                <SelectTrigger id="skill-select">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {availableSkills.map((skill) => (
                    <SelectItem key={skill.name} value={skill.name}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="level-select">Proficiency Level</label>
              <Select
                value={selectedLevel}
                onValueChange={setSelectedLevel}
                disabled={isLoading}
              >
                <SelectTrigger id="level-select">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAddSkill}
              disabled={isLoading || !selectedSkill || !selectedLevel}
              className="w-full"
            >
              {isLoading ? "Adding..." : "Add Skill"}
            </Button>
          </CardFooter>
        </Card>

        {/* My Skills Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Skills</CardTitle>
            <CardDescription>
              Your verified and unverified skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userSkills.length > 0 ? (
                  userSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">
                        {skill.skill_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{skill.skill_level}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      You haven't added any skills yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
