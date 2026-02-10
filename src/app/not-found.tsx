import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="text-6xl font-bold text-neon-green/20">404</div>
      <div className="text-text-muted text-sm">
        Page not found. The requested resource does not exist.
      </div>
      <Link href="/">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
