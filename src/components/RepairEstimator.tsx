"use client";
import { useState } from "react";
import { DEVICE_BRANDS, REPAIR_TYPES } from "@/lib/constants";

type Step = "device" | "fault" | "estimate" | "capture" | "done";

export function RepairEstimator() {
  const [step, setStep] = useState<Step>("device");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [repairType, setRepairType] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [estimate, setEstimate] = useState<{ found: boolean; minPrice?: number; maxPrice?: number; message?: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getEstimate() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceBrand, deviceModel, repairType }),
      });
      setEstimate(await res.json());
      setStep("estimate");
    } catch { setError("Failed to get estimate. Please try again."); }
    finally { setLoading(false); }
  }

  async function submitLead() {
    if (!name || !phone) { setError("Name and phone are required."); return; }
    setLoading(true); setError("");
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, deviceBrand, deviceModel, faultDescription, estimatedMin: estimate?.minPrice, estimatedMax: estimate?.maxPrice }),
      });
      setStep("done");
    } catch { setError("Something went wrong. Please call us directly."); }
    finally { setLoading(false); }
  }

  function reset() {
    setStep("device"); setDeviceBrand(""); setDeviceModel(""); setRepairType("");
    setFaultDescription(""); setEstimate(null); setName(""); setPhone(""); setEmail(""); setError("");
  }

  const inp = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-primary outline-none text-sm transition-colors";

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-lg mx-auto shadow-xl">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-white mb-1">Instant Repair Estimate</h3>
        <p className="text-gray-400 text-sm">Get a price in under 60 seconds</p>
        <div className="flex gap-1 mt-4">
          {(["device","fault","estimate","capture"] as Step[]).map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
              ["device","fault","estimate","capture","done"].indexOf(step) >= i ? "bg-primary" : "bg-gray-700"
            }`} />
          ))}
        </div>
      </div>

      {step === "device" && (
        <div className="space-y-4">
          <div>
            <label className="label">Device Brand</label>
            <select value={deviceBrand} onChange={(e) => setDeviceBrand(e.target.value)} className={inp}>
              <option value="">Select brand...</option>
              {DEVICE_BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Model <span className="text-gray-600">(optional — helps accuracy)</span></label>
            <input value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} placeholder="e.g. iPhone 15 Pro, Galaxy S24" className={inp} />
          </div>
          <button disabled={!deviceBrand} onClick={() => setStep("fault")} className="btn-primary w-full">Next →</button>
        </div>
      )}

      {step === "fault" && (
        <div className="space-y-4">
          <div>
            <label className="label">What needs repairing?</label>
            <select value={repairType} onChange={(e) => setRepairType(e.target.value)} className={inp}>
              <option value="">Select repair type...</option>
              {REPAIR_TYPES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Describe the issue</label>
            <textarea value={faultDescription} onChange={(e) => setFaultDescription(e.target.value)} rows={3}
              placeholder="e.g. Screen cracked, touch not working in corner..."
              className={`${inp} resize-none`} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep("device")} className="btn-secondary flex-1">← Back</button>
            <button disabled={!repairType || loading} onClick={getEstimate} className="btn-primary flex-1">
              {loading ? "Checking..." : "Get Estimate"}
            </button>
          </div>
        </div>
      )}

      {step === "estimate" && estimate && (
        <div className="space-y-5">
          <div className={`rounded-xl p-5 text-center ${estimate.found ? "bg-green-900/30 border border-green-700/40" : "bg-gray-700 border border-gray-600"}`}>
            {estimate.found ? (
              <>
                <p className="text-gray-400 text-sm mb-1">Estimated cost</p>
                <p className="text-4xl font-black text-white">£{estimate.minPrice}–£{estimate.maxPrice}</p>
                <p className="text-green-400 text-xs mt-2">Final price confirmed after diagnostics — no surprises</p>
              </>
            ) : (
              <>
                <p className="text-white font-medium">Custom Quote Required</p>
                <p className="text-gray-400 text-sm mt-1">{estimate.message}</p>
              </>
            )}
          </div>
          <p className="text-gray-400 text-sm text-center">Leave your details and we'll call to confirm and book you in</p>
          <button onClick={() => setStep("capture")} className="btn-primary w-full">Book My Repair →</button>
          <button onClick={() => setStep("fault")} className="w-full text-gray-500 hover:text-gray-300 text-sm py-1 transition-colors">← Change repair type</button>
        </div>
      )}

      {step === "capture" && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">We'll call you within 1 hour to confirm</p>
          <div>
            <label className="label">Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" className={inp} />
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 900000" className={inp} />
          </div>
          <div>
            <label className="label">Email <span className="text-gray-600">(optional)</span></label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep("estimate")} className="btn-secondary flex-1">← Back</button>
            <button disabled={loading} onClick={submitLead} className="btn-primary flex-1">{loading ? "Submitting..." : "Submit"}</button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-4 space-y-3">
          <div className="text-5xl">🎉</div>
          <h4 className="text-xl font-bold text-white">We'll be in touch!</h4>
          <p className="text-gray-400 text-sm">Thanks {name}. We've received your enquiry and will call you shortly to confirm your appointment.</p>
          <button onClick={reset} className="mt-2 text-primary hover:text-primary-light text-sm transition-colors">Submit another enquiry</button>
        </div>
      )}
    </div>
  );
}
