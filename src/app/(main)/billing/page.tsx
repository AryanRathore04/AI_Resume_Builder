import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const sub = await prisma.userSubscription.findUnique({ where: { userId } });

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-3xl font-bold">Billing</h1>
      <p>
        Your current plan: <strong>{sub?.razorpayStatus === "active" ? "Premium" : "Free"}</strong>
      </p>
      {sub?.razorpayCancelAtPeriodEnd && (
        <p className="text-destructive">
          Will cancel on {new Date(sub.razorpayCurrentPeriodEnd).toLocaleDateString()}
        </p>
      )}
      {sub?.razorpayStatus === "active" ? (
        <ManageSubscriptionButton />
      ) : (
        <RazorpayCheckoutButton amount={499} />
      )}
    </main>
  );
}