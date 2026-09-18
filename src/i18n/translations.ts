export type Language = "en" | "hi";

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const CROP_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  "Onion": { en: "Onion", hi: "प्याज" },
  "Wheat": { en: "Wheat", hi: "गेहूं" },
  "Tomato": { en: "Tomato", hi: "टमाटर" },
  "Red Chilli": { en: "Red Chilli", hi: "लाल मिर्च" },
  "Paddy (Basmati)": { en: "Paddy (Basmati)", hi: "धान (बासमती)" },
  "Potato": { en: "Potato", hi: "आलू" },
  "Soybean": { en: "Soybean", hi: "सोयाबीन" },
  "Mustard": { en: "Mustard", hi: "सरसों" },
  "Cotton": { en: "Cotton", hi: "कपास" },
  "Maize": { en: "Maize", hi: "मक्का" },
  "Garlic": { en: "Garlic", hi: "लहसुन" },
  "Ginger": { en: "Ginger", hi: "अदरक" },
  "Turmeric": { en: "Turmeric", hi: "हल्दी" },
  "Gram (Chana)": { en: "Gram (Chana)", hi: "चना" },
  "Rice": { en: "Rice", hi: "चावल (धान)" },
  "Sugarcane": { en: "Sugarcane", hi: "गन्ना" },
  "Pulses": { en: "Pulses", hi: "दालें (चना)" },
  "Seasonal Vegetables": { en: "Seasonal Vegetables", hi: "मौसमी सब्जियां" },
  "All": { en: "All", hi: "सभी फसलें" }
};

export const GRADE_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  "Grade A": { en: "Grade A (Premium)", hi: "ग्रेड A (उत्कृष्ट)" },
  "Grade B": { en: "Grade B (Standard)", hi: "ग्रेड B (मानक)" },
  "Grade C": { en: "Grade C (Processing)", hi: "ग्रेड C (औद्योगिक/प्रोसेसिंग)" },
  "All": { en: "All Grades", hi: "सभी ग्रेड" }
};

export const ORDER_STATUS_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  "PLACED": { en: "Order Placed", hi: "ऑर्डर दिया गया" },
  "CONFIRMED": { en: "Order Confirmed", hi: "स्वीकृत व आरक्षित" },
  "IN_TRANSIT": { en: "In Transit (Truck Dispatched)", hi: "पारगमन में (ट्रक रवाना)" },
  "DELIVERED": { en: "Delivered at Gate", hi: "सुपुर्द किया गया (गेट पर)" },
  "COMPLETED": { en: "Completed & Settled", hi: "सफलतापूर्वक पूर्ण" },
  "CANCELLED": { en: "Cancelled", hi: "रद्द किया गया" }
};

export const PAYMENT_STATUS_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  "PENDING": { en: "Payment Pending", hi: "भुगतान लंबित" },
  "ESCROW_HELD": { en: "Secured in Dual-Custody Escrow", hi: "एस्क्रो में सुरक्षित" },
  "ESCROW_LOCKED": { en: "Locked in Escrow Vault", hi: "एस्क्रो वॉल्ट में सुरक्षित" },
  "RELEASED_TO_FARMER": { en: "Direct Disbursed to Bank (Settled)", hi: "बैंक खाते में जमा (जारी)" },
  "RELEASED": { en: "Released to Bank", hi: "बैंक में जारी" },
  "REFUNDED_TO_BUYER": { en: "Refunded to Buyer", hi: "खरीदार को वापस" }
};

