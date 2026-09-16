import React, { useState, useEffect, useRef } from "react";
import { 
  Sprout, 
  Sparkles, 
  Leaf, 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Star, 
  Check, 
  AlertCircle, 
  Loader2,
  Image as ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
  PackageCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CropListing, FairPriceResult, QualityGrade, User } from "../../types";
import { API } from "../../api";
import { t, translateCrop, translateGrade } from "../../i18n";

const COMMON_CROPS = [
  { name: "Onion", varieties: ["Nashik Red (Garwa)", "Pusa White", "Bangalore Rose"], unit: "Quintals" },
  { name: "Wheat", varieties: ["Sharbati Gold Premium", "Lokwan High-Gluten", "Durum"], unit: "Quintals" },
  { name: "Tomato", varieties: ["Kolar Hybrid 1057", "Vaibhav", "Abhinav Red"], unit: "Quintals" },
  { name: "Red Chilli", varieties: ["Guntur Sannam S4", "Byadgi Wrinkled", "Teja"], unit: "Quintals" },
  { name: "Paddy (Basmati)", varieties: ["1121 Pusa Super", "Traditional Basmati", "PR-126"], unit: "Quintals" },
  { name: "Potato", varieties: ["Kufri Jyoti", "Chipsona Processing", "Lauvkar Red"], unit: "Quintals" },
  { name: "Soybean", varieties: ["JS 335 Gold", "JS 9560 High Oil", "NRC 37"], unit: "Quintals" },
  { name: "Mustard", varieties: ["Pusa Bold Seed", "Giriraj Super"], unit: "Quintals" },
  { name: "Cotton", varieties: ["Bt Cotton Long Staple", "DCH-32 Hybrid"], unit: "Quintals" },
  { name: "Maize", varieties: ["Kaveri 50 Sweet", "Pioneer Yellow Feed"], unit: "Quintals" }
];

const DEFAULT_IMAGE_PLACEHOLDER = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";

interface FarmerCropFormProps {
  farmer: User;
  editingListing?: CropListing | null;
  onSuccess: (listing: CropListing) => void;
  onCancel: () => void;
  lang: "en" | "hi";
}

interface PhotoItem {
  id: string;
  url: string;
  file?: File;
}

