"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORIES = ["Market Update", "Fund Commentary", "Education", "Regulatory", "Announcement"];

export default function AdminContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "", publish: true });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchArticles = () => {
    fetch("/api/admin/content").then(r => r.json()).then(setArticles).catch(() => {});
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ title: "", content: "", category: "", publish: true });
        fetchArticles();
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    setActionLoading(id);
    try {
      await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...(isPublished ? { unpublish: true } : { publish: true }) }),
      });
      fetchArticles();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/content?id=${id}`, { method: "DELETE" });
      fetchArticles();
    } finally {
      setActionLoading(null);
    }
  };

  const published = articles.filter(a => a.publishedAt);
  const drafts = articles.filter(a => !a.publishedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
          <p className="text-sm text-gray-500">Manage market commentary, insights, and articles</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
          <Plus className="w-4 h-4 mr-1" /> New Article
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Published</p><p className="text-xl font-bold text-green-600">{published.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Drafts</p><p className="text-xl font-bold text-amber-600">{drafts.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold">{articles.length}</p></CardContent></Card>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle className="text-base">New Article</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" required />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm">
                  <option value="">No category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[150px]" placeholder="Write your article content..." required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.publish} onChange={(e) => setForm({ ...form, publish: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-gray-700">Publish immediately</span>
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-[#1e3a5f] hover:bg-[#2d5a8f] text-white">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Create
                </Button>
                <Button type="button" onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      <Card>
        <CardHeader><CardTitle className="text-base">All Articles</CardTitle></CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No articles yet. Create your first one above.</p>
          ) : (
            <div className="space-y-3">
              {articles.map((a) => (
                <div key={a.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={a.publishedAt ? "success" : "warning"}>
                        {a.publishedAt ? "Published" : "Draft"}
                      </Badge>
                      {a.category && <Badge variant="outline" className="text-[10px]">{a.category}</Badge>}
                    </div>
                    <h4 className="font-medium text-gray-800 text-sm">{a.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(a.createdAt).toLocaleDateString("en-GB")}
                      {a.publishedAt && ` | Published: ${new Date(a.publishedAt).toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button size="sm" variant="outline" onClick={() => togglePublish(a.id, !!a.publishedAt)} disabled={actionLoading === a.id}>
                      {actionLoading === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : a.publishedAt ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteArticle(a.id)} disabled={actionLoading === a.id}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