export const TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  // Brand & General
  "app.brandName": { en: "किसानSetu", hi: "किसानSetu" },
  "app.tagline": { en: "National Agricultural Digital Exchange", hi: "राष्ट्रीय कृषि डिजिटल एक्सचेंज" },
  "app.subTagline": { 
    en: "Connecting Verified Farm-Gates with Institutional Buyers", 
    hi: "सत्यापित खेत-खलिहान को सीधे थोक खरीदारों से जोड़ना" 
  },
  "app.loading": { en: "Connecting Verified Farm-Gates with Institutional Buyers...", hi: "सत्यापित खेत-खलिहान को सीधे थोक खरीदारों से जोड़ रहे हैं..." },
  "app.agriExchange": { en: "Agri-Exchange", hi: "कृषि-एक्सचेंज" },

  // Roles
  "role.farmer": { en: "Farmer / FPO Producer", hi: "किसान / एफपीओ उत्पादक" },
  "role.buyer": { en: "Institutional Wholesale Buyer", hi: "थोक खरीदार / कंपनी" },
  "role.farmerShort": { en: "Farmer", hi: "किसान" },
  "role.buyerShort": { en: "Buyer", hi: "खरीदार" },
  "role.producerPortal": { en: "Producer Portal", hi: "किसान पोर्टल" },
  "role.wholesaleDesk": { en: "Wholesale Desk", hi: "थोक खरीदार डेस्क" },
  "role.verifiedFarmer": { en: "Verified FPO Producer", hi: "सत्यापित एफपीओ किसान" },
  "role.verifiedBuyer": { en: "Verified Institutional Buyer", hi: "सत्यापित थोक खरीदार" },

  // Navigation & Header
  "nav.inventory": { en: "Farm Inventory", hi: "मेरी फसल व उपज" },
  "nav.buyerRequests": { en: "Buyer Demands (RFQs)", hi: "खरीदार मांग (RFQ)" },
  "nav.payouts": { en: "Payouts & Escrow", hi: "भुगतान व एस्क्रो" },
  "nav.mandiRates": { en: "Mandi Rates", hi: "लाइव मंडी भाव" },
  "nav.marketplace": { en: "Produce Marketplace", hi: "उपज मंडी बाज़ार" },
  "nav.bulkOrders": { en: "Bulk RFQs", hi: "थोक मांग" },
  "nav.contracts": { en: "Contracts Tracking", hi: "अनुबंध ट्रैकिंग" },
  "nav.payments": { en: "Payments & Escrow", hi: "भुगतान व एस्क्रो" },
  "nav.apiDocs": { en: "API & Microservices Architecture", hi: "एपीआई व आर्किटेक्चर" },
  "nav.loginOtp": { en: "Switch Account / Login with OTP", hi: "खाता बदलें / OTP लॉगिन" },
  "nav.signOut": { en: "Sign Out", hi: "लॉग आउट करें" },
  "nav.syncCatalog": { en: "Sync Baseline Mandi Catalog", hi: "मंडी डेटा सिंक करें" },
  "nav.listHarvest": { en: "List New Harvest", hi: "नई फसल जोड़ें" },
  "nav.postRfq": { en: "Post Bulk RFQ", hi: "थोक मांग भेजें" },
  "nav.searchPlaceholder": { en: "Search commodity, lot #, or APMC mandi...", hi: "फसल, लॉट संख्या या मंडी खोजें..." },
  "nav.notifications": { en: "Notifications", hi: "सूचनाएं" },
  "nav.language": { en: "Language", hi: "भाषा" },
  "nav.english": { en: "English", hi: "English" },
  "nav.hindi": { en: "Hindi", hi: "हिंदी" },

  // Common UI Elements
  "common.all": { en: "All", hi: "सभी" },
  "common.search": { en: "Search", hi: "खोजें" },
  "common.filter": { en: "Filter", hi: "फ़िल्टर" },
  "common.status": { en: "Status", hi: "स्थिति" },
  "common.quantity": { en: "Quantity", hi: "मात्रा" },
  "common.quintals": { en: "Quintals", hi: "क्विंटल" },
  "common.qtl": { en: "Qtl", hi: "क्विंटल" },
  "common.price": { en: "Price", hi: "मूल्य" },
  "common.perQuintal": { en: "per Quintal", hi: "प्रति क्विंटल" },
  "common.date": { en: "Date", hi: "दिनांक" },
  "common.location": { en: "Location", hi: "स्थान" },
  "common.actions": { en: "Actions", hi: "कार्रवाई" },
  "common.save": { en: "Save", hi: "सहेजें" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें" },
  "common.close": { en: "Close", hi: "बंद करें" },
  "common.submit": { en: "Submit", hi: "जमा करें" },
  "common.view": { en: "View", hi: "देखें" },
  "common.edit": { en: "Edit", hi: "संपादित करें" },
  "common.delete": { en: "Delete", hi: "हटाएं" },
  "common.confirm": { en: "Confirm", hi: "पुष्टि करें" },
  "common.organic": { en: "100% Certified Organic", hi: "100% जैविक प्रमाणित" },
  "common.nonOrganic": { en: "Conventional", hi: "पारंपरिक" },
  "common.grade": { en: "Quality Grade", hi: "गुणवत्ता ग्रेड" },
  "common.variety": { en: "Variety", hi: "किस्म" },
  "common.commodity": { en: "Crop / Commodity", hi: "फसल / उपज" },
  "common.active": { en: "Active", hi: "सक्रिय" },
  "common.trustScore": { en: "Trust Score", hi: "विश्वसनीयता स्कोर" },
  "common.verified": { en: "Verified", hi: "सत्यापित" },
  "common.escrowProtected": { en: "Escrow Protected", hi: "एस्क्रो संरक्षित" },
  "common.zeroCommission": { en: "0% Commission Deduction", hi: "0% बिचौलिया कटौती" },
  "common.instantPayout": { en: "Direct Bank Payout", hi: "सीधे बैंक खाते में भुगतान" },

  // Farmer - Inventory & Creation
  "farmer.inventoryTitle": { en: "Your Crop Inventory & Harvest Listings", hi: "आपकी फसल इन्वेंटरी व लिस्टिंग्स" },
  "farmer.inventorySubtitle": { 
    en: "Manage your commodity lots, track buyer order fulfillments, and publish new harvests directly with AI-guided fair pricing.", 
    hi: "अपनी उपज के लॉट प्रबंधित करें, खरीदार के ऑर्डर देखें और AI आधारित उचित मूल्य के साथ नई फसल लिस्ट करें।" 
  },
  "farmer.inventoryManagement": { en: "Crop Inventory Management", hi: "उपज इन्वेंटरी प्रबंधन" },
  "farmer.registeredLots": { en: "Registered Harvest Lots", hi: "सक्रिय फसल लिस्टिंग" },
  "farmer.listNewLot": { en: "List New Crop Lot", hi: "नई फसल लिस्ट करें" },
  "farmer.incomingOrders": { en: "Incoming Buyer Orders", hi: "आगामी खरीदार ऑर्डर" },
  "farmer.availableStock": { en: "Available for Direct Purchase", hi: "उपलब्ध उपज" },
  "farmer.harvestDate": { en: "Harvest Date", hi: "कटाई दिनांक" },
  "farmer.moisture": { en: "Moisture Content", hi: "नमी की मात्रा" },
  "farmer.expectedFarmgatePrice": { en: "Farm-Gate Price", hi: "खेत-खलिहान भाव" },
  "farmer.mandiBenchmark": { en: "APMC Mandi Rate", hi: "एपीएमसी मंडी भाव" },
  "farmer.farmerBenefit": { en: "Direct Benefit", hi: "किसान को सीधा लाभ" },
  "farmer.noListingsFound": { en: "No harvest lots match the criteria", hi: "कोई फसल लिस्टिंग नहीं मिली" },
  "farmer.noIncomingOrders": { en: "No incoming buyer orders yet", hi: "अभी कोई नया खरीदार ऑर्डर नहीं है" },
  "farmer.dispatchReady": { en: "Mark as Ready for Dispatch", hi: "रवानगी के लिए तैयार चिन्हित करें" },
  "farmer.orderCompleted": { en: "Delivery Verified & Paid", hi: "सुपुर्दगी सत्यापित व भुगतान पूर्ण" },

  // Farmer - Add Crop Lot Modal
  "farmerModal.title": { en: "List New Harvest Produce", hi: "नई फसल उपज दर्ज करें" },
  "farmerModal.subtitle": { en: "Publish your harvest lot directly to verified institutional buyers with AI benchmark pricing.", hi: "AI मंडी मूल्य मार्गदर्शन के साथ अपनी फसल सीधे सत्यापित खरीदारों को बेचें।" },
  "farmerModal.selectCrop": { en: "Select Commodity", hi: "फसल चुनें" },
  "farmerModal.selectVariety": { en: "Select Variety", hi: "किस्म चुनें" },
  "farmerModal.quantityQuintals": { en: "Available Quantity (Quintals)", hi: "उपलब्ध मात्रा (क्विंटल)" },
  "farmerModal.qualityGrade": { en: "Quality Assessment Grade", hi: "गुणवत्ता ग्रेड" },
  "farmerModal.gradeA_desc": { en: "Uniform shape/color, moisture <12%, zero damage (+10% premium)", hi: "समान आकार/रंग, नमी <12%, उत्तम गुणवत्ता (+10% प्रीमियम)" },
  "farmerModal.gradeB_desc": { en: "Standard market lot, moisture 12-14% (Mandi base)", hi: "मानक मंडी लॉट, नमी 12-14% (मंडी आधार मूल्य)" },
  "farmerModal.gradeC_desc": { en: "Minor size variations, suitable for processing", hi: "औद्योगिक व प्रोसेसिंग के लिए उपयुक्त" },
  "farmerModal.organicLabel": { en: "Certified Organic Produce (NPOP/Jaivik Bharat)", hi: "जैविक प्रमाणित फसल (जैविक भारत)" },
  "farmerModal.harvestDateLabel": { en: "Harvest Date", hi: "कटाई की तिथि" },
  "farmerModal.locationDistrict": { en: "Farm Location (District, State)", hi: "खेत का स्थान (जिला, राज्य)" },
  "farmerModal.aiPricingHeading": { en: "AI Mandi Fair Price Guidance", hi: "AI मंडी उचित मूल्य मार्गदर्शन" },
  "farmerModal.mandiBenchmark": { en: "Agmarknet APMC Modal Benchmark", hi: "एगमार्कनेट मंडी बेंचमार्क भाव" },
  "farmerModal.recommendedRange": { en: "Recommended Fair Price Range", hi: "सुझाया गया उचित मूल्य दायरा" },
  "farmerModal.expectedPriceLabel": { en: "Your Listing Price (₹ / Quintal)", hi: "आपका विक्रय मूल्य (₹ / क्विंटल)" },
  "farmerModal.submitListing": { en: "Publish Harvest to Marketplace", hi: "मार्केटप्लेस में फसल प्रकाशित करें" },

  // Farmer - Buyer Requests (RFQs)
  "farmerRfq.title": { en: "Active Buyer Demands (RFQs)", hi: "सक्रिय खरीदार मांग (RFQ)" },
  "farmerRfq.subtitle": { en: "Institutional buyers actively looking for direct farm-gate procurement with guaranteed escrow deposits.", hi: "सीधे खेत से खरीद के लिए थोक खरीदारों की सक्रिय मांग व एस्क्रो गारंटी।" },
  "farmerRfq.headerBadge": { en: "Direct Institutional Procurement", hi: "सीधी संस्थागत खरीद" },
  "farmerRfq.targetPrice": { en: "Buyer Target Price", hi: "खरीदार का लक्षित भाव" },
  "farmerRfq.requiredQty": { en: "Volume Required", hi: "आवश्यक मात्रा" },
  "farmerRfq.deliveryLocation": { en: "Delivery Hub", hi: "डिलीवरी स्थान" },
  "farmerRfq.urgency": { en: "Procurement Urgency", hi: "समय सीमा" },
  "farmerRfq.commitButton": { en: "Supply from Harvest", hi: "उपज से आपूर्ति करें" },
  "farmerRfq.commitModalTitle": { en: "Commit Supply to Buyer RFQ", hi: "खरीदार की मांग को आपूर्ति स्वीकृत करें" },
  "farmerRfq.commitQtyLabel": { en: "Quantity to Supply (Quintals)", hi: "आपूर्ति की मात्रा (क्विंटल)" },
  "farmerRfq.commitSuccess": { en: "Supply commitment submitted! Buyer notified.", hi: "आपूर्ति की पुष्टि सबमिट हो गई! खरीदार को सूचित कर दिया गया है।" },

  // Farmer - Payouts & Escrow
  "payouts.title": { en: "Direct Bank Settlements & Escrow Ledger", hi: "डायरेक्ट बैंक पेआउट्स व एस्क्रो लेज़र" },
  "payouts.subtitle": { en: "Dual-custody RBI-compliant escrow ensures zero payment defaults. Settlements disburse directly to your Kisan Credit bank account.", hi: "दोहरे नियंत्रण वाले एस्क्रो से 100% सुरक्षित भुगतान। गेट पर डिलीवरी सत्यापन होते ही बैंक खाते में सीधे ट्रांसफर।" },
  "payouts.totalReceived": { en: "Total Amount Received in Bank", hi: "बैंक खाते में कुल प्राप्त राशि" },
  "payouts.inEscrow": { en: "Funds in Active Escrow", hi: "सक्रिय एस्क्रो में सुरक्षित राशि" },
  "payouts.bankAccount": { en: "Linked Bank Account", hi: "संबद्ध बैंक खाता" },
  "payouts.payoutHistory": { en: "Direct Bank Settlement Transactions", hi: "बैंक भुगतान लेनदेन इतिहास" },
  "payouts.orderRef": { en: "Order Reference", hi: "ऑर्डर संदर्भ" },
  "payouts.amount": { en: "Settlement Amount", hi: "भुगतान राशि" },
  "payouts.utr": { en: "UTR / Reference #", hi: "UTR / संदर्भ संख्या" },
  "payouts.utrCopied": { en: "Copied!", hi: "कॉपी किया गया!" },

  // Farmer - Weather & Insights
  "weather.title": { en: "Harvest Weather Advisory & Mandi Price Insights", hi: "मौसम सलाह व मंडी भाव अंतर्दृष्टि" },
  "weather.subtitle": { en: "Real-time agro-meteorological forecasting paired with national Agmarknet price movements.", hi: "राष्ट्रीय एगमार्कनेट मंडी भाव और मौसम का वास्तविक पूर्वानुमान।" },
  "weather.forecast": { en: "5-Day Agro-Weather Forecast", hi: "5-दिवसीय कृषि मौसम पूर्वानुमान" },
  "weather.temp": { en: "Temperature", hi: "तापमान" },
  "weather.humidity": { en: "Humidity", hi: "नमी" },
  "weather.rainfall": { en: "Rainfall Probability", hi: "वर्षा की संभावना" },
  "weather.wind": { en: "Wind Speed", hi: "हवा की गति" },
  "weather.advisory": { en: "Farming Advisory", hi: "कृषि सलाह" },
  "weather.optimalHarvest": { en: "Optimal for field harvest and sun drying", hi: "कटाई और धूप में सुखाने के लिए उत्तम समय" },

  // Buyer - Identity & Marketplace
  "buyer.portalActive": { en: "Buyer Portal Active", hi: "खरीदार पोर्टल सक्रिय" },
  "buyer.purchasingSuite": { en: "Purchasing Suite (RBAC)", hi: "खरीदार टूल्स व नेविगेशन" },
  "buyer.escrowProtection": { en: "KisanEscrow Protection", hi: "किसान-एस्क्रो सुरक्षा" },
  "buyer.activeEscrow": { en: "Active in Escrow", hi: "एस्क्रो में सक्रिय" },
  "buyer.marketplaceTitle": { en: "Direct Farm-Gate Produce Marketplace", hi: "खेत-खलिहान उत्पाद मार्केटप्लेस" },
  "buyer.marketplaceSubtitle": { en: "Procure verified quality graded commodities directly from farmer FPOs with zero mandi brokerage.", hi: "बिना किसी बिचौलिए या आढ़ती कमीशन के सीधे किसान उत्पादक संगठनों (FPO) से गुणवत्ता-जांची उपज खरीदें।" },
  "buyer.directSourcingBadge": { en: "Direct Sourcing • 15–25% Lower Than Wholesale Mandi Markups", hi: "सीधी खरीद • थोक मंडियों की तुलना में 15–25% तक बचत" },
  "buyer.filterByCategory": { en: "Commodity Category", hi: "फसल श्रेणी" },
  "buyer.filterByGrade": { en: "Quality Grade", hi: "गुणवत्ता ग्रेड" },
  "buyer.organicOnly": { en: "Organic Only", hi: "केवल जैविक" },
  "buyer.maxPrice": { en: "Max Price", hi: "अधिकतम मूल्य" },
  "buyer.sortBy": { en: "Sort By", hi: "क्रमबद्ध करें" },
  "buyer.sortPriceLow": { en: "Price: Low to High", hi: "मूल्य: कम से अधिक" },
  "buyer.sortPriceHigh": { en: "Price: High to Low", hi: "मूल्य: अधिक से कम" },
  "buyer.sortRating": { en: "Farmer Trust Rating", hi: "किसान रेटिंग" },
  "buyer.sortQuantity": { en: "Available Quantity", hi: "उपलब्ध मात्रा" },
  "buyer.placeOrder": { en: "Place Direct Order", hi: "सीधा ऑर्डर दें" },
  "buyer.distance": { en: "Distance", hi: "दूरी" },
  "buyer.farmgateRate": { en: "Farm-Gate Rate", hi: "खेत का भाव" },
  "buyer.mandiComparison": { en: "APMC Mandi Rate", hi: "मंडी भाव" },
  "buyer.savings": { en: "Saving vs Mandi", hi: "मंडी से बचत" },
  "buyer.requestToBuy": { en: "Request to Buy / Send RFQ", hi: "खरीद अनुरोध / RFQ भेजें" },
  "buyer.viewDetails": { en: "View Crop Details", hi: "पूरी जानकारी देखें" },
  "buyer.backToMarketplace": { en: "Back to Crop Marketplace", hi: "मार्केटप्लेस पर वापस जाएं" },
  "buyer.minOrderQty": { en: "Min Order Qty (MOQ)", hi: "न्यूनतम ऑर्डर मात्रा (MOQ)" },
  "buyer.harvestDate": { en: "Harvest Date", hi: "कटाई की तिथि" },
  "buyer.availableStock": { en: "Available Quantity", hi: "उपलब्ध मात्रा" },
  "buyer.rfqModalTitle": { en: "Submit Request to Buy (RFQ)", hi: "खरीद अनुरोध (RFQ) सबमिट करें" },
  "buyer.reviewRfq": { en: "Review Procurement Terms", hi: "खरीद शर्तों की समीक्षा करें" },
  "buyer.submitRfq": { en: "Confirm & Send RFQ to Farmer", hi: "पुष्टि करें और किसान को RFQ भेजें" },
  "buyer.rfqSuccess": { en: "Purchase Request Sent Successfully!", hi: "खरीद अनुरोध सफलतापूर्वक भेजा गया!" },

  // Buyer - Bulk Orders & RFQ Posting
  "buyerBulk.title": { en: "Wholesale RFQs & Institutional Volume Sourcing", hi: "थोक मांग (RFQ) व संस्थागत खरीद" },
  "buyerBulk.subtitle": { en: "Broadcast bulk procurement demands directly to thousands of regional FPOs with tiered volume pricing.", hi: "क्षेत्रीय किसान उत्पादक संगठनों (FPO) को सीधे थोक मांग भेजें और रियायती दरों पर खरीद करें।" },
  "buyerBulk.calculatorHeading": { en: "Volume Discount Calculator", hi: "थोक डिस्काउंट कैलकुलेटर" },
  "buyerBulk.postRfqButton": { en: "Post New Procurement RFQ", hi: "नई थोक मांग (RFQ) पोस्ट करें" },
  "buyerBulk.activeRfqs": { en: "Your Active RFQs & Producer Responses", hi: "आपकी सक्रिय मांगें व किसान उत्तर" },
  "buyerBulk.targetRate": { en: "Target Buying Rate", hi: "लक्षित खरीद दर" },
  "buyerBulk.rfqCropLabel": { en: "Crop Commodity", hi: "फसल का नाम" },
  "buyerBulk.rfqVarietyLabel": { en: "Required Variety", hi: "वांछित किस्म" },
  "buyerBulk.rfqQtyLabel": { en: "Required Quantity (Quintals)", hi: "वांछित मात्रा (क्विंटल)" },
  "buyerBulk.rfqRateLabel": { en: "Max Target Price (₹ / Quintal)", hi: "अधिकतम लक्षित मूल्य (₹ / क्विंटल)" },
  "buyerBulk.rfqGradeLabel": { en: "Quality Standard", hi: "गुणवत्ता मानक" },
  "buyerBulk.rfqPincodeLabel": { en: "Delivery Pincode", hi: "डिलीवरी पिनकोड" },
  "buyerBulk.rfqAddressLabel": { en: "Delivery Hub Address", hi: "डिलीवरी हब का पता" },
  "buyerBulk.rfqUrgencyLabel": { en: "Procurement Urgency", hi: "समय सीमा" },
  "buyerBulk.rfqNotesLabel": { en: "Handling & Packaging Specifications", hi: "पैकिंग व हैंडलिंग निर्देश" },
  "buyerBulk.submitRfq": { en: "Broadcast RFQ to FPO Network", hi: "FPO नेटवर्क में RFQ प्रसारित करें" },
  "buyerBulk.rfqSuccess": { en: "RFQ broadcasted successfully to regional FPO networks!", hi: "थोक मांग (RFQ) सफलतापूर्वक प्रसारित हो गई!" },

  // Buyer - Contracts & Fleet Tracking
  "buyerContracts.title": { en: "Contract Management & Order Tracking", hi: "अनुबंध प्रबंधन व ऑर्डर ट्रैकिंग" },
  "buyerContracts.subtitle": { en: "Monitor real-time dispatch progress, inspect delivery lots, verify secret delivery OTPs, and manage institutional supply contracts.", hi: "रीयल-टाइम डिलीवरी प्रगति देखें, लॉट का निरीक्षण करें और 4-अंकीय OTP से सुरक्षित डिलीवरी सत्यापित करें।" },
  "buyerContracts.activeOrdersTab": { en: "Active Orders & Live Fleet", hi: "सक्रिय ऑर्डर व ट्रक ट्रैकिंग" },
  "buyerContracts.contractsTab": { en: "Digital Harvest Contracts", hi: "डिजिटल अनुबंध" },
  "buyerContracts.deliveryOtp": { en: "Secret Delivery OTP", hi: "गुप्त डिलीवरी OTP" },
  "buyerContracts.verifyOtpBtn": { en: "Verify Gate Receipt (Enter OTP)", hi: "गेट रसीद सत्यापित करें (OTP दर्ज करें)" },
  "buyerContracts.transitTracking": { en: "Transit Route & Telematics", hi: "मार्ग ट्रैकिंग" },
  "buyerContracts.modalTitle": { en: "Gate Receipt Inspection & Escrow Release", hi: "गेट डिलीवरी निरीक्षण व एस्क्रो रिलीज़" },
  "buyerContracts.enterOtpPrompt": { en: "Enter the 4-digit Delivery Verification OTP to confirm gate receipt and release payment to the farmer:", hi: "किसान को भुगतान जारी करने के लिए 4-अंकीय डिलीवरी सत्यापन OTP दर्ज करें:" },
  "buyerContracts.confirmOtp": { en: "Verify OTP & Release Escrow Funds", hi: "OTP सत्यापित करें और भुगतान जारी करें" },

  // Buyer - Payment & Escrow Desk
  "buyerEscrow.title": { en: "Dual-Custody Escrow Account & Wallet", hi: "सुरक्षित एस्क्रो खाता व वॉलेट" },
  "buyerEscrow.subtitle": { en: "All purchase payments are held in an RBI-compliant dual-custody escrow vault, protected against delivery defects and settling instantly to farmers upon gate receipt.", hi: "सभी भुगतान सुरक्षित एस्क्रो खाते में रहते हैं। डिलीवरी प्राप्त होते ही किसान को तत्काल हस्तांतरित हो जाते हैं।" },
  "buyerEscrow.walletBalance": { en: "Active Escrow Balance", hi: "सक्रिय एस्क्रो बैलेंस" },
  "buyerEscrow.totalSettled": { en: "Total Settled with Farmers", hi: "किसानों को कुल चुकाया गया" },
  "buyerEscrow.topupHeading": { en: "Deposit Funds into Escrow Vault", hi: "एस्क्रो खाते में राशि जमा करें" },
  "buyerEscrow.topupAmount": { en: "Deposit Amount (₹)", hi: "जमा राशि (₹)" },
  "buyerEscrow.selectPaymentMethod": { en: "Payment Method", hi: "भुगतान विधि" },
  "buyerEscrow.upiId": { en: "UPI Virtual Payment Address", hi: "UPI आईडी" },
  "buyerEscrow.topupBtn": { en: "Authorize & Deposit to Escrow", hi: "एस्क्रो में सुरक्षित जमा करें" },
  "buyerEscrow.topupSuccess": { en: "Escrow account successfully funded!", hi: "एस्क्रो खाते में राशि सफलतापूर्वक जमा हो गई!" },
  "buyerEscrow.invoiceTable": { en: "Order Invoices & Escrow Audit Trail", hi: "ऑर्डर चालान व एस्क्रो ऑडिट लेज़र" },
  "buyerEscrow.downloadReceipt": { en: "Download Invoice", hi: "चालान डाउनलोड करें" },

  // AI Pricing & Mandi Benchmark
  "pricing.title": { en: "Agmarknet APMC Mandi Benchmark & AI Pricing Engine", hi: "एगमार्कनेट APMC मंडी बेंचमार्क व AI मूल्य निर्धारण इंजन" },
  "pricing.subtitle": { en: "Calibrated daily against 2,400+ national APMC markets with quality spread multipliers and seasonal arrival cycles.", hi: "देश भर की 2,400+ मंडियों के लाइव भाव, गुणवत्ता ग्रेड और आवक चक्र के आधार पर विश्लेषित।" },
  "pricing.selectCrop": { en: "Select Commodity", hi: "फसल चुनें" },
  "pricing.selectGrade": { en: "Quality Grade", hi: "गुणवत्ता ग्रेड" },
  "pricing.selectVolume": { en: "Lot Volume (Quintals)", hi: "मात्रा (क्विंटल)" },
  "pricing.calculateBtn": { en: "Calculate Fair Farm-Gate Rate", hi: "उचित खेत-खलिहान भाव निकालें" },
  "pricing.mandiBenchmarkPrice": { en: "APMC Mandi Modal Benchmark", hi: "एपीएमसी मंडी आधार भाव" },
  "pricing.gradeUplift": { en: "Quality Grade Spread", hi: "गुणवत्ता प्रीमियम" },
  "pricing.recommendedSellingPrice": { en: "Recommended Fair Selling Price", hi: "सुझाया गया उचित विक्रय मूल्य" },
  "pricing.historicalTrends": { en: "12-Month Seasonality & Cyclical Price Index", hi: "12 माह का मौसमी मूल्य सूचकांक" },
  "pricing.stateMandiComparison": { en: "State APMC Mandi Modal Rates Comparison", hi: "राज्यवार एपीएमसी मंडी भाव तुलना" },

  // Orders and Payment Modal
  "orderModal.title": { en: "Place Direct Farm-Gate Order", hi: "सीधा खेत-खलिहान ऑर्डर दें" },
  "orderModal.orderSummary": { en: "Order Summary & Escrow Deposit", hi: "ऑर्डर विवरण व एस्क्रो जमा" },
  "orderModal.qtyToBuy": { en: "Quantity to Purchase (Quintals)", hi: "खरीद की मात्रा (क्विंटल)" },
  "orderModal.subtotal": { en: "Produce Farm-Gate Subtotal", hi: "उपज का कुल खेत मूल्य" },
  "orderModal.logisticsEst": { en: "Estimated Logistics & Cold-Chain", hi: "अनुमानित परिवहन व रसद" },
  "orderModal.escrowFee": { en: "Quality Escrow Protection Fee", hi: "गुणवत्ता एस्क्रो सुरक्षा शुल्क" },
  "orderModal.free": { en: "FREE (₹0)", hi: "मुफ़्त (₹0)" },
  "orderModal.totalDeposit": { en: "Total Escrow Deposit Payable", hi: "कुल देय एस्क्रो राशि" },
  "orderModal.deliveryAddress": { en: "Delivery Warehouse Address", hi: "डिलीवरी गोदाम का पता" },
  "orderModal.deliveryPincode": { en: "Destination Pincode", hi: "गंतव्य पिनकोड" },
  "orderModal.lockEscrowBtn": { en: "Deposit & Lock in Escrow", hi: "सुरक्षित एस्क्रो में जमा करें" },
  "orderModal.upiModalTitle": { en: "Complete Escrow Payment via UPI", hi: "UPI द्वारा सुरक्षित एस्क्रो भुगतान करें" },
  "orderModal.scanQr": { en: "Scan QR Code with any UPI App", hi: "किसी भी UPI ऐप से QR कोड स्कैन करें" },
  "orderModal.confirmUpiPayment": { en: "Confirm UPI Escrow Payment", hi: "UPI एस्क्रो भुगतान की पुष्टि करें" },
  "orderModal.orderSuccess": { en: "Order Placed & Escrow Funded Successfully!", hi: "ऑर्डर सफलतापूर्वक दर्ज व एस्क्रो सुरक्षित!" },

  // Footer
  "footer.description": { 
    en: "National direct farm-gate digital marketplace empowering smallholder farmers and FPOs with algorithmic mandi benchmarking, batched cold-chain routes, and dual-custody escrow.", 
    hi: "राष्ट्रीय प्रत्यक्ष कृषि डिजिटल मार्केटप्लेस जो किसानों और एफपीओ को एल्गोरिद्मिक मंडी भाव, कोल्ड-चेन परिवहन और दोहरे नियंत्रण वाले एस्क्रो से सशक्त बनाता है।" 
  },
  "footer.mission": {
    en: "Connecting farmers directly with buyers and building a transparent, efficient and sustainable agricultural marketplace.",
    hi: "किसानों को सीधे खरीदारों से जोड़कर एक पारदर्शी, कुशल और टिकाऊ कृषि बाज़ार का निर्माण।"
  },
  "footer.quickLinks": { en: "Quick Links", hi: "त्वरित लिंक" },
  "footer.home": { en: "Home", hi: "होम" },
  "footer.products": { en: "Products", hi: "उत्पाद" },
  "footer.aboutUs": { en: "About Us", hi: "हमारे बारे में" },
  "footer.contactUs": { en: "Contact Us", hi: "संपर्क करें" },
  "footer.forFarmers": { en: "For Farmers", hi: "किसानों के लिए" },
  "footer.sellProducts": { en: "Sell Products", hi: "उत्पाद बेचें" },
  "footer.findBuyers": { en: "Find Buyers", hi: "खरीदार खोजें" },
  "footer.trackOrders": { en: "Track Orders", hi: "ऑर्डर ट्रैक करें" },
  "footer.support": { en: "Support", hi: "सहायता" },
  "footer.contact": { en: "Contact Us", hi: "संपर्क करें" },
  "footer.india": { en: "India", hi: "भारत" },
  "footer.workingHours": { en: "Mon - Sat: 9:00 AM - 6:00 PM", hi: "सोम - शनि: प्रातः 9:00 - सायं 6:00" },
  "footer.rbacTitle": { en: "ROLE PORTALS (RBAC)", hi: "भूमिका पोर्टल (RBAC)" },
  "footer.farmerInventory": { en: "Farmer: Crop Inventory & Harvests", hi: "किसान: फसल इन्वेंटरी व उपज" },
  "footer.farmerRequests": { en: "Farmer: Active Buyer Demands (RFQs)", hi: "किसान: खरीदार मांग (RFQ)" },
  "footer.farmerPayouts": { en: "Farmer: Direct Bank Payout History", hi: "किसान: बैंक भुगतान इतिहास" },
  "footer.buyerMarketplace": { en: "Buyer: Produce Marketplace", hi: "खरीदार: उपज मार्केटप्लेस" },
  "footer.buyerBulk": { en: "Buyer: Bulk Orders & Volume Discounts", hi: "खरीदार: थोक मांग व छूट" },
  "footer.buyerContracts": { en: "Buyer: Contracts & Order Tracking", hi: "खरीदार: अनुबंध व ट्रैकिंग" },
  "footer.helplineTitle": { en: "HELPLINE & ESCROW DESK", hi: "हेल्पलाइन व एस्क्रो डेस्क" },
  "footer.tollFree": { en: "Kisan Toll-Free", hi: "किसान टोल-फ्री" },
  "footer.escrowDesk": { en: "Escrow Desk", hi: "एस्क्रो डेस्क" },
  "footer.operationalWindow": { en: "Operational Window", hi: "कार्यकाल समय" },
  "footer.hours": { en: "06:00 AM - 08:00 PM IST (Mon - Sat)", hi: "प्रातः 06:00 से सायं 08:00 बजे (सोम - शनि)" },
  "footer.status": { en: "99.98% Operational • Escrow Active", hi: "99.98% संचालित • एस्क्रो सक्रिय" },
  "footer.copyright": { en: "© 2026 किसानSetu. All Rights Reserved.", hi: "© 2026 किसानSetu. सर्वाधिकार सुरक्षित।" },
  "footer.terms": { en: "Terms of Agricultural Trade", hi: "कृषि व्यापार की शर्तें" },
  "footer.escrowPolicy": { en: "Escrow Protection Policy", hi: "एस्क्रो सुरक्षा नीति" },
  "footer.pricingDisclosure": { en: "Mandi Benchmark Disclosure", hi: "मंडी बेंचमार्क प्रकटीकरण" },
  "footer.activeSession": { en: "Active Session:", hi: "सक्रिय सत्र:" },
  "footer.roleBasedAccess": { en: "Role-Based Access Control", hi: "भूमिका आधारित अभिगम नियंत्रण (RBAC)" },
  "footer.dualCustody": { en: "Dual-Custody Escrow", hi: "दोहरा नियंत्रण एस्क्रो" },

  // Callouts & Pre-Footer Banner
  "prefooter.farmerHeadline": { en: "Maximize harvest profits with zero middleman deductions", hi: "बिना किसी बिचौलिया कटौती के अपनी फसल का अधिकतम मुनाफा पाएं" },
  "prefooter.buyerHeadline": { en: "Source Grade A agricultural commodities directly from farm-gates", hi: "सीधे खेत-खलिहान से उच्च गुणवत्ता वाली कृषि उपज खरीदें" },
  "prefooter.farmerBody": { 
    en: "Connect directly with verified institutional buyers, track buyer procurement demands, and receive guaranteed payouts in your bank account.", 
    hi: "सत्यापित थोक खरीदारों से सीधे जुड़ें, खरीदारों की मांग देखें और अपने बैंक खाते में गारंटीड भुगतान पाएं।" 
  },
  "prefooter.buyerBody": { 
    en: "Place bulk orders with up to 7% volume discounts, manage binding harvest contracts, and secure payments with dual-custody escrow.", 
    hi: "7% तक थोक छूट के साथ ऑर्डर दें, डिजिटल अनुबंध प्रबंधित करें और एस्क्रो से सुरक्षित भुगतान करें।" 
  },
  "prefooter.listHarvestBtn": { en: "List New Harvest Lot", hi: "नई फसल लिस्ट करें" },
  "prefooter.viewDemandsBtn": { en: "View Buyer Demands", hi: "खरीदार मांगें देखें" },
  "prefooter.exploreMarketplaceBtn": { en: "Explore Produce Marketplace", hi: "मार्केटप्लेस देखें" },
  "prefooter.postRfqBtn": { en: "Post Wholesale RFQ", hi: "थोक मांग (RFQ) भेजें" },
  "prefooter.directProducer": { en: "Direct Producer Exchange", hi: "प्रत्यक्ष किसान एक्सचेंज" },
  "prefooter.institutionalExchange": { en: "Institutional Wholesale Exchange", hi: "संस्थागत थोक एक्सचेंज" },

  // RBAC Access Restricted Banner
  "rbac.restrictedTitle": { en: "Access Restricted (RBAC Policy)", hi: "पहुंच प्रतिबंधित (RBAC नीति)" },
  "rbac.farmerRestricted": { en: "Purchasing features are restricted for Farmer accounts", hi: "खरीद संबंधी सुविधाएं किसान खातों के लिए प्रतिबंधित हैं" },
  "rbac.buyerRestricted": { en: "Vendor features are restricted for Buyer accounts", hi: "विक्रेता सुविधाएं खरीदार खातों के लिए प्रतिबंधित हैं" },
  "rbac.description": { 
    en: "To maintain an uncluttered experience and ensure security, producer tools and buyer portals are strictly segregated.", 
    hi: "सुरक्षा और स्पष्टता बनाए रखने के लिए किसान और खरीदार पोर्टल अलग-अलग रखे गए हैं।" 
  },
  "rbac.returnToFarmer": { en: "Return to Farmer Hub", hi: "किसान हब पर वापस जाएं" },
  "rbac.returnToBuyer": { en: "Return to Buyer Marketplace", hi: "खरीदार मार्केटप्लेस पर वापस जाएं" },
  "rbac.switchToBuyer": { en: "Switch to Buyer Portal", hi: "खरीदार पोर्टल पर जाएं" },
  "rbac.switchToFarmer": { en: "Switch to Farmer Portal", hi: "किसान पोर्टल पर जाएं" },

  // Authentication Flow
  "auth.welcomeBack": { en: "Welcome to किसानSetu 👋", hi: "किसानSetu में आपका स्वागत है 👋" },
  "auth.farmerSubtitle": { en: "Access your crop listings, pricing insights, and buyer requests.", hi: "अपनी फसल लिस्टिंग, मंडी भाव और खरीदार मांगों तक पहुंचें।" },
  "auth.buyerSubtitle": { en: "Discover fresh produce directly from verified farmers.", hi: "सत्यापित किसानों से सीधे ताज़ा कृषि उपज खरीदें।" },
  "auth.mobileNumber": { en: "Mobile Phone Number", hi: "मोबाइल फोन नंबर" },
  "auth.sendOtp": { en: "Send 4-Digit OTP", hi: "4-अंकीय OTP भेजें" },
  "auth.enterOtp": { en: "Enter Verification Code", hi: "सत्यापन कोड (OTP) दर्ज करें" },
  "auth.otpSentTo": { en: "We sent a 4-digit verification code to", hi: "हमने 4-अंकीय सत्यापन कोड भेजा है:" },
  "auth.verifyOtpBtn": { en: "Verify & Enter Platform", hi: "सत्यापित करें और प्रवेश करें" },
  "auth.resendOtp": { en: "Resend Code", hi: "पुनः कोड भेजें" },
  "auth.changePhone": { en: "Change Number", hi: "नंबर बदलें" },
  "auth.demoHelper": { en: "Demo: Enter any 4 digits (e.g. 1234)", hi: "डेमो: कोई भी 4 अंक दर्ज करें (उदा. 1234)" },
  "auth.googleLogin": { en: "Continue with Google", hi: "Google के साथ जारी रखें" },
  "auth.exploreMarketplace": { en: "Back to Platform", hi: "प्लेटफ़ॉर्म पर वापस जाएं" },
  "auth.secureDirectAccess": { en: "Secure Direct Access", hi: "सुरक्षित प्रत्यक्ष पहुंच" },
  "auth.featureZeroComm": { en: "0% Middleman Commission", hi: "0% बिचौलिया कमीशन" },
  "auth.featureZeroCommDesc": { en: "Direct farm-gate sales with zero middleman deductions.", hi: "बिना किसी बिचौलिए के सीधे खेत से बिक्री।" },
  "auth.featureEscrow": { en: "Instant Dual-Custody Escrow", hi: "गारंटीड एस्क्रो भुगतान" },
  "auth.featureEscrowDesc": { en: "Payments locked in RBI-compliant nodal escrow and released on OTP delivery.", hi: "डिलीवरी पर OTP सत्यापन के साथ तुरंत बैंक खाते में भुगतान।" },
  "auth.featureMandi": { en: "Agmarknet APMC Benchmarking", hi: "लाइव एगमार्कनेट मंडी भाव" },
  "auth.featureMandiDesc": { en: "AI algorithms benchmarking modal prices across 2,400+ mandis.", hi: "2,400+ मंडियों के लाइव भावों पर आधारित पारदर्शी मूल्य निर्धारण।" },
  "auth.featureLogistics": { en: "Batched Cold-Chain Logistics", hi: "समेकित कोल्ड-चेन परिवहन" },
  "auth.featureLogisticsDesc": { en: "Optimized route consolidation lowering transit costs by up to 25%.", hi: "परिवहन लागत में 25% तक की बचत।" },
  "auth.securedBy": { en: "Secured by Gov. of India AgriStack & Agmarknet", hi: "भारत सरकार के एग्रीस्टैक व एगमार्कनेट द्वारा सुरक्षित" }
};

