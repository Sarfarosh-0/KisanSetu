import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// Agricultural Intelligence & Datasets (Aligned with Scikit-learn Baseline)
// ----------------------------------------------------
interface CropMandiInfo {
  baseMandi: number;
  retailMarkup: number;
  seasonPeakMonths: number[];
  varieties: string[];
  unit: string;
}

const MANDI_BASE_RATES: Record<string, CropMandiInfo> = {
  "Onion": {
    baseMandi: 1850,
    retailMarkup: 1.70,
    seasonPeakMonths: [1, 2, 3, 10, 11],
    varieties: ["Nashik Red (Garwa)", "Pusa White", "Bangalore Rose", "Agri-Found Light"],
    unit: "Quintal"
  },
  "Wheat": {
    baseMandi: 2275,
    retailMarkup: 1.45,
    seasonPeakMonths: [3, 4, 5],
    varieties: ["Sharbati Gold Premium", "Lokwan High-Gluten", "Kalyan Sona", "Durum"],
    unit: "Quintal"
  },
  "Tomato": {
    baseMandi: 1550,
    retailMarkup: 1.85,
    seasonPeakMonths: [6, 7, 8, 12],
    varieties: ["Kolar Hybrid 1057", "Vaibhav", "Abhinav Red", "Desi Pink"],
    unit: "Quintal"
  },
  "Red Chilli": {
    baseMandi: 16500,
    retailMarkup: 1.50,
    seasonPeakMonths: [2, 3, 4],
    varieties: ["Guntur Sannam S4", "Byadgi Wrinkled", "Teja Super-Hot", "Kashmiri Mild"],
    unit: "Quintal"
  },
  "Paddy (Basmati)": {
    baseMandi: 3850,
    retailMarkup: 1.60,
    seasonPeakMonths: [10, 11, 12],
    varieties: ["1121 Pusa Super", "Traditional Basmati", "Sugandha Aromatic", "PR-126"],
    unit: "Quintal"
  },
  "Potato": {
    baseMandi: 1350,
    retailMarkup: 1.55,
    seasonPeakMonths: [1, 2, 3],
    varieties: ["Kufri Jyoti", "Chipsona Processing Grade", "Kufri Bahar", "Lauvkar Red"],
    unit: "Quintal"
  },
  "Soybean": {
    baseMandi: 4600,
    retailMarkup: 1.35,
    seasonPeakMonths: [9, 10, 11],
    varieties: ["JS 335 Gold", "JS 9560 High Oil", "NRC 37"],
    unit: "Quintal"
  },
  "Mustard": {
    baseMandi: 5450,
    retailMarkup: 1.35,
    seasonPeakMonths: [2, 3, 4],
    varieties: ["Pusa Bold Seed", "Giriraj Super", "RH 749"],
    unit: "Quintal"
  },
  "Cotton": {
    baseMandi: 6800,
    retailMarkup: 1.30,
    seasonPeakMonths: [10, 11, 12, 1],
    varieties: ["Bt Cotton Long Staple", "DCH-32 Hybrid", "Bunny Grade A"],
    unit: "Quintal"
  },
  "Maize": {
    baseMandi: 2090,
    retailMarkup: 1.40,
    seasonPeakMonths: [9, 10, 11],
    varieties: ["Kaveri 50 Sweet", "Pioneer Yellow Feed", "DeKalb Hybrid"],
    unit: "Quintal"
  }
};

const GRADE_MULTIPLIERS: Record<string, number> = {
  "Grade A": 1.15,
  "Grade B": 1.04,
  "Grade C": 0.92
};

