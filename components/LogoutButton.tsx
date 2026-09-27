import { logout } from "@/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-xs font-medium text-stone-400 hover:text-stone-600">
        Salir
      </button>
    </form>
  );
}
