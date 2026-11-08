import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export async function requireUser(): Promise<User> {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return user;
}
