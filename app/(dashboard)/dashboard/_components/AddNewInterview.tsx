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
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const AddNewInterview = ({ variant = "ledger" }: { variant?: "masthead" | "ledger" }) => {
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
      toast.success("Mock called. Places, please.");
      router.push(`/dashboard/interview/${mockId}`);
    } catch (error) {
      console.error(error);
      toast.error("The call sheet could not be written. Check the problem and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpenDialog(true)}
        className={
          variant === "masthead"
            ? "btn-marquee shrink-0 rounded-none"
            : "group flex w-full items-center gap-5 border border-dashed border-stage/40 bg-paper-deep/40 px-6 py-5 text-left transition-colors hover:border-stage hover:bg-paper-deep/70"
        }
      >
        {variant === "masthead" ? (
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" strokeWidth={3} aria-hidden />
            Call a new mock
          </span>
        ) : (
          <>
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-stage text-paper transition-colors group-hover:bg-marquee group-hover:text-stage">
              <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </span>
            <span>
              <span className="block font-display text-2xl font-semibold uppercase leading-none tracking-wide">
                Call a new mock
              </span>
              <span className="mt-1 block text-sm text-tungsten">
                Role, stack, experience — the room writes your five cues.
              </span>
            </span>
          </>
        )}
      </button>

      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent className="max-w-2xl border-stage/20 bg-paper p-0 text-stage">
          <div className="bg-stage px-6 py-5 text-paper">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-semibold uppercase tracking-wide">
                The call sheet
              </DialogTitle>
              <p className="mt-1 text-sm font-normal normal-case tracking-normal text-paper/60">
                Specific sheets get sharper cues. “Senior React, Next.js,
                testing, four years, fintech” beats “frontend dev”.
              </p>
            </DialogHeader>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
            <div>
              <label htmlFor="new-role" className="text-sm font-bold">
                Job position / role
              </label>
              <Input
                id="new-role"
                className="mt-2 h-11 rounded-none border-stage/30 bg-paper"
                placeholder="Senior Frontend Engineer"
                required
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-desc" className="text-sm font-bold">
                Job description / tech stack
              </label>
              <Textarea
                id="new-desc"
                className="mt-2 min-h-[110px] rounded-none border-stage/30 bg-paper"
                placeholder="React, Next.js, TypeScript, system design, testing…"
                required
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-exp" className="text-sm font-bold">
                Years of experience
              </label>
              <Input
                id="new-exp"
                className="tnum mt-2 h-11 rounded-none border-stage/30 bg-paper"
                type="number"
                min={0}
                max={100}
                placeholder="3"
                required
                onChange={(e) => setExp(parseInt(e.target.value))}
              />
            </div>
            <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                type="button"
                className="rounded-none font-bold uppercase tracking-[0.08em] text-stage hover:bg-paper-deep"
                onClick={() => setOpenDialog(false)}
              >
                Not yet
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="btn-marquee rounded-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden />
                    Writing cues…
                  </>
                ) : (
                  "Write it and begin"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
