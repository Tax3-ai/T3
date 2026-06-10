import { RepairEstimator } from "@/components/RepairEstimator";
import Link from "next/link";

export default function BookPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">Book a Repair</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Get an instant estimate and submit your enquiry. We'll call within 1 hour to confirm.
        </p>
      </div>
      <RepairEstimator />
      <p className="text-center text-gray-500 text-sm mt-6">
        Prefer to walk in? We welcome drop-ins during opening hours.{" "}
        <Link href="/" className="text-primary hover:text-primary-light transition-colors">← Back to home</Link>
      </p>
    </div>
  );
}