export const DEFAULT_LANGUAGE: Language = "hi";
export const FALLBACK_LANGUAGE: Language = "hi";

/**
 * Retrieves the initial language preference, defaulting to Hindi ("hi")
 * when no user override has been explicitly saved.
 */
export function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("kisansetu_lang");
      if (saved === "en" || saved === "hi") {
        return saved;
      }
    } catch {
      // Ignore storage access restrictions
    }
  }
  return DEFAULT_LANGUAGE;
}

export function t(key: string, lang?: string | Language, defaultVal?: string): string {
  const currentLang: Language = (lang === "en") ? "en" : "hi";
  const item = TRANSLATIONS[key];
  if (item) {
    return item[currentLang] || item["hi"] || item["en"] || defaultVal || key;
  }
  return defaultVal || key;
}

export function translateCrop(cropName: string, lang?: string | Language): string {
  const currentLang: Language = (lang === "en") ? "en" : "hi";
  const match = CROP_TRANSLATIONS[cropName];
  if (match) {
    return match[currentLang] || match.hi || match.en;
  }
  return cropName;
}

export function translateGrade(grade: string, lang?: string | Language): string {
  const currentLang: Language = (lang === "en") ? "en" : "hi";
  const match = GRADE_TRANSLATIONS[grade];
  if (match) {
    return match[currentLang] || match.hi || match.en;
  }
  return grade;
}

