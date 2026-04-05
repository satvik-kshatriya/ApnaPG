import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, UploadCloud, Loader2, ArrowLeft, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { LocationPicker } from "./LocationPicker";

type HouseRules = Record<string, string | boolean>;

interface PropertyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export function PropertyForm({ onSuccess, onCancel, initialData }: PropertyFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  // Basic Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [locality, setLocality] = useState(initialData?.locality || "");
  const [monthlyRent, setMonthlyRent] = useState(initialData?.monthly_rent?.toString() || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [occupancyType, setOccupancyType] = useState(initialData?.occupancy_type || "single");

  // Location State
  const [lat, setLat] = useState<number | null>(initialData?.location?.coordinates?.[1] || null);
  const [lng, setLng] = useState<number | null>(initialData?.location?.coordinates?.[0] || null);

  // House Rules Builder State
  const [houseRules, setHouseRules] = useState<HouseRules>(initialData?.house_rules || {});
  const [newRuleKey, setNewRuleKey] = useState("");
  const [newRuleValue, setNewRuleValue] = useState("");

  // Cloudinary Images State
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>(initialData?.images || []);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const addHouseRule = () => {
    if (!newRuleKey.trim() || !newRuleValue.trim()) return;
    setHouseRules((prev) => ({
      ...prev,
      [newRuleKey.trim().toLowerCase().replace(/\s+/g, "_")]: newRuleValue.trim(),
    }));
    setNewRuleKey("");
    setNewRuleValue("");
  };

  const removeHouseRule = (key: string) => {
    setHouseRules((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter(img => (img._id || img.url) !== id));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    const uploadedUrls: string[] = [];
    for (const file of newImages) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Image upload failed");
      }
      uploadedUrls.push(data.secure_url);
    }
    return uploadedUrls;
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit) {
        const res = await api.put(`/api/properties/${initialData._id}`, payload);
        return res.data;
      } else {
        const res = await api.post("/api/properties", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner_properties"] });
      toast.success(isEdit ? "Listing updated successfully!" : "Property published successfully!");
      onSuccess();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail?.[0]?.msg || 
                  err.response?.data?.detail || 
                  err.message || 
                  "An error occurred.";
      setErrorMsg(msg);
      toast.error(msg);
      setIsUploading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsUploading(true);

    try {
      if (lat === null || lng === null) {
        toast.error("Please pinpoint the exact location on the map.");
        setIsUploading(false);
        return;
      }

      const newUrls = await uploadImages();
      
      const allImages = [
        ...existingImages.map(img => ({
          url: img.url || img.image_url,
          is_cover: img.is_cover || false
        })),
        ...newUrls.map((url, idx) => ({
          url,
          is_cover: existingImages.length === 0 && idx === 0
        }))
      ];

      const payload = {
        title,
        description,
        locality,
        latitude: lat,
        longitude: lng,
        monthly_rent: Number(String(monthlyRent).replace(/,/g, "")) || 0,
        occupancy_type: occupancyType,
        house_rules: houseRules,
        images: allImages,
      };

      mutation.mutate(payload);
    } catch (err: any) {
      const msg = err.message || "Failed to process form.";
      setErrorMsg(msg);
      toast.error(msg);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-zinc-100 p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
            {isEdit ? "Edit Listing" : "List Property"}
          </h2>
          <p className="text-zinc-400 text-sm font-medium mt-1">Fill in the details to reach verified tenants.</p>
        </div>
        <button 
          type="button" 
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-900 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold border border-red-100 animate-in fade-in zoom-in duration-200">
          {errorMsg}
        </div>
      )}

      {/* Basic Details Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Property Title</label>
          <input 
            required 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Minimalist Studio near North Campus" 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Locality</label>
          <input 
            required 
            type="text" 
            value={locality} 
            onChange={(e) => setLocality(e.target.value)} 
            placeholder="e.g. Karol Bagh, New Delhi" 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
          />
        </div>

        {/* Interactive Map Picker Refined */}
        <div className="md:col-span-2 space-y-4">
          <label className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-[0.2em] inline-flex items-center gap-2">
             Location Precision
          </label>
          <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-inner">
            <LocationPicker 
              position={lat && lng ? [lat, lng] : null}
              onLocationSelect={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }} 
            />
          </div>
          <p className="text-[11px] text-zinc-400 font-medium italic pl-1">
            Search for neighborhood and click the map to drop a pin. High-precision locations build tenant trust.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Monthly Rent (₹)</label>
          <div className="relative">
             <input 
              required 
              type="text" 
              value={monthlyRent} 
              onChange={(e) => setMonthlyRent(e.target.value)} 
              placeholder="e.g. 12,500" 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
            />
            <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Occupancy Type</label>
          <select 
            value={occupancyType} 
            onChange={(e) => setOccupancyType(e.target.value)} 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="single">Single Room</option>
            <option value="double">Double Sharing</option>
            <option value="triple">Triple Sharing</option>
          </select>
        </div>
        
        <div className="md:col-span-2 space-y-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1">Property Description</label>
          <textarea 
            required 
            rows={5}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Showcase the best parts of your property, amenities, and connectivity..." 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300 leading-relaxed"
          />
        </div>
      </section>

      {/* House Rules Modern Builder */}
      <section className="space-y-6 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-[0.2em]">House Rules</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(houseRules).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 bg-white border border-zinc-200 pl-4 pr-2 py-2 rounded-xl text-xs font-bold shadow-sm animate-in fade-in zoom-in">
              <span className="text-zinc-400 uppercase text-[9px]">{key.replace(/_/g, " ")}:</span>
              <span className="text-zinc-900">{value}</span>
              <button type="button" onClick={() => removeHouseRule(key)} className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={14}/></button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input 
            type="text" 
            value={newRuleKey} 
            onChange={(e) => setNewRuleKey(e.target.value)} 
            placeholder="Rule e.g. Guest Policy" 
            className="sm:col-span-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
          />
          <input 
            type="text" 
            value={newRuleValue} 
            onChange={(e) => setNewRuleValue(e.target.value)} 
            placeholder="Value e.g. Not Allowed" 
            className="sm:col-span-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
          />
          <button type="button" onClick={addHouseRule} className="bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">Add</button>
        </div>
      </section>

      {/* Premium Photo Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-[0.2em]">Property Gallery</h3>
           <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Supports PNG, JPG, WEBP</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {existingImages.map((img) => (
            <div key={img._id || img.url} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 group shadow-sm transition-all hover:ring-4 hover:ring-indigo-500/10">
              <img src={img.url || img.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <button 
                type="button" 
                onClick={() => removeExistingImage(img._id || img.url)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
              ><X size={16}/></button>
            </div>
          ))}

          {newImages.map((file, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-200 bg-indigo-50 group shadow-md animate-in fade-in zoom-in">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-medium" />
              <button 
                type="button" 
                onClick={() => removeNewImage(idx)}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-xl text-red-500 shadow-lg"
              ><X size={16}/></button>
              <div className="absolute inset-x-2 bottom-2 bg-indigo-600 text-white text-[9px] py-1 rounded-lg text-center font-black uppercase tracking-widest shadow-lg">New Upload</div>
            </div>
          ))}

          <label className="relative aspect-square rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 hover:border-indigo-300 transition-all group">
            <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
               <UploadCloud size={32} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 group-hover:text-indigo-600 mt-3 uppercase tracking-widest">Add Media</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        </div>
      </section>

      {/* Premium Action Strip */}
      <div className="pt-10 border-t border-zinc-100 flex flex-col sm:flex-row justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending || isUploading}
          className="px-8 py-4 rounded-2xl font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={mutation.isPending || isUploading}
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-70"
        >
          {(mutation.isPending || isUploading) ? (
            <><Loader2 className="animate-spin h-5 w-5" /> Processing...</>
          ) : (
            isEdit ? "Update Listing" : "Publish Global"
          )}
        </button>
      </div>
    </form>
  );
}