export const FarmerCropForm: React.FC<FarmerCropFormProps> = ({
  farmer,
  editingListing,
  onSuccess,
  onCancel,
  lang
}) => {
  const isEditing = !!editingListing;

  // Lock body scroll while full-screen form view is open
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, []);

  // Form Fields State
  const [cropName, setCropName] = useState(editingListing?.cropName || "Onion");
  const [variety, setVariety] = useState(editingListing?.variety || "Nashik Red (Garwa)");
  const [quantity, setQuantity] = useState<number>(editingListing?.quantityQuintals || 60);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>(editingListing?.qualityGrade || "Grade A");
  const [isOrganic, setIsOrganic] = useState(editingListing?.isOrganic || false);
  const [harvestDate, setHarvestDate] = useState(editingListing?.harvestDate || new Date().toISOString().split("T")[0]);
  const [district, setDistrict] = useState(editingListing?.district || farmer.district || "Nashik");
  const [state, setState] = useState(editingListing?.state || farmer.state || "Maharashtra");
  const [pincode, setPincode] = useState(editingListing?.pincode || "422209");
  const [expectedPrice, setExpectedPrice] = useState<number>(editingListing?.expectedPricePerQuintal || 2200);
  const [notes, setNotes] = useState(editingListing?.notes || "");

  // Photos State
  const initialPhotos = editingListing?.images && editingListing.images.length > 0
    ? editingListing.images.map((url, i) => ({ id: `existing-${i}-${Date.now()}`, url }))
    : (editingListing?.imageUrl ? [{ id: `existing-0-${Date.now()}`, url: editingListing.imageUrl }] : []);

  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI & Loading States
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiGuidance, setAiGuidance] = useState<FairPriceResult | null>(null);

  // Update variety options when crop changes
  useEffect(() => {
    if (!isEditing) {
      const found = COMMON_CROPS.find(c => c.name === cropName);
      if (found && found.varieties.length > 0) {
        setVariety(found.varieties[0]);
      }
    }
  }, [cropName]);

  // Live AI Price Recommendation Fetcher
  useEffect(() => {
    let isMounted = true;
    const fetchGuidance = async () => {
      try {
        setLoadingAI(true);
        const res = await API.getPriceRecommendation({
          cropName,
          quantityQuintals: Number(quantity) || 10,
          qualityGrade,
          district,
          state,
          isOrganic
        });
        if (isMounted) {
          setAiGuidance(res);
          if (!isEditing && (!expectedPrice || expectedPrice === 2200)) {
            setExpectedPrice(res.recommendedTargetPrice);
          }
        }
      } catch (err) {
        console.error("AI price recommendation fetch error:", err);
      } finally {
        if (isMounted) setLoadingAI(false);
      }
    };

    const timer = setTimeout(fetchGuidance, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [cropName, quantity, qualityGrade, isOrganic, district, state]);

  // Handle Image File Selection with Validation
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 10) {
      setErrorMsg(lang === "hi" 
        ? "आप अधिकतम 10 फोटो ही अपलोड कर सकते हैं।" 
        : "Maximum 10 photos allowed per crop listing.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    const validFiles: PhotoItem[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMsg(lang === "hi"
          ? `फ़ाइल '${file.name}' अमान्य प्रारूप है। केवल JPG, PNG या WEBP अपलोड करें।`
          : `File '${file.name}' is invalid. Only JPEG, PNG, or WEBP images are supported.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(lang === "hi"
          ? `फ़ाइल '${file.name}' 5MB से बड़ी है। कृपया छोटी फ़ाइल चुनें।`
          : `File '${file.name}' exceeds the 5MB size limit.`);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      validFiles.push({
        id: `new-${Date.now()}-${Math.random()}`,
        url: objectUrl,
        file
      });
    }

    setPhotos(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reorder & Remove Photo Helpers
  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    setPhotos(prev => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const handleMovePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;
    setPhotos(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIndex];
      copy[newIndex] = temp;
      return copy;
    });
  };

  // Submit Listing Form (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      let finalImageUrls: string[] = [];
      const newFileItems = photos.filter(p => p.file);

      if (newFileItems.length > 0) {
        setUploadingPhotos(true);
        const filesToUpload = newFileItems.map(p => p.file!);
        const uploadedUrls = await API.uploadImages(filesToUpload);

        let uploadIndex = 0;
        finalImageUrls = photos.map(p => {
          if (p.file) {
            const uploadedUrl = uploadedUrls[uploadIndex] || p.url;
            uploadIndex++;
            return uploadedUrl;
          }
          return p.url;
        });
        setUploadingPhotos(false);
      } else {
        finalImageUrls = photos.map(p => p.url);
      }

      const primaryImage = finalImageUrls.length > 0 
        ? finalImageUrls[0] 
        : DEFAULT_IMAGE_PLACEHOLDER;

      const payload = {
        farmerId: farmer.id,
        cropName,
        variety,
        quantityQuintals: Number(quantity),
        qualityGrade,
        harvestDate,
        district,
        state,
        pincode,
        lat: farmer.lat || 20.17,
        lng: farmer.lng || 73.98,
        isOrganic,
        expectedPricePerQuintal: Number(expectedPrice),
        notes: notes || (lang === "hi" ? "ताज़ा कटी हुई फसल, उत्कृष्ट नमी स्तर।" : "Freshly harvested produce with optimal moisture content."),
        imageUrl: primaryImage,
        images: finalImageUrls.length > 0 ? finalImageUrls : [primaryImage]
      };

      let result: CropListing;
      if (isEditing && editingListing) {
        result = await API.updateListing(editingListing.id, payload);
      } else {
        result = await API.createListing(payload);
      }

      onSuccess(result);
    } catch (err: any) {
      console.error("Listing save failed:", err);
      setErrorMsg(err.message || (lang === "hi" ? "लिस्टिंग सहेजने में विफल। कृपया पुन: प्रयास करें।" : "Failed to save crop listing. Please try again."));
    } finally {
      setSubmitting(false);
      setUploadingPhotos(false);
    }
  };

  return (
    /* Full-Screen Overlay: Completely covers Application Header, Sidebar & Footer */
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto w-full h-full flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-200 overflow-x-hidden">
      
      {/* Top Header Bar - Fixed/Sticky on Mobile */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-xs shrink-0">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
          
          {/* Back & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-700" />
            </button>
            <div className="h-5 w-px bg-slate-200 hidden xs:block shrink-0" />
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-slate-900 text-xs sm:text-base font-display truncate">
                  {isEditing
                    ? (lang === "hi" ? "फसल विवरण व फोटो संपादित करें" : "Edit Harvest Lot")
                    : (lang === "hi" ? "नई फसल लिस्ट करें (खेत बिक्री)" : "Register New Harvest Lot")}
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block">
                  {isEditing
                    ? (lang === "hi" ? `लॉट #${editingListing.id}` : `Updating Harvest Lot #${editingListing.id}`)
                    : (lang === "hi" ? "संस्थागत खरीदारों से जुड़ने के लिए डिजिटल फॉर्म" : "Direct-to-buyer farm produce listing")}
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer hidden sm:inline-block"
            >
              {t("common.cancel", lang)}
            </button>
            <button
              type="submit"
              form="crop-listing-form"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">{uploadingPhotos ? (lang === "hi" ? "अपलोड हो रही है..." : "Uploading...") : (lang === "hi" ? "सहेज रहे हैं..." : "Saving...")}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? (lang === "hi" ? "सहेजें" : "Save") : (lang === "hi" ? "प्रकाशित करें" : "Publish")}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 sm:p-4 text-xs font-semibold flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1 break-words">{errorMsg}</div>
          </div>
        )}

        <form id="crop-listing-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          
          {/* SECTION 1: PHOTO UPLOADER & GALLERY (UP TO 10 PHOTOS) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display flex items-center gap-1.5 sm:gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{lang === "hi" ? "फसल की तस्वीरें (अधिकतम 10 फोटो)" : "Crop Produce Photos (Up to 10)"}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    {photos.length} / 10
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {lang === "hi"
                    ? "1ली फोटो मुख्य फोटो (Primary Photo) होगी जो खरीदारों को दिखाई देगी।"
                    : "The 1st photo will be the main image shown to buyers. Reorder anytime."}
                </p>
              </div>

              {photos.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === "hi" ? "फोटो जोड़ें" : "Add Photos"}</span>
                </button>
              )}
            </div>

            {/* Hidden Input File Element */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleSelectFiles}
              className="hidden"
            />

            {/* Dropzone Container when photos array is empty */}
            {photos.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition space-y-2 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                  {lang === "hi" ? "फसल की फोटो अपलोड करने के लिए यहाँ टैप करें" : "Tap here to upload harvest lot photos"}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  {lang === "hi" 
                    ? "खेत, बोरी या छँटाई की स्पष्ट फोटो (JPG, PNG, WEBP - अधिकतम 5MB/फोटो)" 
                    : "Clear produce photos build buyer trust and speed up deals (JPEG, PNG, WEBP, max 5MB)"}
                </p>
              </div>
            ) : (
              /* Photo Grid Gallery Preview */
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                {photos.map((photo, index) => {
                  const isPrimary = index === 0;
                  return (
                    <div
                      key={photo.id}
                      className={`relative group rounded-2xl overflow-hidden border bg-slate-100 aspect-square flex flex-col justify-between transition-all ${
                        isPrimary ? "ring-2 ring-emerald-500 border-emerald-400 shadow-xs" : "border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`Harvest photo ${index + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Photo Badge */}
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                        {isPrimary ? (
                          <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                            <span>{lang === "hi" ? "मुख्य" : "Primary"}</span>
                          </span>
                        ) : (
                          <span className="bg-slate-900/80 backdrop-blur text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                        )}
                      </div>

                      {/* Photo Overlay Actions */}
                      <div className="absolute inset-0 bg-slate-900/65 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-10">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg cursor-pointer transition shadow-xs"
                            title={lang === "hi" ? "फोटो हटाएं" : "Remove photo"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(index)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-1 rounded-md cursor-pointer transition flex-1 text-center truncate shadow-xs"
                            >
                              {lang === "hi" ? "मुख्य करें" : "Primary"}
                            </button>
                          )}

                          <div className="flex items-center gap-0.5 ml-auto">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(index, "left")}
                                className="bg-slate-800/90 text-white p-1 rounded-md hover:bg-slate-700 cursor-pointer"
                                title="Move left"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}
                            {index < photos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(index, "right")}
                                className="bg-slate-800/90 text-white p-1 rounded-md hover:bg-slate-700 cursor-pointer"
                                title="Move right"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add More Slot Card */}
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-emerald-700 transition cursor-pointer gap-1 p-2"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-center">
                      {lang === "hi" ? "और जोड़ें" : "Add More"}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: CROP SPECIFICATIONS & QUANTITY */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-xs space-y-4 sm:space-y-5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lang === "hi" ? "फसल व मात्रा विवरण" : "Crop Identity & Volume"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
              {/* Crop Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("farmerModal.selectCrop", lang)} *
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {COMMON_CROPS.map((c) => (
                    <option key={c.name} value={c.name}>{translateCrop(c.name, lang)}</option>
                  ))}
                </select>
              </div>

              {/* Crop Variety Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("farmerModal.selectVariety", lang)} *
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  required
                  placeholder="e.g. Nashik Red, Kolar 1057"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
              {/* Quantity in Quintals */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("farmerModal.quantityQuintals", lang)} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-display"
                />
                <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block font-medium">
                  ~{(Number(quantity) * 100).toLocaleString()} kg ({lang === "hi" ? "कुल वजन" : "Total weight"})
                </span>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("farmerModal.qualityGrade", lang)} *
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Grade A">{translateGrade("Grade A", lang)}</option>
                  <option value="Grade B">{translateGrade("Grade B", lang)}</option>
                  <option value="Grade C">{translateGrade("Grade C", lang)}</option>
                </select>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("farmerModal.harvestDateLabel", lang)} *
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Organic Premium Checkbox Banner */}
            <div className="flex items-center gap-2.5 sm:gap-3 bg-[#F0FDF4] p-3 sm:p-4 rounded-2xl border border-emerald-200">
              <input
                type="checkbox"
                id="organic-check"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer shrink-0"
              />
              <label htmlFor="organic-check" className="text-xs sm:text-sm font-bold text-emerald-950 cursor-pointer flex items-center gap-1.5 sm:gap-2 leading-tight">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>{t("farmerModal.organicLabel", lang)} (+22% Premium in AI Pricing)</span>
              </label>
            </div>
          </div>

          {/* SECTION 3: AI FAIR-PRICE BENCHMARK & FARMER ASK PRICE */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-xs space-y-4 sm:space-y-5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lang === "hi" ? "मूल्य निर्धारण व एआई मार्गदर्शन" : "Fair Pricing & Market Benchmarks"}</span>
            </h3>

            {/* Live AI Fair Price Widget */}
            <div className="bg-[#F0FDF4] rounded-2xl p-3 sm:p-4 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-extrabold text-emerald-900">
                    {t("farmerModal.aiPricingHeading", lang)}
                  </span>
                </div>
                {loadingAI && (
                  <span className="text-[10px] sm:text-[11px] text-emerald-700 animate-pulse font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{lang === "hi" ? "गणना..." : "Live rates..."}</span>
                  </span>
                )}
              </div>

              {aiGuidance ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 text-center">
                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block font-bold uppercase truncate">{t("farmerModal.mandiBenchmark", lang)}</span>
                      <span className="font-extrabold text-slate-700 text-xs sm:text-sm font-display truncate block">₹{aiGuidance.mandiBenchmarkPrice.toLocaleString()}</span>
                    </div>

                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-200 ring-2 ring-emerald-500 shadow-xs">
                      <span className="text-[9px] sm:text-[10px] text-emerald-700 font-extrabold block uppercase truncate">{lang === "hi" ? "एआई लक्ष्य भाव" : "AI Recommended Target"}</span>
                      <span className="font-extrabold text-emerald-900 text-sm sm:text-base font-display truncate block">₹{aiGuidance.recommendedTargetPrice.toLocaleString()}</span>
                    </div>

                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-100">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block font-bold uppercase truncate">{t("farmerModal.recommendedRange", lang)}</span>
                      <span className="font-bold text-slate-700 text-[11px] sm:text-sm truncate block">₹{aiGuidance.minFairPrice.toLocaleString()} - ₹{aiGuidance.maxFairPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-emerald-800 leading-relaxed font-medium bg-emerald-100/50 p-2 sm:p-2.5 rounded-xl break-words">
                    💡 {aiGuidance.methodology}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  {lang === "hi" ? "एगमार्कनेट लाइव मंडी भाव लोड हो रहे हैं..." : "Loading APMC live market price feeds..."}
                </p>
              )}
            </div>

            {/* Expected Price Per Quintal Input */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t("farmerModal.expectedPriceLabel", lang)} *
                </label>
                {aiGuidance && (
                  <button
                    type="button"
                    onClick={() => setExpectedPrice(aiGuidance.recommendedTargetPrice)}
                    className="text-[11px] sm:text-xs font-extrabold text-emerald-700 hover:text-emerald-900 cursor-pointer underline underline-offset-2 self-start sm:self-auto"
                  >
                    {lang === "hi" ? `एआई लक्ष्य भाव (₹${aiGuidance.recommendedTargetPrice}) लागू करें` : `Apply AI Target (₹${aiGuidance.recommendedTargetPrice})`}
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 sm:top-3 text-slate-400 font-extrabold text-sm sm:text-base">₹</span>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  required
                  className="w-full pl-8 sm:pl-9 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-lg font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-display"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: LOCATION & NOTES */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-100 shadow-xs space-y-4 sm:space-y-5">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lang === "hi" ? "स्थान व अतिरिक्त विवरण" : "Farm Location & Produce Notes"}</span>
            </h3>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3.5 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "जिला" : "District"} *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "राज्य" : "State"} *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{lang === "hi" ? "पिनकोड" : "Pincode"} *</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === "hi" ? "अतिरिक्त गुणवत्ता विवरण (नमी, पैकिंग, भण्डारण)" : "Produce Quality, Moisture & Storage Notes"}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === "hi" 
                  ? "उदा. फसल अच्छी तरह सूखी है, नमी < 12%, हवादार भंडारण गृह में सुरक्षित, निरीक्षण के लिए तुरंत उपलब्ध।" 
                  : "e.g. Well-cured crop, moisture < 12%, stored in dry farm shed, ready for immediate inspection."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 sm:px-3.5 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Safe spacing for bottom bar */}
          <div className="h-16 sm:h-8" />
        </form>
      </div>

      {/* Bottom Action Footer - Sticky & Responsive for Mobile */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between sm:justify-end gap-3 z-30 shadow-lg shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200 sm:border-none"
        >
          {t("common.cancel", lang)}
        </button>
        <button
          type="submit"
          form="crop-listing-form"
          disabled={submitting}
          className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{uploadingPhotos ? (lang === "hi" ? "अपलोड हो रही है..." : "Uploading...") : (lang === "hi" ? "सहेज रहे हैं..." : "Saving...")}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEditing ? (lang === "hi" ? "लॉट अपडेट करें" : "Update Harvest Lot") : (lang === "hi" ? "मार्केटप्लेस में प्रकाशित करें" : "Publish to Marketplace")}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