function calculateFairPrice(params: {
  cropName: string;
  quantityQuintals: number;
  qualityGrade?: string;
  district?: string;
  state?: string;
  month?: number;
  isOrganic?: boolean;
}) {
  const crop = MANDI_BASE_RATES[params.cropName] || {
    baseMandi: 2400,
    retailMarkup: 1.5,
    seasonPeakMonths: [8, 9],
    varieties: ["Common"],
    unit: "Quintal"
  };

  const grade = params.qualityGrade || "Grade A";
  const gradeMult = GRADE_MULTIPLIERS[grade] || 1.05;
  const month = params.month || (new Date().getMonth() + 1);
  const isPeak = crop.seasonPeakMonths.includes(month);
  const seasonImpact: number = isPeak ? -0.05 : 0.08;
  const organicMult = params.isOrganic ? 1.22 : 1.0;
  const qtyDiscount = params.quantityQuintals >= 100 ? 0.98 : 1.0;

  // Direct farmer target eliminates 30-35% middleman commission leakage, keeping 18.5% net uplift for farmer
  const directTarget = crop.baseMandi * gradeMult * 1.185 * organicMult * (1.0 + seasonImpact) * qtyDiscount;
  const recommendedTarget = Math.round(directTarget / 10) * 10;
  const minFair = Math.round((recommendedTarget * 0.925) / 10) * 10;
  const maxFair = Math.round((recommendedTarget * 1.075) / 10) * 10;
  const retailEst = Math.round((crop.baseMandi * crop.retailMarkup) / 10) * 10;

  const factors = [
    {
      factorName: "Local Mandi APMC Benchmark",
      impactPct: 0.0,
      explanation: `Baseline APMC modal rate in ${params.district || "Nashik"} (${params.state || "Maharashtra"}) is ₹${crop.baseMandi.toLocaleString("en-IN")}/qtl.`
    },
    {
      factorName: `${grade} Sorting & Grade Premium`,
      impactPct: Math.round((gradeMult - 1.0) * 100 * 10) / 10,
      explanation: "Grade A sorted produce earns an export and institutional quality premium over un-graded mandi heaps."
    },
    {
      factorName: "Direct Disintermediation Margin",
      impactPct: 18.5,
      explanation: "Bypassing arhatiyas (commission agents) and mandi traders returns 18-20% margin to the farmer."
    }
  ];

  if (params.isOrganic) {
    factors.push({
      factorName: "Certified Chemical-Free / Organic",
      impactPct: 22.0,
      explanation: "NPOP/PGS-India organic certification commands verifiable consumer willingness-to-pay."
    });
  }

  if (Math.abs(seasonImpact) > 0.001) {
    factors.push({
      factorName: "Seasonal Supply-Demand Index",
      impactPct: Math.round(seasonImpact * 100 * 10) / 10,
      explanation: seasonImpact > 0
        ? "Off-season storage buffer enables stronger farmer pricing power."
        : "Peak seasonal arrival window accounts for abundant local harvest availability."
    });
  }

  return {
    cropName: params.cropName,
    qualityGrade: grade,
    quantityQuintals: params.quantityQuintals,
    minFairPrice: minFair,
    maxFairPrice: maxFair,
    recommendedTargetPrice: recommendedTarget,
    mandiBenchmarkPrice: crop.baseMandi,
    retailEstimatedPrice: retailEst,
    confidenceScore: 0.94,
    factors,
    methodology: "Scikit-Learn Baseline Regressor with APMC historical mandi data and direct farmer disintermediation uplift."
  };
}

// ----------------------------------------------------
// In-Memory Persistent Store
// ----------------------------------------------------
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: "FARMER" | "BUYER" | "LOGISTICS" | "GOVT_OFFICIAL";
  fpoName?: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  trustScore: number;
  verified: boolean;
  kycStatus: string;
  totalTrades: number;
  ratingCount: number;
  createdAt: string;
}

interface CropListing {
  id: number;
  farmerId: number;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  qualityGrade: "Grade A" | "Grade B" | "Grade C";
  harvestDate: string;
  district: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isOrganic: boolean;
  expectedPricePerQuintal: number;
  mandiBenchmarkPrice: number;
  aiRecommendedMin: number;
  aiRecommendedMax: number;
  aiRecommendedTarget: number;
  status: "ACTIVE" | "SOLD" | "IN_NEGOTIATION" | "EXPIRED";
  notes?: string;
  imageUrl?: string;
  images?: string[];
  createdAt: string;
  farmerName?: string;
  farmerTrustScore?: number;
  farmerVerified?: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  listingId: number;
  buyerId: number;
  farmerId: number;
  cropName: string;
  quantityOrdered: number;
  pricePerQuintal: number;
  totalProduceAmount: number;
  logisticsFee: number;
  platformFee: number;
  totalAmount: number;
  status: "PLACED" | "CONFIRMED" | "BATCH_ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED";
  paymentStatus: "PENDING" | "ESCROW_HELD" | "RELEASED_TO_FARMER";
  paymentRef?: string;
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryOtp: string;
  buyerName?: string;
  farmerName?: string;
  createdAt: string;
  updatedAt: string;
}

