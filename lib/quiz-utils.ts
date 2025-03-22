import React from "react";
import Katex from "@matejmazur/react-katex";

interface Option {
  key: string;
  value: string;
}

export const renderMathContent = (text: string): React.ReactNode[] => {
    try {
      const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
      return parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return React.createElement(Katex, {
            key: index,
            math: part.slice(2, -2),
            block: true
          });
        } else if (part.startsWith("$") && part.endsWith("$")) {
          return React.createElement(Katex, {
            key: index,
            math: part.slice(1, -1)
          });
        }
        return React.createElement("span", { key: index }, part);
      });
    } catch (error) {
      console.error("Error rendering math content:", error);
      return [React.createElement("span", { key: "error" }, text)];
    }
  };


  

export const parseOptions = (options: string | Record<string, string>): Option[] => {
  try {
    const parsed = typeof options === "string" ? JSON.parse(options) : options;
    return Object.entries(parsed).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  } catch (error) {
    console.error("Failed to parse options:", error);
    return [];
  }
};