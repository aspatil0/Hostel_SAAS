import { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Globe,
  Sparkles,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Copy,
  Building2,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Button,
  Modal,
  FormField,
  Input,
  Select,
} from '@/components/ui';
import { initialMarketingPosts, initialProperties } from '@/data/mockData';
import { propertyService } from '@/services/propertyService';
import type { Property, MarketingPost } from '@/types/property';
import { apiClient } from '@/services/apiClient';

export function MarketingPage() {
  const [posts, setPosts] = useState<MarketingPost[]>(initialMarketingPosts);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [landingFilter, setLandingFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Fetch live marketing posts and properties from backend API / local store on mount
  useEffect(() => {
    let isMounted = true;
    const loadMarketingData = async () => {
      try {
        const [livePosts, liveProps] = await Promise.all([
          apiClient.get<MarketingPost[]>('/marketing').catch(() => null),
          propertyService.getProperties().catch(() => initialProperties),
        ]);

        if (isMounted) {
          if (liveProps && liveProps.length > 0) {
            setProperties(liveProps);
          }

          let storedCustomPosts: MarketingPost[] = [];
          try {
            const raw = localStorage.getItem('hostelos_custom_marketing_posts');
            if (raw) storedCustomPosts = JSON.parse(raw);
          } catch {
            // ignore
          }

          const base = Array.isArray(livePosts) && livePosts.length > 0 ? livePosts : initialMarketingPosts;

          const postMap = new Map<string, MarketingPost>();
          for (const p of storedCustomPosts) {
            postMap.set(p.id, p);
          }
          for (const p of base) {
            if (!postMap.has(p.id)) {
              postMap.set(p.id, p);
            }
          }

          setPosts(Array.from(postMap.values()));
        }
      } catch (err) {
        console.warn('Could not load marketing data:', err);
      }
    };

    loadMarketingData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Form State for New Campaign
  const [formData, setFormData] = useState({
    propertyId: initialProperties[0]?.id || '',
    headline: '✨ Verified Student Living — Booking Now Open for Academic Year!',
    description:
      'Spacious AC and non-AC rooms, daily healthy food, 24/7 security guard, biometric attendance, and high-speed fiber internet. 5 mins from college campuses.',
    startingPrice: 9000,
    whatsapp: '+91 98201 12345',
    instagram: 'https://instagram.com/hostelos_stays',
    facebook: 'https://facebook.com/hostelos',
    isLiveOnLandingPage: true,
  });

  // Toggle Live on Landing Page status
  const handleToggleLandingPage = async (id: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, isLiveOnLandingPage: !post.isLiveOnLandingPage }
          : post
      )
    );

    const numericId = parseInt(id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await apiClient.patch(`/marketing/${numericId}/toggle-landing`);
      } catch {
        // Handled gracefully
      }
    }
  };

  // Interactive Live Like Counter
  const handleLikePost = async (id: string) => {
    const isCurrentlyLiked = likedPosts[id];
    setLikedPosts((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, likes: isCurrentlyLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );

    const numericId = parseInt(id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await apiClient.post(`/marketing/${numericId}/like`, {
          increment: !isCurrentlyLiked,
        });
      } catch {
        // Handled gracefully
      }
    }
  };

  // Copy shareable link and increment inquiry
  const handleCopyLink = async (post: MarketingPost) => {
    const shareText = `Check out ${post.propertyName} on HostelOS! ${post.headline} - Starting at ₹${post.startingPrice.toLocaleString()}/mo. Located in ${post.city}.`;
    navigator.clipboard.writeText(shareText);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);

    const numericId = parseInt(post.id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await apiClient.post(`/marketing/${numericId}/inquiry`);
      } catch {
        // Handled gracefully
      }
    }
  };

  // Pre-fill when choosing property in modal
  const handlePropertySelect = (propertyId: string) => {
    const selected = properties.find((p) => p.id === propertyId);
    if (!selected) return;
    setFormData((prev) => ({
      ...prev,
      propertyId: selected.id,
      headline: `✨ Premium Student Living at ${selected.name} — Admissions Open!`,
      description: `Verified campus hostel in ${selected.city} with full amenities, 24/7 CCTV security, high-speed WiFi, and study spaces. Located at ${selected.address}.`,
    }));
  };

  // Submit New Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProp = properties.find((p) => p.id === formData.propertyId) || properties[0] || initialProperties[0];

    const newPost: MarketingPost = {
      id: `MKT-${Date.now().toString().slice(-4)}`,
      propertyId: selectedProp.id,
      propertyName: selectedProp.name,
      city: selectedProp.city,
      address: selectedProp.address,
      image: selectedProp.image,
      headline: formData.headline,
      description: formData.description,
      startingPrice: Number(formData.startingPrice) || 8500,
      likes: 0,
      views: 1,
      inquiries: 0,
      isLiveOnLandingPage: formData.isLiveOnLandingPage,
      socialLinks: {
        whatsapp: formData.whatsapp
          ? `https://wa.me/${formData.whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20inquiring%20about%20${encodeURIComponent(selectedProp.name)}`
          : undefined,
        instagram: formData.instagram,
        facebook: formData.facebook,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Save to local storage for persistence across navigations
    try {
      const raw = localStorage.getItem('hostelos_custom_marketing_posts');
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem('hostelos_custom_marketing_posts', JSON.stringify([newPost, ...current]));
    } catch {
      // ignore
    }

    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);

    try {
      const propIdNumber = parseInt(selectedProp.id.replace(/\D/g, ''), 10) || 1;
      await apiClient.post('/marketing', {
        propertyId: propIdNumber,
        propertyName: selectedProp.name,
        city: selectedProp.city,
        address: selectedProp.address,
        image: selectedProp.image,
        headline: formData.headline,
        description: formData.description,
        startingPrice: Number(formData.startingPrice) || 8500,
        isLiveOnLandingPage: formData.isLiveOnLandingPage,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        facebook: formData.facebook,
      });
    } catch {
      // Handled gracefully
    }
  };

  // Filtering
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.headline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = cityFilter === 'all' || post.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesLanding =
      landingFilter === 'all'
        ? true
        : landingFilter === 'live'
        ? post.isLiveOnLandingPage
        : !post.isLiveOnLandingPage;

    return matchesSearch && matchesCity && matchesLanding;
  });

  // Aggregate Metrics
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalInquiries = posts.reduce((sum, p) => sum + p.inquiries, 0);
  const liveOnLandingCount = posts.filter((p) => p.isLiveOnLandingPage).length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B45] dark:text-white flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Marketing & Auto-Ad Campaigns
          </h1>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
            Automatically promote registered PGs & hostels, monitor student likes/views, and broadcast to the public landing page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Landing Page Preview
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              if (
                properties.length > 0 &&
                (!formData.propertyId || !properties.some((p) => p.id === formData.propertyId))
              ) {
                handlePropertySelect(properties[0].id);
              }
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Ad Campaign
          </Button>
        </div>
      </div>

      {/* 2. KPI Telemetry Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span>Total Ad Campaigns</span>
            <Megaphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#172B45] dark:text-white">
            {posts.length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Registered Hostels Marketed
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span>Total Impressions</span>
            <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {totalViews.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Student & Parent Page Views
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span>Student Likes</span>
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {totalLikes.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time Post Reactions
          </span>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span>Live on Landing Page</span>
            <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {liveOnLandingCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Featured on Public Portal
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaign, hostel, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50/60 py-2 pl-9 pr-4 text-xs text-[#172B45] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-[#1F2E45] dark:bg-[#0E1522] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* City filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white py-1.5 px-3 text-xs text-[#172B45] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-[#1F2E45] dark:bg-[#0E1522] dark:text-white"
          >
            <option value="all">All Cities</option>
            {Array.from(new Set(properties.map((p) => p.city).filter(Boolean))).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Landing page status filter */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-[#0E1522]">
            {(['all', 'live', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLandingFilter(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                  landingFilter === tab
                    ? 'bg-white text-[#172B45] shadow-xs dark:bg-[#1A2536] dark:text-white'
                    : 'text-[#64748B] hover:text-[#172B45] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Ads' : tab === 'live' ? 'Live on Web' : 'Drafts'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Marketing Ad Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts[post.id];

          return (
            <div
              key={post.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all hover:shadow-md dark:border-[#1F2E45] dark:bg-[#121824]"
            >
              <div>
                {/* Image Banner Showcase */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={post.image}
                    alt={post.propertyName}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* Top-left: Location Pill */}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-indigo-400" /> {post.city}
                    </span>
                  </div>

                  {/* Top-right: Starting Rent Badge */}
                  <div className="absolute right-3 top-3">
                    <span className="rounded-lg bg-emerald-600/90 px-2.5 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs">
                      ₹{post.startingPrice.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* Bottom: Property Title Over Banner */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                      Verified Hostel Advertisement
                    </span>
                    <h3 className="text-base font-bold truncate drop-shadow-sm">
                      {post.propertyName}
                    </h3>
                    <p className="text-[11px] text-slate-200 truncate mt-0.5">
                      {post.address}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 pb-4 space-y-3">
                  {/* Headline */}
                  <h4 className="text-xs font-bold text-[#172B45] leading-snug dark:text-white line-clamp-2">
                    {post.headline}
                  </h4>

                  {/* Description Copy */}
                  <p className="text-[11px] text-[#64748B] leading-relaxed dark:text-slate-400 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Public Landing Page Toggle Switch */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between dark:border-slate-800 dark:bg-[#0E1522]">
                    <div className="flex items-center gap-2">
                      <Globe className={`h-4 w-4 ${post.isLiveOnLandingPage ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-[11px] font-bold text-[#172B45] dark:text-white">
                          Public Landing Showcase
                        </p>
                        <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                          {post.isLiveOnLandingPage ? 'Live on student portal' : 'Hidden from web'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleLandingPage(post.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        post.isLiveOnLandingPage ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          post.isLiveOnLandingPage ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Live Engagement Counters Bar */}
                  <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#1F2E45] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        isLiked
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'text-[#64748B] hover:bg-slate-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                      title="Like this post"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-[#64748B] dark:text-slate-400 text-xs">
                      <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{post.views} views</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#64748B] dark:text-slate-400 text-xs">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{post.inquiries} leads</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Social Share Shortcuts */}
              <div className="border-t border-[#E2E8F0] bg-slate-50/70 p-3 flex items-center justify-between dark:border-[#1F2E45] dark:bg-[#0E1522]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] dark:text-slate-400">
                  Broadcast
                </span>

                <div className="flex items-center gap-1.5">
                  {/* WhatsApp */}
                  {post.socialLinks.whatsapp && (
                    <a
                      href={post.socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Share to WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}

                  {/* External Profile */}
                  {post.socialLinks.instagram && (
                    <a
                      href={post.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Share to Instagram"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(post)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#172B45] hover:bg-slate-200/80 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                    title="Copy ad post share text"
                  >
                    {copiedId === post.id ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Create Ad Campaign Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New Property Ad Campaign"
        description="Craft an advertisement for a registered hostel/PG to showcase on the landing page and social media."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCampaign}>
              Publish Campaign
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <FormField label="Select Registered Property" required>
            <Select
              value={formData.propertyId}
              onChange={(e) => handlePropertySelect(e.target.value)}
              options={properties.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.city})`,
              }))}
            />
          </FormField>

          {/* Selected Property Preview Banner */}
          {(() => {
            const currentProp = properties.find((p) => p.id === formData.propertyId);
            if (!currentProp) return null;
            return (
              <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <img
                  src={currentProp.image}
                  alt={currentProp.name}
                  className="h-12 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#172B45] dark:text-white truncate">
                    {currentProp.name}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" /> {currentProp.address}, {currentProp.city}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {currentProp.totalRooms} Rooms • {currentProp.totalBeds} Beds Capacity
                  </p>
                </div>
              </div>
            );
          })()}

          <FormField label="Catchy Ad Headline" required>
            <Input
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Marketing Description (Shown to students & parents)" required>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#172B45] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-[#1F2E45] dark:bg-[#0E1522] dark:text-white"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Starting Monthly Rent (₹)" required>
              <Input
                type="number"
                min="1000"
                step="500"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                required
              />
            </FormField>

            <FormField label="Inquiry WhatsApp Number">
              <Input
                placeholder="+91 98201 12345"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </FormField>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 flex items-center justify-between dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div>
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Auto-Publish to Public Landing Page
              </p>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300">
                Make this ad immediately visible to prospective students on the homepage.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.isLiveOnLandingPage}
              onChange={(e) => setFormData({ ...formData, isLiveOnLandingPage: e.target.checked })}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </form>
      </Modal>

      {/* 6. Public Landing Page Showcase Preview Modal */}
      {isPreviewModalOpen && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Student Public Discovery Portal — Live Showcase Preview"
          description="This is how prospective students and parents view verified hostels on the public web landing page."
          size="xl"
          footer={
            <Button variant="primary" onClick={() => setIsPreviewModalOpen(false)}>
              Close Preview
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-[#0D1F36] to-[#142D4E] p-6 text-white">
              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                HOSTELOS STUDENT PORTAL
              </span>
              <h2 className="text-xl font-black mt-1">
                Explore Verified Hostels & Student PGs
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Zero brokerage, 100% verified campus dorms, 3-tier safety, and instant online room reservations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts
                .filter((p) => p.isLiveOnLandingPage)
                .map((post) => (
                  <div
                    key={post.id}
                    className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xs dark:border-[#1F2E45] dark:bg-[#121824]"
                  >
                    <div className="relative h-36 w-full">
                      <img src={post.image} alt={post.propertyName} className="h-full w-full object-cover" />
                      <div className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        ₹{post.startingPrice.toLocaleString()}/mo
                      </div>
                      <div className="absolute left-2 bottom-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {post.city}
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h4 className="text-xs font-bold text-[#172B45] dark:text-white truncate">
                        {post.propertyName}
                      </h4>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 line-clamp-1">
                        {post.headline}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span className="flex items-center gap-1 text-rose-500 font-semibold">
                          <Heart className="h-3 w-3 fill-rose-500" /> {post.likes}
                        </span>
                        <a
                          href={post.socialLinks.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Book Bed Now →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