export function translateOrderStatus(status: string, lang?: string | Language): string {
  const currentLang: Language = (lang === "en") ? "en" : "hi";
  const match = ORDER_STATUS_TRANSLATIONS[status];
  if (match) {
    return match[currentLang] || match.hi || match.en;
  }
  return status;
}

export function translatePaymentStatus(status: string, lang?: string | Language): string {
  const currentLang: Language = (lang === "en") ? "en" : "hi";
  const match = PAYMENT_STATUS_TRANSLATIONS[status];
  if (match) {
    return match[currentLang] || match.hi || match.en;
  }
  return status;
}

export function translateListingStatus(status: string, lang?: string | Language): string {
  const currentLang: Language = (lang === "en") ? "en" : "hi";
  const map: Record<string, { en: string; hi: string }> = {
    AVAILABLE: { en: "Available", hi: "उपलब्ध" },
    PARTIALLY_SOLD: { en: "Partially Sold", hi: "आंशिक रूप से बिका" },
    SOLD_OUT: { en: "Sold Out", hi: "समाप्त" },
    EXPIRED: { en: "Expired", hi: "समाप्त" }
  };
  const match = map[status];
  if (match) {
    return match[currentLang] || match.hi || match.en;
  }
  return status;
}

export const translateStatus = translateListingStatus;
