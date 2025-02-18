import { cn } from "@/lib/utils";
import React from "react";
import { Loader } from "lucide-react";
const LoaderPage = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-full h-screen flex justify-center items-center z-50 backdrop-filter backdrop-blur-sm bg-transparent bg-opacity fixed",
        className
      )}
    >
      <Loader className="w-6 h-6 animate-spin" />
    </div>
  );
};

export default LoaderPage;
