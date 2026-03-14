"use client";

import { useState, useEffect, useMemo } from "react";

type ContentItem = {
	title: string;
	description: string;
	link: string;
	thumbnail?: string;
	pubDate: string;
	source: string;
};

const FALLBACK_IMAGE_POOL: string[] = [
	"https://picsum.photos/id/10/1200/675",
	"https://picsum.photos/id/11/1200/675",
	"https://picsum.photos/id/15/1200/675",
	"https://picsum.photos/id/28/1200/675",
	"https://picsum.photos/id/29/1200/675",
	"https://picsum.photos/id/42/1200/675",
	"https://picsum.photos/id/48/1200/675",
	"https://picsum.photos/id/57/1200/675",
	"https://picsum.photos/id/70/1200/675",
	"https://picsum.photos/id/76/1200/675",
	"https://picsum.photos/id/82/1200/675",
	"https://picsum.photos/id/92/1200/675",
	"https://picsum.photos/id/101/1200/675",
	"https://picsum.photos/id/103/1200/675",
	"https://picsum.photos/id/106/1200/675",
];

const hashString = (value: string): number => {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
};

const getRandomFallbackForKey = (key: string): string => {
	const index = hashString(key) % FALLBACK_IMAGE_POOL.length;
	return FALLBACK_IMAGE_POOL[index];
};

