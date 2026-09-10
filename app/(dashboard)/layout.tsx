import React from "react";
import Header from "./dashboard/_components/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-paper text-stage">
      <Header />
      <main className="container-x pb-16">{children}</main>
    </div>
  );
};

export default DashboardLayout;
