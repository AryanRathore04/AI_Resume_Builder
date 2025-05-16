"use client";

import { SubscriptionLevel } from "@/lib/subscription";
import { createContext, ReactNode, useContext } from "react";

const SubscriptionLevelContext = createContext<SubscriptionLevel | undefined>(
  undefined,
);

interface SubscriptionLevelProviderProps {
  children: ReactNode;
  userSubscriptionLevel: SubscriptionLevel;
}

const SubscriptionLevelProvider = ({
  children,
  userSubscriptionLevel,
}: SubscriptionLevelProviderProps) => {
  return (
    <SubscriptionLevelContext.Provider value={userSubscriptionLevel}>
      {children}
    </SubscriptionLevelContext.Provider>
  );
};

export default SubscriptionLevelProvider;

export function userSubscriptionLevel() {
    const context = useContext(SubscriptionLevelContext);
    if (context === undefined) {
        throw new Error(
            "userSubscriptionLevel must be used within a SubscriptionLevelProvider",
        );
    }
    return context;
}