export default function BlogsSection() {
	const [place, setPlace] = useState("India");
	const [inputValue, setInputValue] = useState("India");
	const [blogs, setBlogs] = useState<ContentItem[]>([]);
	const [vlogs, setVlogs] = useState<ContentItem[]>([]);
	const [activeTab, setActiveTab] = useState<"blogs" | "vlogs">("blogs");
	const [sortBy, setSortBy] = useState<"relevance" | "newest">("relevance");
	const [youtubeOnly, setYoutubeOnly] = useState(false);
	const [visibleCount, setVisibleCount] = useState({ blogs: 9, vlogs: 9 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchTravelContent = async (searchTerm: string = "") => {
		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				limit: "60",
				blogSource: "reddit",
			});
			if (searchTerm) {
				params.set("q", searchTerm);
			}

			const url = `/api/blogs-vlogs?${params.toString()}`;
			console.log("[DEBUG] Fetching from:", url);

			const res = await fetch(url);

			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}

			const data = await res.json();

			if (
				data.status === "ok" &&
				Array.isArray(data.blogs) &&
				Array.isArray(data.vlogs)
			) {
				console.log(`[DEBUG] Received blogs=${data.blogs.length}, vlogs=${data.vlogs.length}`);
				setBlogs(data.blogs);
				setVlogs(data.vlogs);
				setVisibleCount({ blogs: 9, vlogs: 9 });
			} else {
				console.warn("[DEBUG] Invalid response format");
				setBlogs([]);
				setVlogs([]);
				setError("No travel blogs or vlogs available right now");
			}
		} catch (err: any) {
			console.error("[ERROR] Failed to load posts:", err);
			setError("Couldn't load travel blogs and vlogs. Please try again.");
			setBlogs([]);
			setVlogs([]);
		} finally {
			setLoading(false);
		}
	};

	// Load initial content + re-fetch when place changes
	useEffect(() => {
		fetchTravelContent(place);
	}, [place]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = inputValue.trim();
		if (trimmed) {
			setPlace(trimmed);
			// fetchTravelPosts will be triggered by useEffect
		}
	};

	const displayedItems = useMemo(() => {
		const baseItems = activeTab === "blogs" ? blogs : vlogs;

		const filtered =
			activeTab === "vlogs" && youtubeOnly
				? baseItems.filter((item) => {
						const link = item.link.toLowerCase();
						return link.includes("youtube") || link.includes("youtu.be");
					})
				: baseItems;

		const indexed = filtered.map((item, index) => ({ item, index }));

		if (sortBy === "newest") {
			indexed.sort((a, b) => {
				const aTs = Date.parse(a.item.pubDate || "");
				const bTs = Date.parse(b.item.pubDate || "");
				return (Number.isFinite(bTs) ? bTs : 0) - (Number.isFinite(aTs) ? aTs : 0);
			});
		}

		return indexed.map((row) => row.item);
	}, [activeTab, blogs, sortBy, vlogs, youtubeOnly]);

	const hasMore =
		activeTab === "blogs"
			? visibleCount.blogs < displayedItems.length
			: visibleCount.vlogs < displayedItems.length;

	const visibleItems =
		activeTab === "blogs"
			? displayedItems.slice(0, visibleCount.blogs)
			: displayedItems.slice(0, visibleCount.vlogs);

	const onLoadMore = () => {
		setVisibleCount((prev) =>
			activeTab === "blogs"
				? { ...prev, blogs: prev.blogs + 9 }
				: { ...prev, vlogs: prev.vlogs + 9 }
		);
	};

	const handleImgError = (key: string, e: React.SyntheticEvent<HTMLImageElement>) => {
		e.currentTarget.src = getRandomFallbackForKey(key);
	};

	return (
		<section className="max-w-7xl mx-auto px-6 py-16">
			{/* Header + Search */}
			<div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
				<h2 className="text-3xl font-bold">Travel {" "}<span className="text-purple-700">Blogs & Vlogs</span>{" "}</h2>

				<form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="e.g. Rajasthan, Kerala, Himalayas, Solo travel..."
						className="border rounded-lg px-4 py-2 flex-1 min-w-55 focus:outline-none focus:ring-2 focus:ring-purple-500"
					/>
					<button
						type="submit"
						disabled={loading}
						className="bg-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Loading..." : "Explore"}
					</button>
				</form>
			</div>

			<p className="text-sm text-gray-500 mb-6">
				Search any place to discover travel blogs and vlogs from public APIs.
			</p>

			<div className="flex items-center gap-2 mb-6">
				<button
					type="button"
					onClick={() => setActiveTab("blogs")}
					className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
						activeTab === "blogs"
							? "bg-purple-700 text-white border-purple-700"
							: "bg-white text-gray-700 border-gray-300"
					}`}
				>
					Blogs ({blogs.length})
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("vlogs")}
					className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
						activeTab === "vlogs"
							? "bg-purple-700 text-white border-purple-700"
							: "bg-white text-gray-700 border-gray-300"
					}`}
				>
					Vlogs ({vlogs.length})
				</button>

				<div className="ml-auto flex items-center gap-2">
					<label className="text-xs text-gray-600">Sort</label>
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as "relevance" | "newest")}
						className="border rounded-md px-2 py-1 text-sm"
					>
						<option value="relevance">Relevance</option>
						<option value="newest">Newest</option>
					</select>
				</div>
			</div>

			{activeTab === "vlogs" ? (
				<div className="mb-6 flex items-center gap-2">
					<input
						id="youtubeOnly"
						type="checkbox"
						checked={youtubeOnly}
						onChange={(e) => {
							setYoutubeOnly(e.target.checked);
							setVisibleCount((prev) => ({ ...prev, vlogs: 9 }));
						}}
						className="h-4 w-4"
					/>
					<label htmlFor="youtubeOnly" className="text-sm text-gray-700">
						Video only (YouTube)
					</label>
				</div>
			) : null}

			{/* Error */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
					<p>{error}</p>
					<p className="text-sm mt-1">Try a different keyword or refresh the page.</p>
				</div>
			)}

			{/* Loading */}
			{loading && (
				<p className="text-gray-500 text-center py-8">
					Loading inspiring travel stories...
				</p>
			)}

			{/* No results */}
			{!loading && !error && displayedItems.length === 0 && (
				<p className="text-gray-500 text-center py-8">
					No matching travel content found for "{place}".<br />
					Try a broader term like "India", "Himalayas" or "Kerala".
				</p>
			)}

			{/* Content Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{visibleItems.map((post, index) => {
					const imgKey = `${post.link}-${index}`;
					const imageSrc = post.thumbnail || getRandomFallbackForKey(imgKey);

					return (
					<div
						key={imgKey}
						className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition flex flex-col h-full"
					>
						<img
							src={imageSrc}
							alt={post.title}
							className="h-48 w-full object-cover"
							onError={(e) => {
								handleImgError(imgKey, e);
							}}
						/>

						<div className="p-5 flex flex-col grow">
							<p className="text-xs text-gray-500 mb-2">
								{post.source} • {new Date(post.pubDate).toLocaleDateString()}
							</p>

							<h3 className="font-semibold text-lg mb-2 line-clamp-2">
								{post.title}
							</h3>

							<p className="text-sm text-gray-600 mb-4 line-clamp-3 grow">
								{post.description.replace(/<[^>]+>/g, "").trim()}
							</p>

							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="text-purple-700 font-medium hover:underline mt-auto inline-block"
							>
								{activeTab === "blogs" ? "Read Full Story" : "Watch Vlog"} →
							</a>
						</div>
					</div>
					);
				})}
			</div>

			{!loading && !error && hasMore ? (
				<div className="mt-8 flex justify-center">
					<button
						type="button"
						onClick={onLoadMore}
						className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
					>
						Load More {activeTab === "blogs" ? "Blogs" : "Vlogs"}
					</button>
				</div>
			) : null}

			<p className="text-center text-sm text-gray-500 mt-12">
				Powered by free public APIs (Reddit, YouTube search). Switch between Blogs and Vlogs after search.
			</p>
		</section>
	);
}
