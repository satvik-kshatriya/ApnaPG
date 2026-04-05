import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, LogOut, MapPin, SearchX, Ghost, IndianRupee, Users } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthSync } from "../lib/useAuthSync";
import { PropertyMap } from "../components/properties/PropertyMap";
import { PropertyCard } from "../components/properties/PropertyCard";
import { PropertyDetailModal } from "../components/properties/PropertyDetailModal";
import { ConnectionDetail } from "../components/connections/ConnectionDetail";
import { EmptyState } from "../components/ui/EmptyState";
import { PropertyCardSkeleton, ApplicationSkeleton, Skeleton } from "../components/ui/Skeleton";
import { AboutPage } from "./AboutPage";

export function TenantDashboard() {
  const queryClient = useQueryClient();
  useAuthSync();

  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  const [locality, setLocality] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false);

  const occupancyOptions = [
    { value: "", label: "Any occupancy" },
    { value: "single", label: "Single room" },
    { value: "double", label: "Double sharing" },
    { value: "triple", label: "Triple sharing" },
  ];

  const getQueryParams = () => {
    const params = new URLSearchParams();
    if (locality.trim()) params.append("locality", locality.trim());
    if (minRent) params.append("min_rent", minRent);
    if (maxRent) params.append("max_rent", maxRent);
    if (occupancy) params.append("occupancy_type", occupancy);
    return params.toString();
  };

  const { data: properties, isLoading: propsLoading, refetch } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const qs = getQueryParams();
      console.log(`📡 [FETCH] Properties with QS: [${qs}]`);
      const res = await api.get(`/api/properties${qs ? `?${qs}` : ''}`);
      return res.data;
    }
  });

  const handleSearch = () => {
    console.log("🔍 [CORE] Triggering Search Execution");
    refetch();
  };

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["my_connections"],
    queryFn: async () => {
      const res = await api.get("/api/connections/me");
      return res.data;
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/api/connections/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_connections"] });
    }
  });

  return (
    <div className="py-8 flex flex-col gap-8 flex-grow">

      <Routes>
        <Route path="/" element={<Navigate to="explore" replace />} />
        <Route path="/dashboard" element={<Navigate to="/tenant/explore" replace />} />

        {/* Explore View */}
        <Route path="/explore" element={
          <div className="flex flex-col animate-in fade-in duration-500 gap-8">
            {/* Map Section - Now scoped to Explore */}
            <div className="w-full h-[180px] lg:h-[220px] z-0 rounded-[2rem] overflow-hidden border border-zinc-200 shadow-sm relative group shrink-0">
              {!propsLoading && properties !== undefined ? (
                <PropertyMap properties={properties} onSelect={setSelectedProperty} />
              ) : <Skeleton className="w-full h-full rounded-none" />}

              {/* Map Hint */}
              <div className="absolute top-4 right-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-100 shadow-xl opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold uppercase tracking-widest text-zinc-500 z-10">
                Interactive Map
              </div>
            </div>

            {/* Premium Search Pill - Slimmer & Equalized Gaps */}
            <div className="w-full animate-in slide-in-from-top-4 duration-700 relative z-30">
              <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-2xl p-2 flex flex-col lg:flex-row items-stretch gap-2 lg:gap-0 ring-1 ring-zinc-200/50 hover:shadow-primary-500/5 transition-shadow">

                {/* Where Segment - Slimmer Height */}
                <div className="flex-[1.5] px-8 py-4 rounded-[2rem] hover:bg-slate-50/80 transition-all group relative cursor-text">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5 group-hover:text-primary-600 transition-colors">Where</div>
                  <div className="flex items-center gap-4">
                    <Search className="text-slate-500 group-hover:text-primary-500 transition-colors" size={24} />
                    <input 
                      type="text" 
                      placeholder="Search localities..." 
                      value={locality} 
                      onChange={(e) => setLocality(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full bg-transparent border-none p-0 text-lg font-black text-slate-800 focus:ring-0 focus:outline-none placeholder:text-slate-500 placeholder:font-bold"
                    />
                  </div>
                </div>

                <div className="hidden lg:block w-px bg-slate-100 my-4" />

                {/* Occupancy Segment - Custom Professional Dropdown */}
                <div className="flex-1 px-8 py-4 rounded-[2rem] hover:cursor-pointer hover:bg-slate-50/80 transition-all group relative min-w-[220px]">
                  <div className="text-[10px] hover:cursor-pointer font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5 group-hover:text-primary-600 transition-colors">Occupancy Type</div>

                  <div className="relative hover:cursor-pointer">
                    <button
                      onClick={() => setIsOccupancyOpen(!isOccupancyOpen)}
                      className="w-full hover:cursor-pointer flex items-center justify-between gap-3 text-base font-black text-slate-800 transition-all focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="text-slate-500 group-hover:text-primary-500 transition-colors" size={20} />
                        <span className="truncate">
                          {occupancyOptions.find(opt => opt.value === occupancy)?.label || "Any occupancy"}
                        </span>
                      </div>
                      <div className={`transition-transform duration-300 transform ${isOccupancyOpen ? 'rotate-180 text-primary-500' : 'text-slate-400'}`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>

                    {/* Custom Floating Menu */}
                    {isOccupancyOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40 bg-transparent hover:cursor-pointer"
                          onClick={() => setIsOccupancyOpen(false)}
                        />
                        <div className="absolute top-[calc(100%+1rem)] hover:cursor-pointer left-0 w-full min-w-[200px] z-50 bg-white/95 backdrop-blur-3xl border border-white/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-1.5 flex flex-col gap-0.5">
                            {occupancyOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setOccupancy(option.value);
                                  setIsOccupancyOpen(false);
                                }}
                                className={`flex items-center hover:cursor-pointer justify-between px-4 py-3 rounded-xl text-left text-sm font-bold transition-all group/item
                                  ${occupancy === option.value
                                    ? "bg-primary-50 text-primary-700 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                              >
                                {option.label}
                                {occupancy === option.value && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block w-px bg-slate-100 my-4" />

                {/* Budget Segment - Slimmer Height */}
                <div className="flex-[2] px-8 py-4 rounded-[2rem] hover:bg-slate-50/80 transition-all group relative min-w-[320px]">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5 group-hover:text-primary-600 transition-colors">Budget</div>
                  <div className="flex items-center gap-6">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-slate-500 font-extrabold text-[10px] uppercase">Min</span>
                      <input type="number" placeholder="0" value={minRent} onChange={(e) => setMinRent(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-lg font-black text-slate-800 focus:ring-0 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-slate-500 font-extrabold text-[10px] uppercase">Max</span>
                      <input 
                        type="number" 
                        placeholder="50k+" 
                        value={maxRent} 
                        onChange={(e) => setMaxRent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-transparent border-none p-0 text-lg font-black text-slate-800 focus:ring-0 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto lg:pl-3 flex items-center p-2 lg:p-0">
                  <button 
                    onClick={handleSearch}
                    className="w-full lg:min-w-[160px] bg-primary-600 hover:cursor-pointer hover:bg-primary-700 text-white py-5 px-10 lg:px-12 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-primary-500/20 active:scale-95 hover:scale-[1.02] transition-all group"
                  >
                    <Search size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Search</span>
                  </button>
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-12 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {/* Property Grid Section - Full Width */}
              <div className="w-full">
                {propsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <PropertyCardSkeleton key={i} />)}
                  </div>
                ) : properties?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((prop: any) => (
                      <PropertyCard
                        key={prop._id}
                        property={prop}
                        onSelect={setSelectedProperty}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={SearchX}
                    title="No properties found"
                    description="We couldn't find any listings matching your current filters. Try exploring different localities."
                    actionLabel="Clear Filters"
                    onAction={() => {
                      setLocality("");
                      setMinRent("");
                      setMaxRent("");
                      setOccupancy("");
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        } />

        <Route path="/handshakes" element={
          <div className="max-w-4xl mx-auto w-full flex-grow pb-16 animate-in fade-in duration-500">
            {appsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <ApplicationSkeleton key={i} />)}
              </div>
            ) : applications?.length > 0 ? (
              <div className="space-y-8">
                {applications.map((app: any) => (
                  <div key={app._id} className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm overflow-hidden text-zinc-900 group transition-all hover:shadow-xl hover:ring-1 hover:ring-indigo-500/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-50 pb-8 mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                          {app.property_id?.title || "Unknown Property"}
                        </h3>
                        <div className="flex items-center gap-4 mt-3">
                          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest flex items-center">
                            <MapPin size={14} className="mr-1.5 text-indigo-500" /> {app.property_id?.locality || "Unknown Locality"}
                          </p>
                          <div className="h-1 w-1 bg-zinc-300 rounded-full" />
                          {app.property_id?.monthly_rent && (
                            <>
                              <p className="text-zinc-900 font-black text-xs flex items-center">
                                <IndianRupee size={12} className="mr-0.5 text-indigo-600" />
                                {app.property_id.monthly_rent.toLocaleString('en-IN')}
                              </p>
                              <div className="h-1 w-1 bg-zinc-300 rounded-full" />
                            </>
                          )}
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Date N/A'}
                          </p>
                        </div>
                      </div>

                      {app.status === "active_tenancy" && (
                        <button
                          onClick={() => statusMutation.mutate({ id: app._id, status: "ended" })}
                          disabled={statusMutation.isPending}
                          className="flex-none flex justify-center items-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-400 bg-white hover:bg-zinc-50 hover:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                        ><LogOut size={16} /> End Tenancy</button>
                      )}
                    </div>
                    <ConnectionDetail connection={app} role="tenant" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Ghost}
                title="No applications yet"
                description="Start handshaking with property owners to find your perfect stay. Your connection requests will appear here."
                actionLabel="Explore Properties"
                onAction={() => window.location.href = "/tenant/explore"}
              />
            )}
          </div>
        } />

        <Route path="/about" element={<AboutPage />} />
      </Routes>

      {/* Expanded Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
