import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import type { UserSkill, AssessmentState, AssessmentQuestion, Badge } from "types";
import { toast } from "sonner";

type View = "select" | "in_progress" | "result";

export default function Assessments() {
  const [assessment, setAssessment] = useState<AssessmentState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [view, setView] = useState<View>("select");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [badgeClaimed, setBadgeClaimed] = useState<boolean>(false);

  // Fetch user's skills on component mount
  useEffect(() => {
    const fetchUserSkills = async () => {
      // ... existing code ...
    };
    fetchUserSkills();
  }, []);

  const handleStartAssessment = async () => {
    if (!selectedSkill) {
      toast.error("Please select a skill to assess.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await brain.start_assessment({ skill_name: selectedSkill });
      if (res.ok) {
        const assessmentState: AssessmentState = await res.json();
        setAssessment(assessmentState);
        setView("in_progress");
        setBadgeClaimed(false); // Reset badge state
        toast.success(`Assessment for ${selectedSkill} started!`);
      } else {
        toast.error("Failed to start assessment.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while starting the assessment.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!assessment || selectedAnswer === null) {
      toast.error("Please select an answer before submitting.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await brain.submit_answer({
        assessment_id: assessment.id,
        question_id: assessment.current_question.id,
        answer_id: selectedAnswer,
      });
      if (res.ok) {
        const updatedAssessment: AssessmentState = await res.json();
        setAssessment(updatedAssessment);
        setSelectedAnswer(null);
        if (updatedAssessment.is_complete) {
          setView("result");
          toast.success("Assessment completed!");
        } else {
          toast.success("Answer submitted successfully!");
        }
      } else {
        toast.error("Failed to submit answer.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while submitting your answer.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBadge = async () => {
    if (!assessment) return;
    setIsLoading(true);
    try {
      const res = await brain.issue_badge({ assessment_id: assessment.id });
      if (res.ok) {
        toast.success("Badge successfully claimed!");
        setBadgeClaimed(true);
      } else {
        const errorData = await res.json();
        toast.error(`Failed to claim badge: ${errorData.detail}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while claiming your badge.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLevelFromScore = (score: number): string => {
    if (score >= 90) return "Expert";
    if (score >= 70) return "Proficient";
    if (score >= 50) return "Working";
    return "Foundational";
  }

  const renderResultView = () => {
    const score = assessment?.score ?? 0;
    const passed = score >= 50;
    
    return (
      <Card className="w-full max-w-md text-center">
          <CardHeader>
              <CardTitle>Assessment Complete!</CardTitle>
              <CardDescription>You have completed the assessment for {assessment?.skill_name}.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <div className={`text-6xl font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>{score}%</div>
              <div className="text-lg">
                  <p>Suggested Level:</p>
                  <p className="font-semibold text-accent">{getLevelFromScore(score)}</p>
              </div>
              {passed && (
                <div className="pt-4">
                  <Button 
                    onClick={handleClaimBadge} 
                    disabled={isLoading || badgeClaimed} 
                    className="w-full"
                  >
                    {isLoading ? "Claiming..." : (badgeClaimed ? "Badge Claimed!" : "Claim Your Badge")}
                  </Button>
                  {badgeClaimed && <p className="text-sm text-green-500 mt-2">View it on your Badges page!</p>}
                </div>
              )}
          </CardContent>
          <CardFooter className="flex-col gap-4">
              {!passed && <p className="text-sm text-muted-foreground">You did not pass this time. Feel free to try again later.</p>}
              <Button onClick={() => { setView('select'); setSelectedSkill('')}} className="w-full" variant="outline">Take Another Assessment</Button>
          </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[70vh]">
      {view === "result" && renderResultView()}
    </div>
  );
}
