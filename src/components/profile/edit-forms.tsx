"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

export function EditContactForm({ email, phone }: { email?: string; phone?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: email || "", phone: phone || "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_contact", ...form }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
      <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880-XXX-XXXXXXX" />
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={loading} size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Save Contact
        </Button>
        {saved && <span className="text-xs text-green-600">Saved!</span>}
      </div>
    </div>
  );
}

export function EditPersonalForm({ address, nidNumber, tinNumber }: { address?: string; nidNumber?: string; tinNumber?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ address: address || "", nidNumber: nidNumber || "", tinNumber: tinNumber || "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_personal", ...form }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
      <Input label="NID Number" value={form.nidNumber} onChange={(e) => setForm({ ...form, nidNumber: e.target.value })} placeholder="National ID number" />
      <Input label="TIN Number" value={form.tinNumber} onChange={(e) => setForm({ ...form, tinNumber: e.target.value })} placeholder="Tax Identification Number" />
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={loading} size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Save Changes
        </Button>
        {saved && <span className="text-xs text-green-600">Saved!</span>}
      </div>
    </div>
  );
}

export function AddBankForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bankName: "", branchName: "", accountNumber: "", routingNumber: "" });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.bankName || !form.accountNumber) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_bank", ...form }),
      });
      if (res.ok) {
        setForm({ bankName: "", branchName: "", accountNumber: "", routingNumber: "" });
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" /> Add Bank Account
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
      <Input label="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="e.g., Dutch Bangla Bank" required />
      <Input label="Branch" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} placeholder="Branch name" />
      <Input label="Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="Account number" required />
      <Input label="Routing Number" value={form.routingNumber} onChange={(e) => setForm({ ...form, routingNumber: e.target.value })} placeholder="Routing number" />
      <div className="flex gap-2">
        <Button onClick={handleAdd} disabled={loading} size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          Add
        </Button>
        <Button onClick={() => setOpen(false)} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
}

export function AddNomineeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relationship: "", nidNumber: "", share: "100" });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_nominee", ...form, share: parseFloat(form.share) || 100 }),
      });
      if (res.ok) {
        setForm({ name: "", relationship: "", nidNumber: "", share: "100" });
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" /> Add Nominee
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nominee name" required />
      <Input label="Relationship" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="e.g., Spouse, Child" />
      <Input label="NID Number" value={form.nidNumber} onChange={(e) => setForm({ ...form, nidNumber: e.target.value })} placeholder="NID" />
      <Input label="Share (%)" type="number" value={form.share} onChange={(e) => setForm({ ...form, share: e.target.value })} placeholder="100" />
      <div className="flex gap-2">
        <Button onClick={handleAdd} disabled={loading} size="sm" className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          Add
        </Button>
        <Button onClick={() => setOpen(false)} variant="outline" size="sm">Cancel</Button>
      </div>
    </div>
  );
}

export function DeleteButton({ id, action }: { id: string; action: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this?")) return;
    setLoading(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-700 p-1">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
