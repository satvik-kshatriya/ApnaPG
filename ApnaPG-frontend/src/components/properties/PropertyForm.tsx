import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, UploadCloud, Loader2, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api";

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

  // House Rules Builder State
  const [houseRules, setHouseRules] = useState<HouseRules>(initialData?.house_rules || {});
  const [newRuleKey, setNewRuleKey] = useState("");
  const [newRuleValue, setNewRuleValue] = useState("");

  // Cloudinary Images State
  // Note: For simplicity in MVP, we track new files specifically. 
  // Existing images are handled by the backend unless we add a complex image manager here.
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
    setExistingImages((prev) => prev.filter(img => img.id !== id));
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
        const res = await api.put(`/api/properties/${initialData.id}`, payload);
        return res.data;
      } else {
        const res = await api.post("/api/properties", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner_properties"] });
      onSuccess();
    },
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.detail?.[0]?.msg || 
        err.response?.data?.detail || 
        err.message || 
        "An error occurred."
      );
      setIsUploading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsUploading(true);

    try {
      const newUrls = await uploadImages();
      
      // Combine existing and new images
      // Backend expects image_urls for Create, but for Edit we might need a different structure 
      // if we want to retain order. For Phase 2, we'll just send all active URLs.
      const allUrls = [
        ...existingImages.map(img => img.image_url),
        ...newUrls
      ];

      const latJitter = (Math.random() - 0.5) * 0.05;
      const lngJitter = (Math.random() - 0.5) * 0.05;

      const payload = {
        title,
        description,
        locality,
        latitude: initialData?.latitude || (28.6139 + latJitter),
        longitude: initialData?.longitude || (77.2090 + lngJitter),
        monthly_rent: Number(monthlyRent),
        occupancy_type: occupancyType,
        house_rules: houseRules,
        image_urls: allUrls,
      };

      mutation.mutate(payload);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process form.");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Listing" : "List a New Property"}
        </h2>
        <button 
          type="button" 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Basic Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Property Title</label>
          <input 
            required 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Sunny Room near Campus" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Locality</label>
          <input 
            required 
            type="text" 
            value={locality} 
            onChange={(e) => setLocality(e.target.value)} 
            placeholder="e.g. Karol Bagh, New Delhi" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Monthly Rent (₹)</label>
          <input 
            required 
            type="number" 
            min="0"
            value={monthlyRent} 
            onChange={(e) => setMonthlyRent(e.target.value)} 
            placeholder="e.g. 8500" 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Occupancy Type</label>
          <select 
            value={occupancyType} 
            onChange={(e) => setOccupancyType(e.target.value)} 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </select>
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea 
            required 
            rows={4}
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Describe the property, amenities..." 
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </section>

      {/* House Rules */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">House Rules</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(houseRules).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
              <span className="font-medium text-gray-700">{key.replace(/_/g, " ")}:</span>
              <span className="text-gray-600">{value}</span>
              <button type="button" onClick={() => removeHouseRule(key)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            value={newRuleKey} 
            onChange={(e) => setNewRuleKey(e.target.value)} 
            placeholder="Rule Name" 
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          />
          <input 
            type="text" 
            value={newRuleValue} 
            onChange={(e) => setNewRuleValue(e.target.value)} 
            placeholder="Value" 
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          />
          <button type="button" onClick={addHouseRule} className="bg-gray-100 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200">Add</button>
        </div>
      </section>

      {/* Photos */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Property Photos</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {/* Existing Images */}
          {existingImages.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => removeExistingImage(img.id)}
                className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-red-50"
              ><X size={14}/></button>
            </div>
          ))}

          {/* New Image Previews */}
          {newImages.map((file, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-primary-100 bg-primary-50">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => removeNewImage(idx)}
                className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-red-50"
              ><X size={14}/></button>
              <div className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] py-0.5 text-center font-bold">NEW</div>
            </div>
          ))}

          {/* Upload Button */}
          <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
            <UploadCloud size={24} className="text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">Add Photo</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="pt-6 border-t flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending || isUploading}
          className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending || isUploading}
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-primary-700 transition disabled:opacity-70"
        >
          {(mutation.isPending || isUploading) ? (
            <><Loader2 className="animate-spin h-5 w-5" /> {isEdit ? "Updating..." : "Publishing..."}</>
          ) : (
            isEdit ? "Update Listing" : "Publish Property"
          )}
        </button>
      </div>
    </form>
  );
}
