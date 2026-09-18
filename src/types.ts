export type UserRole = "FARMER" | "BUYER" | "LOGISTICS" | "GOVT_OFFICIAL";

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
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

export type QualityGrade = "Grade A" | "Grade B" | "Grade C";

export interface CropListing {
  id: number;
  farmerId: number;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  qualityGrade: QualityGrade;
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
  fpoName?: string;
  farmerTrustScore?: number;
  farmerVerified?: boolean;
  minOrderQuantityQuintals?: number;
  moisturePct?: number;
  packagingType?: string;
  shelfLifeDays?: number;
}

export interface PriceFactor {
  factorName: string;
  impactPct: number;
  explanation: string;
}

export interface FairPriceResult {
  cropName: string;
  qualityGrade: string;
  quantityQuintals: number;
  minFairPrice: number;
  maxFairPrice: number;
  recommendedTargetPrice: number;
  mandiBenchmarkPrice: number;
  retailEstimatedPrice: number;
  confidenceScore: number;
  factors: PriceFactor[];
  methodology: string;
}

export interface MandiComparison {
  cropName: string;
  mandiModalPrice: number;
  aiFairPriceMin: number;
  aiFairPriceTarget: number;
  aiFairPriceMax: number;
  platformBuyerOffersAvg: number;
  retailConsumerPrice: number;
  farmerPriceUpliftPct: number;
  consumerSavingsPct: number;
  intermediaryMarginSaved: number;
  factors?: PriceFactor[];
}

export type OrderStatus = "PLACED" | "CONFIRMED" | "BATCH_ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "ESCROW_HELD" | "RELEASED_TO_FARMER";

export interface Order {
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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryOtp: string;
  buyerName?: string;
  farmerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  stopId: string;
  type: "ORIGIN_DEPOT" | "PICKUP" | "DELIVERY";
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  quantityQuintals: number;
  cropName: string;
  contactPhone: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface RouteBatch {
  batchId: string;
  driverName: string;
  vehicleNumber: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  naiveDistanceKm: number;
  distanceSavedKm: number;
  distanceSavedPct: number;
  transitTimeHrs: number;
  timeSavedHrs: number;
  co2SavedKg: number;
  spoilageReductionPct: number;
  optimizationAlgorithm: string;
}

export interface MarketAnalytics {
  farmerRealizationRate: string;
  baselineMandiRealization: string;
  consumerPriceSavings: string;
  middlemenLayersEliminated: string;
  logisticsDistanceSavedPct: string;
  activeCropListings: number;
  verifiedFarmersCount: number;
  verifiedBuyersCount: number;
  totalTradedVolumeQuintals: number;
  totalTurnoverInr: number;
}

export interface BuyerRequest {
  id: number;
  buyerId: number;
  buyerName: string;
  buyerCompany: string;
  cropName: string;
  variety?: string;
  quantityRequiredQuintals: number;
  targetPricePerQuintal: number;
  qualityGrade: QualityGrade;
  deliveryLocation: string;
  status: "OPEN" | "FULFILLED" | "EXPIRED";
  urgency: "Immediate (48h)" | "Weekly Supply" | "Seasonal Contract";
  notes: string;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  orderId: number;
  orderNumber: string;
  cropName: string;
  quantityQuintals: number;
  amount: number;
  bankName: string;
  accountMasked: string;
  ifscCode: string;
  utrNumber: string;
  status: "RELEASED" | "ESCROW_LOCKED" | "PROCESSING";
  date: string;
}

export interface WeatherForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: "Sunny" | "Partly Cloudy" | "Scattered Showers" | "Dry & Breezy" | "Clear Sky";
  rainProbability: number;
  humidity: number;
  windSpeedKmh: number;
  advisory: string;
}

export interface BuyerContract {
  contractId: string;
  contractNumber: string;
  buyerName: string;
  buyerCompany: string;
  farmerName: string;
  fpoName: string;
  cropName: string;
  variety: string;
  volumeQuintals: number;
  contractValue: number;
  pricePerQuintal: number;
  startDate: string;
  deliveryDueDate: string;
  status: "ACTIVE" | "IN_FULFILLMENT" | "COMPLETED";
  escrowStatus: "100% FUNDED" | "PARTIALLY_RELEASED" | "FULLY_SETTLED";
}

export interface BulkProcurementRequest {
  id: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  targetPricePerQuintal: number;
  qualityGrade: QualityGrade;
  deliveryPincode: string;
  deliveryAddress: string;
  urgency: string;
  notes: string;
  createdAt: string;
}

export interface CropRfq {
  id: string;
  listingId: number;
  cropName: string;
  variety: string;
  farmerId: number;
  farmerName?: string;
  fpoName?: string;
  buyerId: number;
  buyerName: string;
  buyerCompany?: string;
  buyerPhone?: string;
  requiredQuantityQuintals: number;
  expectedPricePerQuintal: number;
  deliveryLocation: string;
  deliveryPincode: string;
  deliveryTimeline: "Immediate (Within 48h)" | "Within 7 Days" | "Flexible / Scheduled Supply";
  message?: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "COUNTER_OFFER" | "REJECTED";
  createdAt: string;
}
