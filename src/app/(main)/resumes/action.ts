// src/app/(main)/resumes/action.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function deleteResume(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // 1️⃣ Ensure the resume exists and belongs to this user
  const resume = await prisma.resume.findUnique({
    where: { id, userId },
  });
  if (!resume) {
    throw new Error("Resume not found");
  }

  // 2️⃣ Remove the stored photo, if any
  if (resume.photoURL) {
    await del(resume.photoURL);
  }

  // 3️⃣ DELETE ALL CHILD WORK-EXPERIENCES first
  await prisma.workExperience.deleteMany({
    where: { resumeId: id },
  });

  // (Optional) If you have other child tables (e.g. education, skills, summary):
  await prisma.education.deleteMany({ where: { resumeId: id } });
  

  // 4️⃣ Now delete the resume itself
  await prisma.resume.delete({
    where: { id },
  });

  // 5️⃣ Revalidate your Next.js cache
  revalidatePath("/resumes");
}
