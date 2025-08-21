"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/company-slug", {
      method: "POST",
      body: JSON.stringify({ name: query }), // FIXED key
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    console.log("Company Slug:", data.company_slug);
    setLoading(false);

    // Redirect to dynamic page
    router.push(`/stocks/${data.company_slug}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center justify-center w-full h-full gap-x-8"
    >
      <input
        className="border border-white w-3/12 h-12 rounded-xl text-black p-4"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search company"
      />
      <button
        type="submit"
        disabled={loading}
        className="border border-blue-200 w-34 h-12 rounded-xl bg-blue-200 text-lg"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
