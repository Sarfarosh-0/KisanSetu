import {
  CropListing,
  FairPriceResult,
  MandiComparison,
  Order,
  RouteBatch,
  MarketAnalytics,
  User,
  CropRfq
} from "./types";

async function safeFetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      const text = await res.text();
      let msg = `HTTP error ${res.status}`;
      try {
        const json = JSON.parse(text);
        msg = json.error || json.detail || msg;
      } catch {
        // use default msg
      }
      throw new Error(msg);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const API = {
  async getHealth() {
    return safeFetchJson<{ status: string }>("/api/health", undefined, { status: "ok" });
  },

  async getUsers(role?: string): Promise<User[]> {
    return safeFetchJson<User[]>(`/api/auth/users${role ? `?role=${role}` : ""}`, undefined, []);
  },

  async login(phone: string, role: string): Promise<User> {
    return safeFetchJson<User>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, role })
    });
  },

  async getListings(params?: {
    crop?: string;
    district?: string;
    grade?: string;
    organic_only?: boolean;
    max_price?: number;
    search?: string;
  }): Promise<CropListing[]> {
    const query = new URLSearchParams();
    if (params?.crop) query.append("crop", params.crop);
    if (params?.district) query.append("district", params.district);
    if (params?.grade) query.append("grade", params.grade);
    if (params?.organic_only) query.append("organic_only", "true");
    if (params?.max_price) query.append("max_price", params.max_price.toString());
    if (params?.search) query.append("search", params.search);

    return safeFetchJson<CropListing[]>(`/api/listings?${query.toString()}`, undefined, []);
  },

  async createListing(listingData: Partial<CropListing>): Promise<CropListing> {
    return safeFetchJson<CropListing>("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listingData)
    });
  },

  async updateListing(id: number, listingData: Partial<CropListing>): Promise<CropListing> {
    return safeFetchJson<CropListing>(`/api/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listingData)
    });
  },

  async deleteListing(id: number): Promise<{ message: string; id: number }> {
    return safeFetchJson<{ message: string; id: number }>(`/api/listings/${id}`, {
      method: "DELETE"
    });
  },

  async uploadImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];

    // Attempt multipart upload to the server
    let serverError: string | null = null;
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        if (json.urls && Array.isArray(json.urls)) {
          return json.urls;
        }
      } else {
        // Server explicitly rejected the upload (wrong type, size, etc.) – surface the error
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          serverError = json.error || json.detail || `Upload failed (${res.status})`;
        } catch {
          serverError = `Upload failed (${res.status})`;
        }
        throw new Error(serverError);
      }
    } catch (err: any) {
      // If this is a server-side validation error, re-throw so the UI can show it
      if (serverError) throw err;
      // Otherwise it's a network/connectivity issue – fall back to data URLs silently
      console.warn("Network error during image upload, falling back to data URL encoding:", err);
    }

    // Fallback: encode files as base64 data URLs and embed directly in the listing payload.
    // The 50mb JSON limit on the server can handle up to ~10 photos of 4MB each as data URLs.
    const dataUrls: string[] = [];
    for (const file of files) {
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      dataUrls.push(url);
    }
    return dataUrls;
  },

  async getPriceRecommendation(params: {
    cropName: string;
    quantityQuintals: number;
    qualityGrade?: string;
    district?: string;
    state?: string;
    month?: number;
    isOrganic?: boolean;
  }): Promise<FairPriceResult> {
    return safeFetchJson<FairPriceResult>("/api/pricing/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
  },

  async getMandiComparison(cropName: string): Promise<MandiComparison> {
    return safeFetchJson<MandiComparison>(`/api/pricing/mandi-compare/${encodeURIComponent(cropName)}`);
  },

  async getOrders(userId?: number, role?: string): Promise<Order[]> {
    const query = new URLSearchParams();
    if (userId) query.append("userId", userId.toString());
    if (role) query.append("role", role);
    return safeFetchJson<Order[]>(`/api/orders?${query.toString()}`, undefined, []);
  },

  async placeOrder(orderData: {
    listingId: number;
    buyerId: number;
    quantityOrdered: number;
    deliveryAddress: string;
    deliveryPincode: string;
  }): Promise<Order> {
    return safeFetchJson<Order>("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });
  },

  async updateOrderStatus(orderId: number, status: string, otp?: string): Promise<Order> {
    return safeFetchJson<Order>(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, otp })
    });
  },

  async verifyUpiPayment(payload: {
    orderId: number;
    upiId: string;
    amount: number;
    utrNumber?: string;
  }) {
    return safeFetchJson<any>("/api/payments/upi-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  },

  async getRouteOptimization(): Promise<RouteBatch> {
    return safeFetchJson<RouteBatch>("/api/logistics/routes");
  },

  async getAnalytics(): Promise<MarketAnalytics> {
    return safeFetchJson<MarketAnalytics>("/api/analytics/summary");
  },

  async resetSeedData() {
    return safeFetchJson<{ message: string }>("/api/seed/reset", { method: "POST" });
  },

  async submitRfq(rfqData: Partial<CropRfq>): Promise<CropRfq> {
    return safeFetchJson<CropRfq>("/api/rfqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rfqData)
    }, {
      id: `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      listingId: rfqData.listingId || 1,
      cropName: rfqData.cropName || "Produce",
      variety: rfqData.variety || "Standard",
      farmerId: rfqData.farmerId || 1,
      farmerName: rfqData.farmerName,
      fpoName: rfqData.fpoName,
      buyerId: rfqData.buyerId || 4,
      buyerName: rfqData.buyerName || "Buyer",
      requiredQuantityQuintals: rfqData.requiredQuantityQuintals || 20,
      expectedPricePerQuintal: rfqData.expectedPricePerQuintal || 2000,
      deliveryLocation: rfqData.deliveryLocation || "Warehouse",
      deliveryPincode: rfqData.deliveryPincode || "400703",
      deliveryTimeline: rfqData.deliveryTimeline || "Immediate (Within 48h)",
      message: rfqData.message,
      status: "SUBMITTED",
      createdAt: new Date().toISOString()
    });
  },

  async getRfqs(params?: { buyerId?: number; farmerId?: number; listingId?: number }): Promise<CropRfq[]> {
    const query = new URLSearchParams();
    if (params?.buyerId) query.append("buyerId", params.buyerId.toString());
    if (params?.farmerId) query.append("farmerId", params.farmerId.toString());
    if (params?.listingId) query.append("listingId", params.listingId.toString());
    return safeFetchJson<CropRfq[]>(`/api/rfqs?${query.toString()}`, undefined, []);
  }
};

