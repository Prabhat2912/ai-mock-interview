import React from "react";
import Header from "./dashboard/_components/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen mx-5 md:mx-20 lg:mx-36">{children}</main>
    </>
  );
};

export default DashboardLayout;
