import "server-only";
import { forbidden, redirect } from "next/navigation";
import { can, type Permissao } from "./permissions";
import { getCurrentUser } from "./session";

/** Exige login; opcionalmente exige uma permissão. Use em páginas e server actions do painel. */
export async function requireUser(permissao?: Permissao) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (permissao && !can(user.papel, permissao)) forbidden();
  return user;
}
