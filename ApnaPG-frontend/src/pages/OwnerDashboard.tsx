import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, List, Home, MapPin, IndianRupee, Inbox, Check, X, LogOut, Loader2, Edit2, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuthSync } from "../lib/useAuthSync";
import { PropertyForm } from "../components/properties/PropertyForm";
import { ConnectionDetail } from "../components/connections/ConnectionDetail";
import { StarRatingDisplay } from "../components/reviews/StarRatingDisplay";

function TenantRatingBadge({ tenantId }: { tenantId: string }) {
  const { data } = useQuery({
    queryKey: ["user_reviews", tenantId],
    queryFn: async () => {
      const res = await api.get(`/api/reviews/user/${tenantId}`);
      return res.data;
    },
    enabled: !!tenantId
  });

  if (!data) return <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>;

  return (
    <div className="mt-1">
      <StarRatingDisplay rating={data.average_rating} count={data.total_reviews} size={14} showText={true} />
    </div>
  );
}


export function OwnerDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"list" | "create" | "requests" | "edit">("list");
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  useAuthSync();

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["owner_properties"],
    queryFn: async () => {
      const res = await api.get("/api/properties");
      return res.data;
    },
    enabled: isLoaded && isSignedIn
  });

  const { data: requests, isLoading: reqsLoading } = useQuery({
    queryKey: ["my_connections"],
    queryFn: async () => {
      const res = await api.get("/api/connections/me");
      return res.data;
    },
    enabled: isLoaded && isSignedIn
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner_properties"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to delete listing.");
    }
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (prop: any) => {
    setEditingProperty(prop);
    setActiveTab("edit");
  };

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.firstName || "Owner"}!
          </h1>
          <p className="text-gray-500 mt-1">Manage your properties and incoming handshake requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "list" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <List size={16} /> My Properties
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "requests" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Inbox size={16} /> Incoming Requests 
          {requests?.filter((r: any) => r.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
              {requests.filter((r: any) => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "create" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Plus size={16} /> Create Listing
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {(activeTab === "create" || activeTab === "edit") && (
          <div className="max-w-4xl mx-auto">
            <PropertyForm 
              initialData={activeTab === "edit" ? editingProperty : null}
              onSuccess={() => setActiveTab("list")}
              onCancel={() => setActiveTab("list")}
            />
          </div>
        )}

        {activeTab === "list" && (
          <div className="space-y-6">
            {propsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop: any) => (
                  <div key={prop.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col group h-full">
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {prop.images && prop.images.length > 0 ? (
                        <img src={prop.images[0].image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Home size={32} /></div>}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">{prop.occupancy_type}</div>
                      
                      {/* Action Bar Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                         <button 
                            onClick={() => handleEdit(prop)}
                            className="bg-white p-2 rounded-full text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition shadow-lg"
                            title="Edit Listing"
                         >
                            <Edit2 size={18} />
                         </button>
                         <button 
                            onClick={() => handleDelete(prop.id, prop.title)}
                            disabled={deleteMutation.isPending}
                            className="bg-white p-2 rounded-full text-red-500 hover:bg-red-50 transition shadow-lg"
                            title="Delete Listing"
                         >
                            {deleteMutation.isPending && deleteMutation.variables === prop.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                         </button>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition">{prop.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm mt-2 mb-4"><MapPin size={14} className="mr-1" />{prop.locality}</div>
                      <div className="mt-auto pt-4 border-t border-gray-100 text-primary-700 font-bold text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <IndianRupee size={16} className="mr-0.5" />{prop.monthly_rent} <span className="text-sm font-normal text-gray-500 ml-1">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-500 max-w-sm mx-auto mb-4">No properties listed yet.</p>
                <button onClick={() => setActiveTab("create")} className="bg-primary-100 text-primary-700 px-6 py-2 rounded-lg font-semibold hover:bg-primary-200">Create Listing</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="max-w-4xl mx-auto space-y-6">
             {reqsLoading ? (
               <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
             ) : requests && requests.length > 0 ? (
               <div className="flex flex-col gap-5">
                 {requests.map((req: any) => (
                   <div key={req.id} className="bg-white border text-gray-900 border-gray-200 rounded-2xl p-6 shadow-sm">
                     <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                       <div>
                         <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                           Application from {req.tenant_name}
                         </h3>
                         
                         {/* Tenant Trust Rating displayed before Action! */}
                         <TenantRatingBadge tenantId={req.tenant_id} />
                         
                         <div className="mt-3">
                           <p className="text-gray-500 text-sm">Property: <span className="font-semibold text-gray-700">{req.property_title}</span> ({req.property_locality})</p>
                           <p className="text-xs text-gray-400 mt-0.5">Applied: {new Date(req.created_at).toLocaleDateString()}</p>
                         </div>
                       </div>
                       
                       {/* Decision Bounds / State Controller */}
                       {req.status === "pending" && (
                         <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 items-start">
                           <button 
                             onClick={() => statusMutation.mutate({ id: req.id, status: "rejected" })}
                             disabled={statusMutation.isPending}
                             className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition"
                           ><X size={16}/> Reject</button>
                           <button 
                             onClick={() => statusMutation.mutate({ id: req.id, status: "accepted" })}
                             disabled={statusMutation.isPending}
                             className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                           ><Check size={16}/> Accept</button>
                         </div>
                       )}

                       {(req.status === "accepted" || req.status === "active_tenancy") && (
                         <button 
                           onClick={() => statusMutation.mutate({ id: req.id, status: "ended" })}
                           disabled={statusMutation.isPending}
                           className="flex-none flex justify-center items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition mt-0"
                         ><LogOut size={16}/> End Tenancy</button>
                       )}
                     </div>

                     {/* Detail Reveal */}
                     {req.status !== "pending" && (
                       <ConnectionDetail connection={req} role="owner" />
                     )}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                 <p className="text-gray-500 mb-2">No incoming requests yet.</p>
                 <span className="text-sm opacity-70">Handshakes will appear here when tenants apply for your properties.</span>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
