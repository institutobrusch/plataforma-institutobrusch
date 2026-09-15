// "Autenticação" simulada apenas para a demonstração (sem backend).
// Na Etapa 3 isto é substituído por Supabase Auth (e-mail/senha + Google) + convites.
const KEY = "brusch_demo_logged";

export function demoLogin() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}

export function demoLogout() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function isDemoLogged(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
