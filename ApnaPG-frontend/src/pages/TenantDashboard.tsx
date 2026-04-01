import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Navigation, Inbox, LogOut, MapPin } from "lucide-react";
import { api } from "../lib/api";
import { useAuthSync } from "../lib/useAuthSync";
import { PropertyMap } from "../components/properties/PropertyMap";
import { PropertyCard } from "../components/properties/PropertyCard";
import { ConnectionDetail } from "../components/connections/ConnectionDetail";
import { useUser } from "@clerk/clerk-react";

export function TenantDashboard() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  useAuthSync();

  const [activeTab, setActiveTab] = useState<"explore" | "applications">("explore");
  
  const [locality, setLocality] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");

  const getQueryParams = () => {
    const params = new URLSearchParams();
    if (locality.trim()) params.append("locality", locality.trim());
    if (minRent) params.append("min_rent", minRent);
    if (maxRent) params.append("max_rent", maxRent);
    if (occupancy) params.append("occupancy_type", occupancy);
    return params.toString();
  };

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["properties", locality, occupancy, minRent, maxRent],
    queryFn: async () => {
      const qs = getQueryParams();
      const res = await api.get(`/api/properties${qs ? `?${qs}` : ''}`);
      return res.data;
    },
    enabled: activeTab === "explore"
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["my_connections"],
    queryFn: async () => {
      const res = await api.get("/api/connections/me");
      return res.data;
    },
    enabled: activeTab === "applications"
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // NOTE: backend natively asserts owners end tenancy. However if tenant wants to cancel pending request we can delete or reject it.
      // If backend throws 403 for Tenant trying to terminate, this will catch and fail securely without crashing UI.
      const res = await api.patch(`/api/connections/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_connections"] });
    }
  });

  return (
    <div className="py-6 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Dynamic Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 shrink-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
               {activeTab === "explore" ? "Find Your Perfect PG" : "My Applications"}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.firstName}! Zero brokers, transparent reviews.</p>
          </div>

          <div className="bg-gray-100 p-1 rounded-lg flex items-center shrink-0">
             <button 
               onClick={() => setActiveTab("explore")}
               className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition ${activeTab==='explore' ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
             ><Navigation size={16}/> Explore</button>
             <button 
               onClick={() => setActiveTab("applications")}
               className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition ${activeTab==='applications' ? "bg-white text-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
             ><Inbox size={16}/> Applications</button>
          </div>
        </div>

        {activeTab === "explore" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search locality..." value={locality} onChange={(e) => setLocality(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
              />
            </div>
            <select value={occupancy} onChange={(e) => setOccupancy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
            >
              <option value="">Any Occupancy</option>
              <option value="single">Single Room</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
            </select>
            <input type="number" placeholder="Min Rent (₹)" value={minRent} onChange={(e) => setMinRent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
            />
            <input type="number" placeholder="Max Rent (₹)" value={maxRent} onChange={(e) => setMaxRent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 hover:bg-white transition"
            />
          </div>
        )}
      </div>

      {/* Main View Area */}
      {activeTab === "explore" ? (
        <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
          <div className="w-full lg:w-3/5 overflow-y-auto pr-1 pb-10 hide-scrollbar" style={{ height: "100%" }}>
            {propsLoading ? (
              <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-primary-500 h-10 w-10" /></div>
            ) : properties?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {properties.map((prop: any) => <PropertyCard key={prop.id} property={prop} />)}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 p-12 rounded-2xl text-center">
                <p className="text-gray-500 font-medium">No properties match your exact filters.</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-2/5 h-[400px] lg:h-full z-0">
             {!propsLoading && properties !== undefined ? (
               <PropertyMap properties={properties} />
             ) : <div className="w-full h-full bg-gray-100 rounded-xl animate-pulse border border-gray-200"></div>}
          </div>
        </div>
      ) : (
        /* Applications Feed */
        <div className="max-w-4xl mx-auto w-full flex-grow overflow-y-auto pb-10 hide-scrollbar">
          {appsLoading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-primary-500 h-10 w-10" /></div>
          ) : applications?.length > 0 ? (
            <div className="space-y-6">
              {applications.map((app: any) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden text-gray-900">
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                     <div>
                       <h3 className="text-xl font-bold flex items-center gap-2">
                         {app.property_title}
                       </h3>
                       <p className="text-gray-500 font-medium flex items-center mt-1"><MapPin size={14} className="mr-1"/> {app.property_locality}</p>
                       <p className="text-sm text-gray-400 mt-1">Application Sent: {new Date(app.created_at).toLocaleDateString()}</p>
                     </div>
                     
                     {/* Tenant Actions (Pending Cancellation / Tenancy Ending if supported by backend else visually disabled) */}
                     {app.status === "active_tenancy" && (
                         <button 
                           onClick={() => statusMutation.mutate({ id: app.id, status: "ended" })}
                           disabled={statusMutation.isPending}
                           className="flex-none flex justify-center items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
                         ><LogOut size={16}/> End Tenancy</button>
                     )}
                   </div>

                   {/* Render Connection Detail UI (Masks inside component depending on status) */}
                   <ConnectionDetail connection={app} role="tenant" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-gray-200 p-12 rounded-2xl text-center">
              <Inbox className="h-10 w-10 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-bold text-gray-900 mb-2">No applications yet</p>
              <p className="text-gray-500 font-medium">Head back to Explore to handshake with property owners.</p>
              <button 
                onClick={() => setActiveTab("explore")}
                className="mt-6 bg-primary-100 text-primary-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-200 transition"
              >
                Browse Properties
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
