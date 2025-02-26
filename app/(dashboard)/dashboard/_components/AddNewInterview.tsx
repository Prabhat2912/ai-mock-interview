"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [exp, setExp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jsonQuestions, setJsonQuestions] = useState([]);
  const { user } = useUser();
  const router = useRouter();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log(role, description, exp);
    const InputPrompt = `Job Position: ${role} Job Description: ${description} Years of Exprience:${exp}\ndepends on this information give me ${process.env.NEXT_PUBLIC_QUESTION_COUNT} interview questions with answers in json format\ngive question and answer as json field`;
    try {
      const result = await chatSession.sendMessage(InputPrompt);
      console.log(result.response.text());
      if (result.response) {
        toast.success("Interview questions generated successfully");
      }
      const mockRespJson = result.response
        .text()
        .replace("```json", "")
        .replace("```", "");
      setJsonQuestions(JSON.parse(mockRespJson));
      if (mockRespJson) {
        const res = await db
          .insert(MockInterview)
          .values({
            jsonMockResp: jsonQuestions.toString(),
            jobPosition: role,
            jobDescription: description,
            jobExperience: exp.toString(),
            createdBy:
              user?.primaryEmailAddress?.emailAddress?.toString() || "unknown",
            createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            mockId: uuidv4(),
          })
          .returning({ mockId: MockInterview.mockId });
        console.log(res);
        if (res) {
          toast.success("Interview questions saved successfully");
          router.push(`/dashboard/interview/${res[0].mockId}`);
        }
      } else {
        toast.error("Error in generating interview questions");
      }
      console.log(JSON.parse(mockRespJson));
    } catch (error) {
      toast.error("Error in generating interview questions");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all "
        onClick={() => {
          setOpenDialog(true);
        }}
      >
        <h2 className="font-bold text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interview
            </DialogTitle>

            <form onSubmit={onSubmit}>
              <div>
                <h2>
                  Add details about your Job position/role, Job description and
                  years of experience
                </h2>
                <div className="mt-7 my-2 flex-col flex gap-6 ">
                  <div>
                    <label className="mb-2">Job Position/Role</label>
                    <Input
                      placeholder="Ex. Full Stack Dev"
                      required
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 mt-4 ">
                      Job Description/Tech Stack in Short
                    </label>
                    <Textarea
                      cols={20}
                      placeholder="Ex. React, Nextjs, Angular etc."
                      required
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 mt-4s">No. of Year Exprience</label>
                    <Input
                      type="number"
                      max={100}
                      placeholder="Ex.2"
                      required
                      onChange={(e) => setExp(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-5 justify-end">
                <Button
                  variant={"ghost"}
                  type="button"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Generating From
                      AI
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