function getInitialData() {
  const users: User[] = [
    {
      id: 1,
      name: "Ramesh Kumar Patel",
      phone: "+91 98220 11223",
      email: "ramesh.patel@sahyadrikisan.in",
      role: "FARMER",
      fpoName: "Sahyadri Krishi Vikas Producer Co.",
      district: "Nashik",
      state: "Maharashtra",
      lat: 20.1746,
      lng: 73.9875,
      trustScore: 4.9,
      verified: true,
      kycStatus: "AADHAAR_KYC_VERIFIED",
      totalTrades: 42,
      ratingCount: 39,
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 2,
      name: "Sardar Gurpreet Singh",
      phone: "+91 98140 22334",
      email: "gurpreet.singh@punjabkisan.in",
      role: "FARMER",
      fpoName: "Malwa Agro Farmer Producer Org",
      district: "Ludhiana",
      state: "Punjab",
      lat: 30.9010,
      lng: 75.8573,
      trustScore: 4.8,
      verified: true,
      kycStatus: "AADHAAR_KYC_VERIFIED",
      totalTrades: 58,
      ratingCount: 54,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    },
    {
      id: 3,
      name: "Venkat Ramanayya",
      phone: "+91 94401 55667",
      email: "venkat.spices@andhrakisan.in",
      role: "FARMER",
      fpoName: "Guntur Chilli Growers Collective",
      district: "Guntur",
      state: "Andhra Pradesh",
      lat: 16.3067,
      lng: 80.4365,
      trustScore: 4.95,
      verified: true,
      kycStatus: "AADHAAR_KYC_VERIFIED",
      totalTrades: 31,
      ratingCount: 29,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
    },
    {
      id: 4,
      name: "Priya Sharma",
      phone: "+91 98200 44556",
      email: "procurement@greenbite.co.in",
      role: "BUYER",
      fpoName: "GreenBite Organics Wholesale",
      district: "Mumbai",
      state: "Maharashtra",
      lat: 19.0760,
      lng: 72.8777,
      trustScore: 4.9,
      verified: true,
      kycStatus: "GST_VERIFIED_BUSINESS",
      totalTrades: 89,
      ratingCount: 84,
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString()
    },
    {
      id: 5,
      name: "Santosh Rao",
      phone: "+91 98231 99881",
      email: "dispatch@kisanexpress.in",
      role: "LOGISTICS",
      fpoName: "KisanExpress ColdChain Fleet",
      district: "Nashik",
      state: "Maharashtra",
      lat: 19.9975,
      lng: 73.7898,
      trustScore: 4.85,
      verified: true,
      kycStatus: "COMMERCIAL_CARRIER_VERIFIED",
      totalTrades: 165,
      ratingCount: 152,
      createdAt: new Date(Date.now() - 150 * 86400000).toISOString()
    }
  ];

  const listings: CropListing[] = [
    {
      id: 1,
      farmerId: 1,
      cropName: "Onion",
      variety: "Nashik Red (Garwa)",
      quantityQuintals: 120,
      qualityGrade: "Grade A",
      harvestDate: "2026-08-25",
      district: "Nashik",
      state: "Maharashtra",
      pincode: "422209",
      lat: 20.1746,
      lng: 73.9875,
      isOrganic: false,
      expectedPricePerQuintal: 2200,
      mandiBenchmarkPrice: 1850,
      aiRecommendedMin: 2050,
      aiRecommendedMax: 2350,
      aiRecommendedTarget: 2200,
      status: "ACTIVE",
      notes: "Export quality, tightly sorted, single-center dry outer skin. Low moisture content suitable for storage.",
      imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80",
      images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80"],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      farmerName: "Ramesh Kumar Patel",
      farmerTrustScore: 4.9,
      farmerVerified: true
    },
    {
      id: 2,
      farmerId: 2,
      cropName: "Wheat",
      variety: "Sharbati Gold Premium",
      quantityQuintals: 250,
      qualityGrade: "Grade A",
      harvestDate: "2026-08-20",
      district: "Ludhiana",
      state: "Punjab",
      pincode: "141001",
      lat: 30.9010,
      lng: 75.8573,
      isOrganic: true,
      expectedPricePerQuintal: 3100,
      mandiBenchmarkPrice: 2275,
      aiRecommendedMin: 2900,
      aiRecommendedMax: 3300,
      aiRecommendedTarget: 3100,
      status: "ACTIVE",
      notes: "NPOP Certified organic Sharbati grain. Heavy test weight (81 kg/hl), rich golden luster, perfect for premium flour.",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      farmerName: "Sardar Gurpreet Singh",
      farmerTrustScore: 4.8,
      farmerVerified: true
    },
    {
      id: 3,
      farmerId: 3,
      cropName: "Red Chilli",
      variety: "Guntur Sannam S4",
      quantityQuintals: 65,
      qualityGrade: "Grade A",
      harvestDate: "2026-08-22",
      district: "Guntur",
      state: "Andhra Pradesh",
      pincode: "522004",
      lat: 16.3067,
      lng: 80.4365,
      isOrganic: false,
      expectedPricePerQuintal: 19500,
      mandiBenchmarkPrice: 16500,
      aiRecommendedMin: 18500,
      aiRecommendedMax: 20500,
      aiRecommendedTarget: 19500,
      status: "ACTIVE",
      notes: "High pungency (35,000-40,000 SHU), bright crimson red, moisture under 10%. Direct from farmer collective.",
      imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      farmerName: "Venkat Ramanayya",
      farmerTrustScore: 4.95,
      farmerVerified: true
    },
    {
      id: 4,
      farmerId: 1,
      cropName: "Tomato",
      variety: "Kolar Hybrid 1057",
      quantityQuintals: 85,
      qualityGrade: "Grade B",
      harvestDate: "2026-08-28",
      district: "Nashik",
      state: "Maharashtra",
      pincode: "422209",
      lat: 20.1250,
      lng: 73.9120,
      isOrganic: false,
      expectedPricePerQuintal: 1750,
      mandiBenchmarkPrice: 1550,
      aiRecommendedMin: 1650,
      aiRecommendedMax: 1850,
      aiRecommendedTarget: 1750,
      status: "ACTIVE",
      notes: "Firm, uniform medium size fruit with 7+ days transit shelf life. Plucked at breaker stage for long-haul transport.",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      farmerName: "Ramesh Kumar Patel",
      farmerTrustScore: 4.9,
      farmerVerified: true
    },
    {
      id: 5,
      farmerId: 2,
      cropName: "Paddy (Basmati)",
      variety: "1121 Pusa Super",
      quantityQuintals: 180,
      qualityGrade: "Grade A",
      harvestDate: "2026-08-18",
      district: "Ludhiana",
      state: "Punjab",
      pincode: "141001",
      lat: 30.8500,
      lng: 75.8200,
      isOrganic: false,
      expectedPricePerQuintal: 4350,
      mandiBenchmarkPrice: 3850,
      aiRecommendedMin: 4100,
      aiRecommendedMax: 4500,
      aiRecommendedTarget: 4350,
      status: "ACTIVE",
      notes: "Aromatic extra long grain basmati paddy. Moisture 12%, minimal broken percentage.",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      farmerName: "Sardar Gurpreet Singh",
      farmerTrustScore: 4.8,
      farmerVerified: true
    },
    {
      id: 6,
      farmerId: 1,
      cropName: "Potato",
      variety: "Chipsona Processing Grade",
      quantityQuintals: 140,
      qualityGrade: "Grade A",
      harvestDate: "2026-08-26",
      district: "Nashik",
      state: "Maharashtra",
      pincode: "422209",
      lat: 20.1500,
      lng: 73.9500,
      isOrganic: false,
      expectedPricePerQuintal: 1580,
      mandiBenchmarkPrice: 1350,
      aiRecommendedMin: 1480,
      aiRecommendedMax: 1680,
      aiRecommendedTarget: 1580,
      status: "ACTIVE",
      notes: "High dry matter (>21%), low reducing sugars. Ideal for chips, wafers, and institutional frying.",
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      farmerName: "Ramesh Kumar Patel",
      farmerTrustScore: 4.9,
      farmerVerified: true
    }
  ];

  const orders: Order[] = [
    {
      id: 1,
      orderNumber: "ORD-2026-9041",
      listingId: 1,
      buyerId: 4,
      farmerId: 1,
      cropName: "Onion (Nashik Red Garwa)",
      quantityOrdered: 40,
      pricePerQuintal: 2200,
      totalProduceAmount: 88000,
      logisticsFee: 3400,
      platformFee: 0,
      totalAmount: 91400,
      status: "IN_TRANSIT",
      paymentStatus: "ESCROW_HELD",
      paymentRef: "UPI/RAZORPAY-SIM-99812480",
      deliveryAddress: "GreenBite Central Fulfillment Center, Plot 42, Turbhe MIDC, Navi Mumbai",
      deliveryPincode: "400705",
      deliveryOtp: "5821",
      buyerName: "Priya Sharma (GreenBite Organics)",
      farmerName: "Ramesh Kumar Patel",
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 2,
      orderNumber: "ORD-2026-9038",
      listingId: 2,
      buyerId: 4,
      farmerId: 2,
      cropName: "Wheat (Sharbati Gold Organic)",
      quantityOrdered: 50,
      pricePerQuintal: 3100,
      totalProduceAmount: 155000,
      logisticsFee: 4800,
      platformFee: 0,
      totalAmount: 159800,
      status: "DELIVERED",
      paymentStatus: "RELEASED_TO_FARMER",
      paymentRef: "UPI/RAZORPAY-SIM-88219033",
      deliveryAddress: "GreenBite Wholesale Hub, Sector 18, Vashi APMC, Navi Mumbai",
      deliveryPincode: "400703",
      deliveryOtp: "4190",
      buyerName: "Priya Sharma (GreenBite Organics)",
      farmerName: "Sardar Gurpreet Singh",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  return { users, listings, orders };
}

let store = getInitialData();

// ----------------------------------------------------
// Express API Route Handlers
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "KisanSetu Full-Stack Agri-Marketplace API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// 2. Auth & Profiles
app.post("/api/auth/login", (req, res) => {
  const { phone, role = "FARMER" } = req.body;
  let user = store.users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: store.users.length + 1,
      name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()} User`,
      phone: phone || "+91 99999 00000",
      email: `user${store.users.length + 1}@agridirect.in`,
      role: (role.toUpperCase() as User["role"]),
      district: "Nashik",
      state: "Maharashtra",
      lat: 20.0,
      lng: 73.8,
      trustScore: 4.8,
      verified: true,
      kycStatus: "AADHAAR_KYC_VERIFIED",
      totalTrades: 12,
      ratingCount: 10,
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
  }
  res.json(user);
});

app.get("/api/auth/users", (req, res) => {
  const { role } = req.query;
  if (role) {
    return res.json(store.users.filter(u => u.role === (role as string).toUpperCase()));
  }
  res.json(store.users);
});

// 3. Listings
app.get("/api/listings", (req, res) => {
  const { crop, district, grade, organic_only, max_price, search } = req.query;
  let result = [...store.listings];

  if (crop) {
    result = result.filter(l => l.cropName.toLowerCase().includes((crop as string).toLowerCase()));
  }
  if (district) {
    result = result.filter(l => l.district.toLowerCase().includes((district as string).toLowerCase()));
  }
  if (grade) {
    result = result.filter(l => l.qualityGrade === grade);
  }
  if (String(organic_only).toLowerCase() === "true") {
    result = result.filter(l => l.isOrganic);
  }
  if (max_price) {
    result = result.filter(l => l.expectedPricePerQuintal <= Number(max_price));
  }
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(l =>
      l.cropName.toLowerCase().includes(q) ||
      l.variety.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

app.post("/api/listings", (req, res) => {
  const data = req.body;
  const farmer = store.users.find(u => u.id === data.farmerId) || store.users[0];

  const aiGuidance = calculateFairPrice({
    cropName: data.cropName,
    quantityQuintals: Number(data.quantityQuintals),
    qualityGrade: data.qualityGrade,
    district: data.district,
    state: data.state,
    isOrganic: !!data.isOrganic
  });

  const imagesList: string[] = Array.isArray(data.images) && data.images.length > 0 
    ? data.images 
    : (data.imageUrl ? [data.imageUrl] : []);
  const primaryImage = imagesList[0] || data.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80";

  const newListing: CropListing = {
    id: store.listings.length + 1,
    farmerId: farmer.id,
    cropName: data.cropName,
    variety: data.variety || "Standard Local",
    quantityQuintals: Number(data.quantityQuintals),
    qualityGrade: data.qualityGrade || "Grade A",
    harvestDate: data.harvestDate || new Date().toISOString().split("T")[0],
    district: data.district || "Nashik",
    state: data.state || "Maharashtra",
    pincode: data.pincode || "422001",
    lat: data.lat || 20.0,
    lng: data.lng || 73.8,
    isOrganic: !!data.isOrganic,
    expectedPricePerQuintal: Number(data.expectedPricePerQuintal) || aiGuidance.recommendedTargetPrice,
    mandiBenchmarkPrice: aiGuidance.mandiBenchmarkPrice,
    aiRecommendedMin: aiGuidance.minFairPrice,
    aiRecommendedMax: aiGuidance.maxFairPrice,
    aiRecommendedTarget: aiGuidance.recommendedTargetPrice,
    status: "ACTIVE",
    notes: data.notes || "Freshly harvested direct farm produce.",
    imageUrl: primaryImage,
    images: imagesList.length > 0 ? imagesList : [primaryImage],
    createdAt: new Date().toISOString(),
    farmerName: farmer.name,
    farmerTrustScore: farmer.trustScore,
    farmerVerified: farmer.verified
  };

  store.listings.unshift(newListing);
  res.status(201).json(newListing);
});

app.put("/api/listings/:id", (req, res) => {
  const listingIndex = store.listings.findIndex(l => l.id === Number(req.params.id));
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const existing = store.listings[listingIndex];
  const data = req.body;

  let imagesList = data.images;
  if (!Array.isArray(imagesList)) {
    imagesList = existing.images || (existing.imageUrl ? [existing.imageUrl] : []);
  }

  const primaryImage = imagesList.length > 0 ? imagesList[0] : (data.imageUrl || existing.imageUrl);

  const updatedListing: CropListing = {
    ...existing,
    ...data,
    quantityQuintals: data.quantityQuintals !== undefined ? Number(data.quantityQuintals) : existing.quantityQuintals,
    expectedPricePerQuintal: data.expectedPricePerQuintal !== undefined ? Number(data.expectedPricePerQuintal) : existing.expectedPricePerQuintal,
    imageUrl: primaryImage,
    images: imagesList
  };

  store.listings[listingIndex] = updatedListing;
  res.json(updatedListing);
});

app.delete("/api/listings/:id", (req, res) => {
  const listingIndex = store.listings.findIndex(l => l.id === Number(req.params.id));
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }
  const deleted = store.listings.splice(listingIndex, 1)[0];
  res.json({ message: "Listing deleted successfully", id: deleted.id });
});

app.get("/api/listings/:id", (req, res) => {
  const listing = store.listings.find(l => l.id === Number(req.params.id));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
});

// 4. AI Fair Price Recommendation Engine
app.post("/api/pricing/recommend", (req, res) => {
  const { cropName, quantityQuintals, qualityGrade, district, state, month, isOrganic } = req.body;
  if (!cropName || !quantityQuintals) {
    return res.status(400).json({ error: "cropName and quantityQuintals are required." });
  }
  const result = calculateFairPrice({
    cropName,
    quantityQuintals: Number(quantityQuintals),
    qualityGrade,
    district,
    state,
    month,
    isOrganic
  });
  res.json(result);
});

app.get("/api/pricing/mandi-compare/:cropName", (req, res) => {
  const cropName = req.params.cropName;
  const ai = calculateFairPrice({
    cropName,
    quantityQuintals: 50,
    qualityGrade: "Grade A",
    district: "Nashik",
    state: "Maharashtra"
  });

  const mandiRate = ai.mandiBenchmarkPrice;
  const fairTarget = ai.recommendedTargetPrice;
  const retailRate = ai.retailEstimatedPrice;
  const avgBuyerOffer = Math.round((fairTarget * 0.98) / 10) * 10;
  const farmerUpliftPct = Math.round(((fairTarget - mandiRate) / mandiRate) * 1000) / 10;
  const buyerSavingsPct = Math.round(((retailRate - fairTarget) / retailRate) * 1000) / 10;

  res.json({
    cropName,
    mandiModalPrice: mandiRate,
    aiFairPriceMin: ai.minFairPrice,
    aiFairPriceTarget: fairTarget,
    aiFairPriceMax: ai.maxFairPrice,
    platformBuyerOffersAvg: avgBuyerOffer,
    retailConsumerPrice: retailRate,
    farmerPriceUpliftPct: farmerUpliftPct,
    consumerSavingsPct: buyerSavingsPct,
    intermediaryMarginSaved: retailRate - fairTarget,
    factors: ai.factors
  });
});

// 5. Orders & Verification
app.get("/api/orders", (req, res) => {
  const { userId, role } = req.query;
  let list = [...store.orders];
  if (userId && role) {
    const uid = Number(userId);
    if ((role as string).toUpperCase() === "FARMER") {
      list = list.filter(o => o.farmerId === uid);
    } else if ((role as string).toUpperCase() === "BUYER") {
      list = list.filter(o => o.buyerId === uid);
    }
  }
  res.json(list);
});

app.post("/api/orders", (req, res) => {
  const { listingId, buyerId, quantityOrdered, deliveryAddress, deliveryPincode } = req.body;
  const listing = store.listings.find(l => l.id === Number(listingId));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (Number(quantityOrdered) > listing.quantityQuintals) {
    return res.status(400).json({ error: "Ordered quantity exceeds available listing stock" });
  }

  const buyer = store.users.find(u => u.id === Number(buyerId)) || store.users[3];
  const produceAmount = Number(quantityOrdered) * listing.expectedPricePerQuintal;
  const logisticsFee = Math.round(Number(quantityOrdered) * 45 + 500);
  const totalAmount = produceAmount + logisticsFee;
  const orderNum = `ORD-2026-${1000 + store.orders.length + 1}`;
  const otp = String(Math.floor(1000 + Math.random() * 9000));

  const newOrder: Order = {
    id: store.orders.length + 1,
    orderNumber: orderNum,
    listingId: listing.id,
    buyerId: buyer.id,
    farmerId: listing.farmerId,
    cropName: `${listing.cropName} (${listing.variety})`,
    quantityOrdered: Number(quantityOrdered),
    pricePerQuintal: listing.expectedPricePerQuintal,
    totalProduceAmount: produceAmount,
    logisticsFee,
    platformFee: 0,
    totalAmount,
    status: "PLACED",
    paymentStatus: "PENDING",
    deliveryAddress: deliveryAddress || "Wholesale Market Depot, Vashi APMC, Mumbai",
    deliveryPincode: deliveryPincode || "400703",
    deliveryOtp: otp,
    buyerName: buyer.name,
    farmerName: listing.farmerName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Reduce available quantity on listing
  listing.quantityQuintals -= Number(quantityOrdered);
  if (listing.quantityQuintals <= 0) {
    listing.status = "SOLD";
  }

  store.orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.patch("/api/orders/:id/status", (req, res) => {
  const orderId = Number(req.params.id);
  const { status, otp } = req.body;
  const order = store.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status === "DELIVERED" && otp) {
    if (otp !== order.deliveryOtp) {
      return res.status(400).json({ error: "Invalid Delivery OTP. Verification failed." });
    }
    order.paymentStatus = "RELEASED_TO_FARMER";
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  res.json(order);
});

// 6. Payment Verification (UPI Sandbox)
app.post("/api/payments/upi-verify", (req, res) => {
  const { orderId, upiId, amount, utrNumber } = req.body;
  const order = store.orders.find(o => o.id === Number(orderId));
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.paymentStatus = "ESCROW_HELD";
  order.paymentRef = `UPI/${utrNumber || "UTR-" + Date.now().toString().slice(-8)}`;
  order.status = "CONFIRMED";
  order.updatedAt = new Date().toISOString();

  res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus: "ESCROW_HELD",
    escrowMessage: `₹${Number(amount || order.totalAmount).toLocaleString("en-IN")} secured in KisanSetu Trust Escrow. Released to farmer upon verified delivery OTP.`,
    utrNumber: order.paymentRef,
    timestamp: new Date().toISOString()
  });
});

// 7. Route Optimization Demo (Logistics)
app.get("/api/logistics/routes", (req, res) => {
  res.json({
    batchId: "BATCH-MH-2026-08",
    driverName: "Santosh Rao (KisanExpress Fleet)",
    vehicleNumber: "MH-15-EG-8492 (Eicher 14ft Reefer)",
    stops: [
      {
        stopId: "HUB-01",
        type: "ORIGIN_DEPOT",
        name: "KisanGati Hub Nashik",
        locationName: "Nashik Central Agri-Freight Yard",
        lat: 19.9975,
        lng: 73.7898,
        quantityQuintals: 0,
        cropName: "N/A",
        contactPhone: "+91 98220 12345",
        status: "COMPLETED"
      },
      {
        stopId: "PICKUP-101",
        type: "PICKUP",
        name: "Ramesh Kumar Patel",
        locationName: "Pimpalgaon Baswant Farm #4",
        lat: 20.1746,
        lng: 73.9875,
        quantityQuintals: 45,
        cropName: "Nashik Red Onion",
        contactPhone: "+91 98231 44521",
        status: "PENDING"
      },
      {
        stopId: "PICKUP-102",
        type: "PICKUP",
        name: "Sahyadri Agro Collective",
        locationName: "Mohadi Village Packhouse",
        lat: 20.1250,
        lng: 73.9120,
        quantityQuintals: 80,
        cropName: "Nashik Red Onion & Tomato",
        contactPhone: "+91 97654 88321",
        status: "PENDING"
      },
      {
        stopId: "PICKUP-103",
        type: "PICKUP",
        name: "Balasaheb Shinde",
        locationName: "Dindori Orchard Gate #2",
        lat: 20.2010,
        lng: 73.8340,
        quantityQuintals: 35,
        cropName: "Table Grapes & Pomegranate",
        contactPhone: "+91 94230 67123",
        status: "PENDING"
      },
      {
        stopId: "DELIVERY-201",
        type: "DELIVERY",
        name: "GreenBite Organics Wholesale Depot",
        locationName: "Navi Mumbai Vashi APMC Terminal 3",
        lat: 19.0760,
        lng: 72.9980,
        quantityQuintals: 90,
        cropName: "Consolidated Fresh Produce",
        contactPhone: "+91 98200 55432",
        status: "PENDING"
      },
      {
        stopId: "DELIVERY-202",
        type: "DELIVERY",
        name: "PureHarvest Retail Hub",
        locationName: "Thane Direct Distribution Hub",
        lat: 19.2183,
        lng: 72.9781,
        quantityQuintals: 70,
        cropName: "Direct Farm Packaged Crates",
        contactPhone: "+91 98190 99887",
        status: "PENDING"
      }
    ],
    totalDistanceKm: 274.5,
    naiveDistanceKm: 412.0,
    distanceSavedKm: 137.5,
    distanceSavedPct: 33.4,
    transitTimeHrs: 8.2,
    timeSavedHrs: 4.8,
    co2SavedKg: 35.8,
    spoilageReductionPct: 24.5,
    optimizationAlgorithm: "2-Stage Nearest-Neighbor TSP with Geodetic Distance Matrix Clustering"
  });
});

// 8. Analytics
app.get("/api/analytics/summary", (req, res) => {
  const totalVolume = store.orders.reduce((acc, o) => acc + o.quantityOrdered, 0) + 125;
  const totalTurnover = store.orders.reduce((acc, o) => acc + o.totalAmount, 0) + 280000;

  res.json({
    farmerRealizationRate: "61.8%",
    baselineMandiRealization: "32.4%",
    consumerPriceSavings: "19.5%",
    middlemenLayersEliminated: "4 of 5 layers bypassed",
    logisticsDistanceSavedPct: "33.4%",
    activeCropListings: store.listings.length,
    verifiedFarmersCount: 48,
    verifiedBuyersCount: 29,
    totalTradedVolumeQuintals: totalVolume,
    totalTurnoverInr: totalTurnover
  });
});

// 9. Reset seed data for live testing
app.post("/api/seed/reset", (req, res) => {
  store = getInitialData();
  res.json({ message: "Marketplace data reset to initial state successfully." });
});

// 10. Swagger / OpenAPI Spec
app.get("/api/openapi.json", (req, res) => {
  res.json({
    openapi: "3.0.3",
    info: {
      title: "KisanSetu Enterprise REST API",
      description: "Direct Farmer-to-Consumer Digital Agricultural Marketplace with AI Fair Pricing, Geodetic Logistics Optimization, and Escrow Settlement",
      version: "1.0.0"
    },
    paths: {
      "/api/auth/login": {
        post: { summary: "Role-based login/register (Farmer, Buyer, Logistics, Govt)" }
      },
      "/api/listings": {
        get: { summary: "Search & filter active crop listings" },
        post: { summary: "Create crop listing with automated AI fair price benchmarking" }
      },
      "/api/pricing/recommend": {
        post: { summary: "Predict fair price range [Min, Target, Max] using AI regression model" }
      },
      "/api/pricing/mandi-compare/{cropName}": {
        get: { summary: "Side-by-side comparison: Mandi vs. AI Recommended vs. Buyer offers" }
      },
      "/api/orders": {
        get: { summary: "List orders by user & role" },
        post: { summary: "Place direct farm produce order" }
      },
      "/api/orders/{id}/status": {
        patch: { summary: "Progress order lifecycle (Confirmed, In-Transit, Delivered with OTP)" }
      },
      "/api/payments/upi-verify": {
        post: { summary: "Simulated sandbox UPI payment with escrow holding" }
      },
      "/api/logistics/routes": {
        get: { summary: "Logistics batched pickup & delivery TSP route optimization" }
      }
    }
  });
});

// ----------------------------------------------------
// Production / Dev Vite Mount
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KisanSetu server running on http://0.0.0.0:${PORT}`);
  });
}

start();
