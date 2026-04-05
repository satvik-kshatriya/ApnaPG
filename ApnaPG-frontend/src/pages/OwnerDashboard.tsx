import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, MapPin, IndianRupee, Inbox, LogOut, Loader2, Edit2, Trash2, HomeIcon, ShieldCheck, Briefcase, User2, Globe } from "lucide-react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuthSync } from "../lib/useAuthSync";
import { PropertyForm } from "../components/properties/PropertyForm";
import { ConnectionDetail } from "../components/connections/ConnectionDetail";
import { StarRatingDisplay } from "../components/reviews/StarRatingDisplay";
import { EmptyState } from "../components/ui/EmptyState";
import { PropertyCardSkeleton, ApplicationSkeleton, Skeleton } from "../components/ui/Skeleton";
import { AboutPage } from "./AboutPage";

function TenantRatingBadge({ tenantId }: { tenantId: string }) {
  const { data } = useQuery({
    queryKey: ["user_reviews", tenantId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${tenantId}`);
      return res.data;
    },
    enabled: !!tenantId
  });

  if (!data) return <Skeleton className="h-4 w-24 rounded-full mt-2" />;

  return (
    <div className="mt-2 text-zinc-900">
      <StarRatingDisplay rating={data.average_rating} count={data.total_reviews} size={14} showText={true} />
    </div>
  );
}

export function OwnerDashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  useAuthSync();

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["owner_properties"],
    queryFn: async () => {
      const res = await api.get("/api/properties/owner");
      return res.data;
    },
    enabled: isLoaded && isSignedIn
  });

  const { data: requests, isLoading: reqsLoading } = useQuery({
    queryKey: ["owner_connections"],
    queryFn: async () => {
      const res = await api.get("/api/connections/owner");
      return res.data;
    },
    enabled: isLoaded && isSignedIn
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/api/connections/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["owner_connections"] });
      toast.success(`Handshake ${variables.status} successfully.`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner_properties"] });
      toast.success("Listing removed from market.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to delete listing.");
    }
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action is permanent.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="py-8 flex flex-col gap-8 flex-grow">
      <Routes>
        <Route path="/" element={<Navigate to="properties" replace />} />
        <Route path="/dashboard" element={<Navigate to="/owner/properties" replace />} />

        {/* List View */}
        <Route path="/properties" element={
          <div className="animate-in fade-in duration-500 flex flex-col">
              {/* Glossy Stats Header - Replacing the old Hello Box */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-10">
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 ring-1 ring-zinc-200/20">
                  <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                      Owner <span className="text-primary-600">Command</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-1.5">Platform Hub</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center sm:justify-end items-center gap-6 lg:gap-12">
                    <div className="flex flex-col items-center sm:items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Listings</span>
                      <span className="text-2xl font-black text-slate-900">{properties?.length || 0}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                    <div className="flex flex-col items-center sm:items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inbox</span>
                      <span className="text-2xl font-black text-primary-600">{requests?.filter((r: any) => r.status === 'pending').length || 0}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                    <div className="flex flex-col items-center sm:items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active</span>
                      <span className="text-2xl font-black text-emerald-600">{requests?.filter((r: any) => r.status === 'active_tenancy').length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

            {propsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[1,2,3].map(i => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
                {properties.map((prop: any) => (
                  <div key={prop._id} className="relative group bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col ring-1 ring-zinc-200/50">
                    <div className="h-64 bg-slate-50 relative overflow-hidden">
                      {prop.images && prop.images.length > 0 ? (
                        <img src={prop.images[0].url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 ease-out" />
                      ) : <div className="w-full h-full flex items-center justify-center text-slate-200"><Home size={48} /></div>}
                      
                      <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl border border-white/20 z-10">
                        {prop.occupancy_type}
                      </div>
                      
                      {/* Floating Professional Actions */}
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-end gap-3 z-20">
                         <button 
                            onClick={() => navigate(`/owner/edit/${prop._id}`)}
                            className="bg-white/95 backdrop-blur-md p-4 rounded-[1.25rem] text-slate-900 hover:text-primary-600 hover:scale-110 active:scale-90 transition-all shadow-xl"
                            title="Edit Listing"
                         >
                            <Edit2 size={18} strokeWidth={2.5} />
                         </button>
                         <button 
                            onClick={() => handleDelete(prop._id, prop.title)}
                            disabled={deleteMutation.isPending}
                            className="bg-white/95 backdrop-blur-md p-4 rounded-[1.25rem] text-red-500 hover:scale-110 active:scale-90 transition-all shadow-xl"
                            title="Remove Listing"
                         >
                            {deleteMutation.isPending && deleteMutation.variables === prop._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} strokeWidth={2.5} />}
                         </button>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-xl text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 tracking-tight">{prop.title}</h3>
                      </div>
                      <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 mb-8">
                        <MapPin size={12} className="mr-2 text-primary-500" />{prop.locality}
                      </div>
                      
                      <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 pl-0.5">Rent</span>
                          <div className="text-2xl font-black text-slate-900 flex items-center leading-none">
                            <IndianRupee size={20} className="mr-0.5 text-primary-600" strokeWidth={3} />
                            {prop.monthly_rent?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 ring-1 ring-slate-200/50">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={HomeIcon}
                title="No properties listed"
                description="List your first property to start receiving handshakes from verified tenants."
                actionLabel="Create Listing Now"
                onAction={() => navigate("/owner/create")}
              />
            )}
          </div>
        } />

        {/* Requests View */}
        <Route path="/requests" element={
          <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-500 w-full px-4 sm:px-0">
             {reqsLoading ? (
               <div className="space-y-6">
                 {[1,2].map(i => <ApplicationSkeleton key={i} />)}
               </div>
             ) : requests && requests.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {requests.map((req: any) => (
                    <div key={req._id} className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-sm transition-all hover:shadow-2xl ring-1 ring-zinc-200/20 mb-4 group/card">
                      <div className="flex flex-col xl:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-10 mb-8">
                        
                        {/* Tenant Identity Segment */}
                        <div className="flex-1 flex gap-6 items-start">
                          <div className="w-20 h-20 rounded-[1.75rem] bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 relative shadow-inner">
                             {req.tenant_id?.profile_image_url ? (
                                <img src={req.tenant_id.profile_image_url} alt="" className="w-full h-full object-cover" />
                             ) : <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-3xl uppercase bg-gradient-to-br from-slate-50 to-slate-100">
                                {req.tenant_id?.full_name?.charAt(0) || "T"}
                             </div>}
                             {req.tenant_id?.verified && (
                               <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-xl border border-primary-50">
                                 <ShieldCheck size={18} className="text-primary-600 fill-primary-50" />
                               </div>
                             )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2.5">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100/50' : req.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'bg-slate-100 text-slate-500'}`}>
                                {req.status?.replace("_", " ") || "Processing"}
                              </span>
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB') : 'Date N/A'}</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2 group-hover/card:text-primary-700 transition-colors">
                              {req.tenant_id?.full_name || "Anonymous Tenant"}
                              {req.tenant_id?.verified && <ShieldCheck size={20} className="text-primary-500" strokeWidth={3} />}
                            </h3>

                            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 mt-4">
                               {req.tenant_id?.occupation && (
                                 <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                                   <Briefcase size={12} className="text-primary-500" /> {req.tenant_id.occupation}
                                 </div>
                               )}
                               {req.tenant_id?.gender && (
                                 <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                                   <User2 size={12} className="text-primary-500" /> {req.tenant_id.gender}
                                 </div>
                               )}
                               {req.tenant_id?.hometown && (
                                 <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100">
                                   <Globe size={12} className="text-primary-500" /> {req.tenant_id.hometown}
                                 </div>
                               )}
                               <div className="bg-slate-50/80 px-3 py-1 rounded-xl border border-slate-100">
                                  <TenantRatingBadge tenantId={req.tenant_id?._id} />
                               </div>
                            </div>

                            {req.tenant_id?.bio && (
                               <p className="mt-6 text-sm text-slate-500 leading-relaxed font-medium italic max-w-xl line-clamp-2 border-l-2 border-slate-100 pl-4">
                                 "{req.tenant_id.bio}"
                               </p>
                            )}
                          </div>
                        </div>
                        
                        {/* CRM Action Block */}
                        <div className="flex flex-row xl:flex-col gap-3 w-full xl:w-48 mt-4 xl:mt-0">
                          {req.status === "pending" && (
                            <>
                              <button 
                                onClick={() => statusMutation.mutate({ id: req._id, status: "accepted" })}
                                disabled={statusMutation.isPending}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-2xl shadow-slate-900/10"
                              >Approve</button>
                              <button 
                                onClick={() => statusMutation.mutate({ id: req._id, status: "rejected" })}
                                disabled={statusMutation.isPending}
                                className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                              >Decline</button>
                            </>
                          )}
                          
                          {(req.status === "accepted" || req.status === "active_tenancy") && (
                            <button 
                              onClick={() => statusMutation.mutate({ id: req._id, status: "ended" })}
                              disabled={statusMutation.isPending}
                              className="w-full px-6 py-4 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                            ><LogOut size={16} className="inline mr-2"/> End Tenancy</button>
                          )}
                        </div>
                      </div>

                      {/* Property Reference Segment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white/40 rounded-3xl p-6 border border-white/60 shadow-sm relative overflow-hidden group/prop">
                         <div className="flex gap-5 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-100 text-primary-600 shadow-sm group-hover/prop:rotate-12 transition-transform">
                              <HomeIcon size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Applying For</p>
                              <h4 className="font-black text-slate-900 text-base leading-tight tracking-tight">{req.property_id?.title || "Unknown Property"}</h4>
                              <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                                <MapPin size={12} className="mr-1.5 text-primary-500" />{req.property_id?.locality}
                              </div>
                            </div>
                         </div>
                         
                         <div className="flex items-center md:justify-end gap-10">
                            <div className="flex flex-col md:items-end">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Monthly Rent</p>
                              <div className="text-2xl font-black text-slate-900 flex items-center tracking-tighter">
                                <IndianRupee size={22} className="mr-0.5 text-primary-600" strokeWidth={3} />
                                {req.property_id?.monthly_rent?.toLocaleString('en-IN')}
                              </div>
                            </div>
                         </div>

                         {/* Subtle Background Accent */}
                         <div className="absolute right-0 top-0 w-32 h-full bg-slate-50/30 blur-3xl rounded-full" />
                      </div>

                      <ConnectionDetail connection={req} role="owner" />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Inbox}
                  title="No handshakes yet"
                  description="When tenants apply for your listings, their connection requests will appear here for your review."
                  actionLabel="View My Listings"
                  onAction={() => navigate("/owner/properties")}
                />
              )}
            </div>
        } />

        {/* Create View */}
        <Route path="/create" element={
          <div className="max-w-4xl mx-auto pb-16 animate-in slide-in-from-bottom-4 duration-500">
            <PropertyForm 
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["owner_properties"] });
                navigate("/owner/properties");
              }}
              onCancel={() => navigate("/owner/properties")}
            />
          </div>
        } />

        {/* Edit View */}
        <Route path="/edit/:id" element={<EditView navigate={navigate} />} />

        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

function EditView({ navigate }: { navigate: any }) {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const res = await api.get(`/api/properties/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in slide-in-from-bottom-4 duration-500">
      <PropertyForm 
        initialData={property} 
        onSuccess={() => {
           queryClient.invalidateQueries({ queryKey: ["owner_properties"] });
           navigate("/owner/properties");
        }} 
        onCancel={() => navigate("/owner/properties")}
      />
    </div>
  );
}
