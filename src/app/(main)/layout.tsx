import React, { ReactNode } from "react";
import Navbar from "./Navbar";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {children}
    </div>
  );
};

export default layout;
