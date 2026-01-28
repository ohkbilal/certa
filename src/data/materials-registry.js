/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA MATERIALS DATA MODEL - EXPANSION
 * Parliament Session 4 - MAT-001
 * 10 New Industrial Materials (PROVISIONAL Status)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Material Status Enum
const MaterialStatus = {
  VERIFIED: 'VERIFIED',
  PROVISIONAL: 'PROVISIONAL',
  DEPRECATED: 'DEPRECATED'
};

// Material Type Enum
const MaterialType = {
  METAL: 'Metal',
  PLASTIC: 'Plastic',
  ELASTOMER: 'Elastomer',
  COMPOSITE: 'Composite'
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXISTING 16 MATERIALS (VERIFIED)
// ═══════════════════════════════════════════════════════════════════════════════

const EXISTING_MATERIALS = {
  // Metals (6)
  '316SS': { id: '316SS', name: '316 Stainless Steel', type: MaterialType.METAL, status: MaterialStatus.VERIFIED },
  '304SS': { id: '304SS', name: '304 Stainless Steel', type: MaterialType.METAL, status: MaterialStatus.VERIFIED },
  'Hastelloy-C': { id: 'Hastelloy-C', name: 'Hastelloy C-276', type: MaterialType.METAL, status: MaterialStatus.VERIFIED },
  'Titanium': { id: 'Titanium', name: 'Titanium Grade 2', type: MaterialType.METAL, status: MaterialStatus.VERIFIED },
  'Carbon-Steel': { id: 'Carbon-Steel', name: 'Carbon Steel', type: MaterialType.METAL, status: MaterialStatus.VERIFIED },
  'Aluminum': { id: 'Aluminum', name: 'Aluminum', type: MaterialType.METAL, status: MaterialStatus.VERIFIED },
  
  // Plastics (6)
  'PTFE': { id: 'PTFE', name: 'PTFE (Teflon)', type: MaterialType.PLASTIC, status: MaterialStatus.VERIFIED },
  'PVDF': { id: 'PVDF', name: 'PVDF (Kynar)', type: MaterialType.PLASTIC, status: MaterialStatus.VERIFIED },
  'PP': { id: 'PP', name: 'Polypropylene', type: MaterialType.PLASTIC, status: MaterialStatus.VERIFIED },
  'PVC': { id: 'PVC', name: 'PVC', type: MaterialType.PLASTIC, status: MaterialStatus.VERIFIED },
  'CPVC': { id: 'CPVC', name: 'CPVC', type: MaterialType.PLASTIC, status: MaterialStatus.VERIFIED },
  'HDPE': { id: 'HDPE', name: 'HDPE', type: MaterialType.PLASTIC, status: MaterialStatus.VERIFIED },
  
  // Elastomers (4)
  'FKM': { id: 'FKM', name: 'Viton (FKM)', type: MaterialType.ELASTOMER, status: MaterialStatus.VERIFIED },
  'EPDM': { id: 'EPDM', name: 'EPDM', type: MaterialType.ELASTOMER, status: MaterialStatus.VERIFIED },
  'NBR': { id: 'NBR', name: 'Nitrile (Buna-N)', type: MaterialType.ELASTOMER, status: MaterialStatus.VERIFIED },
  'Kalrez': { id: 'Kalrez', name: 'Kalrez (FFKM)', type: MaterialType.ELASTOMER, status: MaterialStatus.VERIFIED }
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW 10 MATERIALS (PROVISIONAL) - Parliament Session 4
// ═══════════════════════════════════════════════════════════════════════════════

const NEW_MATERIALS = {
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-1: Monel 400
  // ─────────────────────────────────────────────────────────────────────────────
  'Monel-400': {
    id: 'Monel-400',
    name: 'Monel 400',
    type: MaterialType.METAL,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: '67% Ni, 30% Cu, 2% Fe, 1% Mn',
    
    industryUse: [
      'Seawater/marine applications',
      'Hydrofluoric acid service',
      'Reducing acids (HCl, H2SO4)',
      'Alkaline environments'
    ],
    
    regimeBehavior: {
      'FLUORIDE_ACID': 'CONDITIONAL',
      'REDUCING_ACID': 'COMPATIBLE',
      'HALOGENATED': 'COMPATIBLE',
      'STRONG_BASE': 'COMPATIBLE',
      'OXIDIZING_ACID': 'FAIL',
      'AQUEOUS_CORROSIVE': 'COMPATIBLE',
      'ORGANIC_SOLVENT': 'COMPATIBLE'
    },
    
    temperatureLimits: {
      max: 480,  // °C continuous
      min: -200  // °C (cryogenic capable)
    },
    
    failureModes: [
      { mode: 'Sulfur attack', trigger: 'High temp + sulfur compounds', severity: 'HIGH' },
      { mode: 'Oxidizer corrosion', trigger: 'HNO3, oxidizing conditions', severity: 'HIGH' },
      { mode: 'Mercury embrittlement', trigger: 'Mercury contact', severity: 'CRITICAL' }
    ],
    
    references: [
      'Special Metals Corporation Technical Bulletin',
      'NACE Corrosion Data Survey',
      "Perry's Chemical Engineers' Handbook 9th Ed. Table 28-6"
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-2: Inconel 625
  // ─────────────────────────────────────────────────────────────────────────────
  'Inconel-625': {
    id: 'Inconel-625',
    name: 'Inconel 625',
    type: MaterialType.METAL,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: '58% Ni, 20-23% Cr, 8-10% Mo, 3-4% Nb',
    
    industryUse: [
      'High-temperature service (up to 980°C)',
      'Oxidizing and reducing acids',
      'Chloride stress cracking resistance',
      'Nuclear and aerospace applications'
    ],
    
    regimeBehavior: {
      'HIGH_TEMP': 'COMPATIBLE',
      'OXIDIZING_ACID': 'CONDITIONAL',
      'REDUCING_ACID': 'COMPATIBLE',
      'HALOGENATED': 'COMPATIBLE',
      'STRONG_BASE': 'COMPATIBLE',
      'AQUEOUS_CORROSIVE': 'COMPATIBLE'
    },
    
    temperatureLimits: {
      max: 980,  // °C
      min: -200  // °C
    },
    
    failureModes: [
      { mode: 'Sensitization', trigger: '650-850°C prolonged exposure', severity: 'MEDIUM' },
      { mode: 'Carburization', trigger: 'Carbon-rich environments', severity: 'MEDIUM' },
      { mode: 'Sigma phase', trigger: '600-900°C prolonged', severity: 'HIGH' }
    ],
    
    references: [
      'Special Metals INCONEL alloy 625 datasheet',
      'ASM Handbook Vol. 13B',
      'NACE MR0175/ISO 15156'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-3: Duplex 2205
  // ─────────────────────────────────────────────────────────────────────────────
  'Duplex-2205': {
    id: 'Duplex-2205',
    name: 'Duplex 2205 (UNS S32205)',
    type: MaterialType.METAL,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: '22% Cr, 5% Ni, 3% Mo, 0.15% N',
    
    industryUse: [
      'Oil & gas production',
      'Chemical tankers',
      'Pulp & paper',
      'Desalination plants'
    ],
    
    regimeBehavior: {
      'HALOGENATED': 'COMPATIBLE',
      'AQUEOUS_CORROSIVE': 'COMPATIBLE',
      'ORGANIC_SOLVENT': 'COMPATIBLE',
      'REDUCING_ACID': 'CONDITIONAL',
      'OXIDIZING_ACID': 'CONDITIONAL',
      'STRONG_BASE': 'CONDITIONAL'
    },
    
    temperatureLimits: {
      max: 300,  // °C
      min: -50   // °C (embrittlement below)
    },
    
    failureModes: [
      { mode: 'Low-temp embrittlement', trigger: 'Below -50°C', severity: 'HIGH' },
      { mode: 'Sigma phase', trigger: '600-950°C', severity: 'CRITICAL' },
      { mode: '475°C embrittlement', trigger: '300-550°C prolonged', severity: 'HIGH' }
    ],
    
    references: [
      'IMOA Practical Guidelines for Fabrication of Duplex SS',
      'Outokumpu Corrosion Handbook',
      'NACE Publication 1F192'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-4: Cast Iron (Ductile)
  // ─────────────────────────────────────────────────────────────────────────────
  'Cast-Iron': {
    id: 'Cast-Iron',
    name: 'Ductile Cast Iron',
    type: MaterialType.METAL,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: '3-4% C (nodular graphite), 2-3% Si, balance Fe',
    
    industryUse: [
      'Water/wastewater pumps',
      'Low-pressure piping',
      'Valve bodies',
      'Pump casings'
    ],
    
    regimeBehavior: {
      'AQUEOUS_NON_HAZARDOUS': 'COMPATIBLE',
      'NEUTRAL': 'COMPATIBLE',
      'STRONG_BASE': 'CONDITIONAL',
      'REDUCING_ACID': 'FAIL',
      'OXIDIZING_ACID': 'FAIL',
      'HALOGENATED': 'FAIL',
      'FLUORIDE_ACID': 'FAIL'
    },
    
    temperatureLimits: {
      max: 350,  // °C
      min: -30   // °C
    },
    
    failureModes: [
      { mode: 'Graphitic corrosion', trigger: 'Long-term water service', severity: 'MEDIUM' },
      { mode: 'Acid attack', trigger: 'All acids', severity: 'CRITICAL' },
      { mode: 'Chloride pitting', trigger: 'Chloride exposure', severity: 'HIGH' },
      { mode: 'Galvanic corrosion', trigger: 'Copper alloy contact', severity: 'MEDIUM' }
    ],
    
    references: [
      'Ductile Iron Society Guidelines',
      'AWWA C151 (Ductile Iron Pipe)',
      'ASM Handbook Vol. 1'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-5: PEEK
  // ─────────────────────────────────────────────────────────────────────────────
  'PEEK': {
    id: 'PEEK',
    name: 'PEEK (Polyetheretherketone)',
    type: MaterialType.PLASTIC,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: 'Aromatic polyketone thermoplastic',
    
    industryUse: [
      'Pharmaceutical processing',
      'Semiconductor manufacturing',
      'High-temp polymer applications',
      'Bearing/seal materials'
    ],
    
    regimeBehavior: {
      'HIGH_TEMP': 'COMPATIBLE',
      'OXIDIZING_ACID': 'CONDITIONAL',
      'REDUCING_ACID': 'COMPATIBLE',
      'ORGANIC_SOLVENT': 'COMPATIBLE',
      'STRONG_BASE': 'FAIL',
      'HALOGENATED': 'COMPATIBLE'
    },
    
    temperatureLimits: {
      max: 250,  // °C continuous
      min: -60   // °C
    },
    
    failureModes: [
      { mode: 'Concentrated acid attack', trigger: 'Conc. H2SO4, conc. HNO3', severity: 'HIGH' },
      { mode: 'Caustic degradation', trigger: 'Strong alkalis', severity: 'HIGH' },
      { mode: 'UV degradation', trigger: 'Outdoor exposure', severity: 'MEDIUM' }
    ],
    
    references: [
      'Victrex PEEK Polymer Properties Guide',
      'Röchling Engineering Plastics Guide',
      "Perry's Chemical Engineers' Handbook 9th Ed."
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-6: UHMWPE
  // ─────────────────────────────────────────────────────────────────────────────
  'UHMWPE': {
    id: 'UHMWPE',
    name: 'UHMWPE (Ultra-High MW Polyethylene)',
    type: MaterialType.PLASTIC,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: 'Polyethylene with MW 3.5-7.5 million',
    
    industryUse: [
      'Slurry piping',
      'Wear-resistant linings',
      'Material handling equipment',
      'Mining applications'
    ],
    
    regimeBehavior: {
      'ABRASIVE_SLURRY': 'COMPATIBLE',
      'AQUEOUS_CORROSIVE': 'COMPATIBLE',
      'REDUCING_ACID': 'COMPATIBLE',
      'STRONG_BASE': 'COMPATIBLE',
      'ORGANIC_SOLVENT': 'CONDITIONAL',
      'OXIDIZING_ACID': 'CONDITIONAL'
    },
    
    temperatureLimits: {
      max: 80,   // °C
      min: -200  // °C (excellent cryogenic)
    },
    
    failureModes: [
      { mode: 'Thermal softening', trigger: '>80°C', severity: 'HIGH' },
      { mode: 'Hydrocarbon swelling', trigger: 'Aromatics, chlorinated solvents', severity: 'MEDIUM' },
      { mode: 'Oxidizer attack', trigger: 'Strong oxidizers', severity: 'MEDIUM' },
      { mode: 'UV degradation', trigger: 'Outdoor exposure', severity: 'MEDIUM' },
      { mode: 'Creep', trigger: 'Sustained load', severity: 'MEDIUM' }
    ],
    
    references: [
      'Celanese GUR UHMWPE Technical Data',
      'Quadrant Engineering Plastics Guide',
      'Plastics Design Library Chemical Resistance'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-7: FRP/GRP
  // ─────────────────────────────────────────────────────────────────────────────
  'FRP': {
    id: 'FRP',
    name: 'FRP/GRP (Vinyl Ester)',
    type: MaterialType.COMPOSITE,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: 'Glass fiber + Vinyl Ester resin',
    
    industryUse: [
      'Chemical storage tanks',
      'Scrubbers and ducts',
      'Piping systems',
      'Corrosive fume handling'
    ],
    
    regimeBehavior: {
      'OXIDIZING_ACID': 'COMPATIBLE',
      'REDUCING_ACID': 'COMPATIBLE',
      'HALOGENATED': 'COMPATIBLE',
      'STRONG_BASE': 'CONDITIONAL',
      'ORGANIC_SOLVENT': 'CONDITIONAL',
      'HIGH_TEMP': 'FAIL',
      'FLUORIDE_ACID': 'FAIL'
    },
    
    temperatureLimits: {
      max: 120,  // °C (resin dependent)
      min: -40   // °C
    },
    
    failureModes: [
      { mode: 'Resin degradation', trigger: 'Certain solvents', severity: 'HIGH' },
      { mode: 'Glass fiber exposure', trigger: 'Wicking from damage', severity: 'MEDIUM' },
      { mode: 'UV degradation', trigger: 'Without gel coat', severity: 'MEDIUM' },
      { mode: 'HF attack', trigger: 'Hydrofluoric acid', severity: 'CRITICAL' }
    ],
    
    references: [
      'ASME RTP-1 (Reinforced Thermoset Plastic)',
      'Ashland Derakane Epoxy Vinyl Ester Guide',
      'FRP Institute Design Manual'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-8: Neoprene
  // ─────────────────────────────────────────────────────────────────────────────
  'Neoprene': {
    id: 'Neoprene',
    name: 'Neoprene (CR)',
    type: MaterialType.ELASTOMER,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: 'Polychloroprene rubber',
    
    industryUse: [
      'Refrigerant seals',
      'Oil-resistant gaskets',
      'Weather-resistant applications',
      'Moderate chemical service'
    ],
    
    regimeBehavior: {
      'ORGANIC_SOLVENT': 'CONDITIONAL',
      'AQUEOUS_CORROSIVE': 'COMPATIBLE',
      'REDUCING_ACID': 'CONDITIONAL',
      'OXIDIZING_ACID': 'FAIL',
      'STRONG_BASE': 'CONDITIONAL',
      'PETROLEUM': 'COMPATIBLE'
    },
    
    temperatureLimits: {
      max: 100,  // °C
      min: -35   // °C
    },
    
    failureModes: [
      { mode: 'Oxidizer attack', trigger: 'Strong oxidizers', severity: 'HIGH' },
      { mode: 'Aromatic solvent attack', trigger: 'Toluene, xylene', severity: 'HIGH' },
      { mode: 'Low-temp hardening', trigger: 'Below -35°C', severity: 'MEDIUM' },
      { mode: 'Ketone/ester swelling', trigger: 'MEK, acetone', severity: 'MEDIUM' }
    ],
    
    references: [
      'DuPont Neoprene Technical Guide',
      'Parker O-Ring Handbook',
      'Rubber Manufacturers Association'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-9: Silicone
  // ─────────────────────────────────────────────────────────────────────────────
  'Silicone': {
    id: 'Silicone',
    name: 'Silicone (VMQ)',
    type: MaterialType.ELASTOMER,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: 'Vinyl Methyl Silicone rubber',
    
    industryUse: [
      'High/low temperature seals',
      'Food & pharmaceutical',
      'Medical devices',
      'Electrical insulation'
    ],
    
    regimeBehavior: {
      'HIGH_TEMP': 'COMPATIBLE',
      'CRYOGENIC': 'COMPATIBLE',
      'FOOD_PHARMA': 'COMPATIBLE',
      'AQUEOUS_NON_HAZARDOUS': 'COMPATIBLE',
      'PETROLEUM': 'FAIL',
      'ORGANIC_SOLVENT': 'FAIL',
      'REDUCING_ACID': 'FAIL'
    },
    
    temperatureLimits: {
      max: 230,  // °C
      min: -60   // °C
    },
    
    failureModes: [
      { mode: 'Oil/fuel swelling', trigger: 'Petroleum products', severity: 'HIGH' },
      { mode: 'Acid attack', trigger: 'Concentrated acids', severity: 'HIGH' },
      { mode: 'Low tear strength', trigger: 'Dynamic applications', severity: 'MEDIUM' }
    ],
    
    references: [
      'Dow Corning Silicone Elastomers Guide',
      'Wacker Elastosil Technical Data',
      'ISO 1629 (Rubber Nomenclature)'
    ]
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // M-NEW-10: PTFE-Encapsulated
  // ─────────────────────────────────────────────────────────────────────────────
  'PTFE-Encap': {
    id: 'PTFE-Encap',
    name: 'PTFE-Encapsulated O-Ring',
    type: MaterialType.ELASTOMER,
    status: MaterialStatus.PROVISIONAL,
    addedSession: 'Parliament Session 4',
    addedDate: '2026-01-28',
    
    composition: 'PTFE jacket over FKM or Silicone core',
    
    industryUse: [
      'Pharmaceutical processing',
      'Semiconductor manufacturing',
      'Food processing',
      'Aggressive chemical service'
    ],
    
    regimeBehavior: {
      // PTFE outer surface provides universal resistance
      'OXIDIZING_ACID': 'COMPATIBLE',
      'REDUCING_ACID': 'COMPATIBLE',
      'FLUORIDE_ACID': 'COMPATIBLE',
      'STRONG_BASE': 'COMPATIBLE',
      'ORGANIC_SOLVENT': 'COMPATIBLE',
      'HALOGENATED': 'COMPATIBLE',
      'FOOD_PHARMA': 'COMPATIBLE'
    },
    
    temperatureLimits: {
      max: 200,  // °C (limited by core)
      min: -60   // °C
    },
    
    failureModes: [
      { mode: 'Core degradation', trigger: 'Jacket breach + aggressive chemical', severity: 'CRITICAL' },
      { mode: 'Limited compression', trigger: 'Stiffer than solid elastomer', severity: 'LOW' },
      { mode: 'High-pressure dynamic failure', trigger: 'Not for high-pressure dynamic service', severity: 'MEDIUM' }
    ],
    
    references: [
      'Marco Rubber & Plastics Technical Guide',
      'Parker Compound Selection Guide',
      'ASTM D1418 (Rubber Classification)'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE MATERIALS REGISTRY (26 Materials)
// ═══════════════════════════════════════════════════════════════════════════════

const MATERIALS_REGISTRY = {
  ...EXISTING_MATERIALS,
  ...NEW_MATERIALS
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getMaterial(id) {
  return MATERIALS_REGISTRY[id] || null;
}

function getMaterialsByType(type) {
  return Object.values(MATERIALS_REGISTRY).filter(m => m.type === type);
}

function getMaterialsByStatus(status) {
  return Object.values(MATERIALS_REGISTRY).filter(m => m.status === status);
}

function getProvisionalMaterials() {
  return getMaterialsByStatus(MaterialStatus.PROVISIONAL);
}

function getVerifiedMaterials() {
  return getMaterialsByStatus(MaterialStatus.VERIFIED);
}

function getAllMaterialIds() {
  return Object.keys(MATERIALS_REGISTRY);
}

function getMaterialCount() {
  return Object.keys(MATERIALS_REGISTRY).length;
}

function getRegimeBehavior(materialId, regime) {
  const material = getMaterial(materialId);
  if (!material || !material.regimeBehavior) return 'UNKNOWN';
  return material.regimeBehavior[regime] || 'UNKNOWN';
}

function isProvisional(materialId) {
  const material = getMaterial(materialId);
  return material?.status === MaterialStatus.PROVISIONAL;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  MaterialStatus,
  MaterialType,
  EXISTING_MATERIALS,
  NEW_MATERIALS,
  MATERIALS_REGISTRY,
  getMaterial,
  getMaterialsByType,
  getMaterialsByStatus,
  getProvisionalMaterials,
  getVerifiedMaterials,
  getAllMaterialIds,
  getMaterialCount,
  getRegimeBehavior,
  isProvisional
};
