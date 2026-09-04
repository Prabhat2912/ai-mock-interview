"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [exp, setExp] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          description,
          exp,
          questionCount: process.env.NEXT_PUBLIC_QUESTION_COUNT,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { mockId } = (await res.json()) as { mockId: string };
      toast.success("Interview created");
      router.push(`/dashboard/interview/${mockId}`);
    } catch (error) {
      console.error(error);
      toast.error("Error in generating interview questions");
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
