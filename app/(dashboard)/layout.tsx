import React from "react";
import Header from "./dashboard/_components/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
};

export default DashboardLayout;
