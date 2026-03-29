"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Calendar, CheckCircle, Loader2 } from "lucide-react";

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"callback" | "appointment">("callback");
  const [form, setForm] = useState({ date: "", time: "", topic: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab === "callback" ? "CALLBACK" : "APPOINTMENT", ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Submitted!");
        setForm({ date: "", time: "", topic: "", notes: "" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Book a Consultation</h1>
        <p className="text-sm text-gray-500">Request a callback or schedule an appointment with our advisors</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setTab("callback")} className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
          tab === "callback" ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
        }`}>
          <Phone className="w-4 h-4" /> Request Callback
        </button>
        <button onClick={() => setTab("appointment")} className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
          tab === "appointment" ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
        }`}>
          <Calendar className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {success ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-green-800">{success}</h3>
            <p className="text-sm text-green-700 mt-2">Our team will get back to you shortly.</p>
            <Button onClick={() => setSuccess("")} variant="outline" className="mt-4">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {tab === "callback" ? "Callback Request" : "Appointment Booking"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "appointment" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Preferred Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  <Input label="Preferred Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Topic</label>
                <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="">Select a topic...</option>
                  <option value="Portfolio Review">Portfolio Review</option>
                  <option value="New Investment">New Investment Advice</option>
                  <option value="Redemption Guidance">Redemption Guidance</option>
                  <option value="SIP Setup">SIP Setup Help</option>
                  <option value="Tax Planning">Tax Planning</option>
                  <option value="KYC Update">KYC Update Assistance</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Additional Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px]" placeholder="Any specific questions or details..." />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (tab === "callback" ? <Phone className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />)}
                {tab === "callback" ? "Request Callback" : "Book Appointment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-gray-700 mb-2">Office Hours</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Sunday - Thursday: 9:00 AM - 5:00 PM</p>
            <p>Friday - Saturday: Closed</p>
            <p className="text-xs text-gray-400 mt-2">Callbacks are typically made within 2 business hours during office hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
