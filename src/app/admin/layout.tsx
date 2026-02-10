import { cookies } from "next/headers";
import { loginAdmin } from "@/actions/departures";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const isAuthenticated = token === process.env.ADMIN_SECRET;

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto mt-24">
        <div className="border border-border-primary bg-bg-secondary rounded-sm p-6">
          <h1 className="text-sm font-bold text-neon-green mb-4">
            ADMIN ACCESS
          </h1>
          <form action={loginAdmin} className="space-y-4">
            <div>
              <label
                htmlFor="secret"
                className="text-[10px] text-text-muted uppercase tracking-wider block mb-1"
              >
                Admin Secret
              </label>
              <input
                type="password"
                name="secret"
                id="secret"
                required
                className="w-full bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-neon-green/50"
                placeholder="Enter admin secret"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-sm px-3 py-2 text-xs font-medium hover:bg-neon-green/20 transition-colors duration-150 cursor-pointer"
            >
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-primary">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-amber">ADMIN PANEL</h1>
          <span className="text-[10px] text-text-muted">Authenticated</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/admin"
            className="text-text-secondary hover:text-amber transition-colors duration-150"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/submissions"
            className="text-text-secondary hover:text-amber transition-colors duration-150"
          >
            Submissions
          </Link>
          <Link
            href="/admin/new"
            className="text-text-secondary hover:text-amber transition-colors duration-150"
          >
            + New Departure
          </Link>
          <Link
            href="/"
            className="text-text-muted hover:text-text-secondary transition-colors duration-150"
          >
            View Site
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
