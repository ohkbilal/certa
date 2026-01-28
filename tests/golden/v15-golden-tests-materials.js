/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA GOLDEN TESTS - MATERIAL EXPANSION
 * GT-151 to GT-180 (30 Tests)
 * Parliament Session 4 - MAT-002
 * Testing 10 New PROVISIONAL Materials
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const TestUtils = {
  assertStrictEqual(actual, expected, msg) {
    if (actual !== expected) throw new Error(`${msg}: Expected "${expected}", got "${actual}"`);
  },
  assertIncludes(arr, value, msg) {
    if (!arr.includes(value)) throw new Error(`${msg}: Expected array to include "${value}"`);
  },
  assertNotIncludes(arr, value, msg) {
    if (arr.includes(value)) throw new Error(`${msg}: Expected array NOT to include "${value}"`);
  },
  assertTruthy(value, msg) {
    if (!value) throw new Error(`${msg}: Expected truthy, got "${value}"`);
  },
  assertFalsy(value, msg) {
    if (value) throw new Error(`${msg}: Expected falsy, got "${value}"`);
  },
  assertOneOf(actual, options, msg) {
    if (!options.includes(actual)) throw new Error(`${msg}: Expected one of [${options.join(',')}], got "${actual}"`);
  }
};

// Mock Material Engine for testing
const MaterialEngine = {
  evaluateMaterialCompatibility(materialId, regime, tempC) {
    const mat = materialId.toLowerCase();
    
    // ─────────────────────────────────────────────────────────────────────────
    // Monel-400 Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat.includes('monel')) {
      if (regime === 'FLUORIDE_ACID') return { status: 'CONDITIONAL', reason: 'Verify concentration and temperature' };
      if (regime === 'REDUCING_ACID') return { status: 'COMPATIBLE', reason: 'Excellent HCl/HBr resistance' };
      if (regime === 'OXIDIZING_ACID') return { status: 'FAIL', reason: 'Poor oxidizer resistance' };
      if (regime === 'HALOGENATED') return { status: 'COMPATIBLE', reason: 'Marine service suitable' };
      if (regime === 'STRONG_BASE') return { status: 'COMPATIBLE', reason: 'Good caustic resistance' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Inconel-625 Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat.includes('inconel')) {
      if (regime === 'HIGH_TEMP' || tempC > 500) return { status: 'COMPATIBLE', reason: 'Rated to 980°C' };
      if (regime === 'OXIDIZING_ACID') return { status: 'CONDITIONAL', reason: 'Better than Hastelloy-C' };
      if (regime === 'REDUCING_ACID') return { status: 'COMPATIBLE', reason: 'Mo content provides resistance' };
      if (regime === 'HALOGENATED') return { status: 'COMPATIBLE', reason: 'Excellent Cl SCC resistance' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Duplex-2205 Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat.includes('duplex')) {
      if (tempC < -50) return { status: 'FAIL', reason: 'Embrittlement below -50°C' };
      if (regime === 'HALOGENATED') return { status: 'COMPATIBLE', reason: 'Excellent Cl resistance' };
      if (regime === 'REDUCING_ACID') return { status: 'CONDITIONAL', reason: 'Limited HCl service' };
      if (regime === 'OXIDIZING_ACID') return { status: 'CONDITIONAL', reason: 'Limited HNO3 service' };
      if (regime === 'STRONG_BASE' && tempC > 80) return { status: 'FAIL', reason: 'Max 80°C in caustic' };
      if (regime === 'STRONG_BASE') return { status: 'CONDITIONAL', reason: 'Limit to 80°C' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Cast Iron Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat.includes('cast-iron') || mat.includes('castiron')) {
      if (regime === 'NEUTRAL' || regime === 'AQUEOUS_NON_HAZARDOUS') return { status: 'COMPATIBLE', reason: 'Water service OK' };
      if (regime === 'REDUCING_ACID') return { status: 'FAIL', reason: 'Rapid acid attack' };
      if (regime === 'OXIDIZING_ACID') return { status: 'FAIL', reason: 'Acid attack' };
      if (regime === 'HALOGENATED') return { status: 'FAIL', reason: 'Chloride attack' };
      if (regime === 'FLUORIDE_ACID') return { status: 'FAIL', reason: 'HF attack' };
      if (regime === 'STRONG_BASE') return { status: 'CONDITIONAL', reason: 'Forms protective film' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // PEEK Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat === 'peek') {
      if (regime === 'STRONG_BASE') return { status: 'FAIL', reason: 'Attacked by strong alkalis' };
      if (regime === 'HIGH_TEMP' || (tempC && tempC <= 250)) return { status: 'COMPATIBLE', reason: 'Rated to 250°C' };
      if (regime === 'OXIDIZING_ACID') return { status: 'CONDITIONAL', reason: 'Conc. HNO3 attacks' };
      if (regime === 'ORGANIC_SOLVENT') return { status: 'COMPATIBLE', reason: 'Most solvents OK' };
      if (regime === 'REDUCING_ACID') return { status: 'COMPATIBLE', reason: 'Good acid resistance' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // UHMWPE Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat === 'uhmwpe') {
      if (tempC > 80) return { status: 'FAIL', reason: 'Max temp 80°C' };
      if (regime === 'ABRASIVE_SLURRY') return { status: 'COMPATIBLE', reason: 'Excellent wear resistance' };
      if (regime === 'ORGANIC_SOLVENT') return { status: 'CONDITIONAL', reason: 'Swells in aromatics' };
      if (regime === 'OXIDIZING_ACID') return { status: 'CONDITIONAL', reason: 'Limited oxidizer resistance' };
      if (regime === 'AQUEOUS_CORROSIVE') return { status: 'COMPATIBLE', reason: 'Good chemical resistance' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // FRP Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat === 'frp' || mat === 'grp') {
      if (regime === 'FLUORIDE_ACID') return { status: 'FAIL', reason: 'HF attacks glass fiber' };
      if (tempC > 120) return { status: 'FAIL', reason: 'Max temp 120°C' };
      if (regime === 'HIGH_TEMP') return { status: 'FAIL', reason: 'Resin temp limit' };
      if (regime === 'OXIDIZING_ACID') return { status: 'COMPATIBLE', reason: 'Vinyl ester excellent' };
      if (regime === 'REDUCING_ACID') return { status: 'COMPATIBLE', reason: 'Good acid resistance' };
      if (regime === 'ORGANIC_SOLVENT') return { status: 'CONDITIONAL', reason: 'Resin dependent' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Neoprene Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat === 'neoprene' || mat === 'cr') {
      if (regime === 'OXIDIZING_ACID') return { status: 'FAIL', reason: 'Oxidizer attack' };
      if (regime === 'ORGANIC_SOLVENT') return { status: 'CONDITIONAL', reason: 'Oils OK, aromatics attack' };
      if (regime === 'PETROLEUM') return { status: 'COMPATIBLE', reason: 'Good oil resistance' };
      if (regime === 'AQUEOUS_CORROSIVE') return { status: 'COMPATIBLE', reason: 'Dilute acid OK' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Silicone Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat === 'silicone' || mat === 'vmq') {
      if (regime === 'PETROLEUM') return { status: 'FAIL', reason: 'Swells in oils' };
      if (regime === 'ORGANIC_SOLVENT') return { status: 'FAIL', reason: 'Most solvents attack' };
      if (regime === 'REDUCING_ACID') return { status: 'FAIL', reason: 'Poor acid resistance' };
      if (regime === 'HIGH_TEMP') return { status: 'COMPATIBLE', reason: 'Rated to 230°C' };
      if (regime === 'CRYOGENIC') return { status: 'COMPATIBLE', reason: 'Rated to -60°C' };
      if (regime === 'FOOD_PHARMA') return { status: 'COMPATIBLE', reason: 'FDA grades available' };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // PTFE-Encapsulated Logic
    // ─────────────────────────────────────────────────────────────────────────
    if (mat.includes('ptfe-encap') || mat.includes('encapsulated')) {
      // PTFE outer surface = universal resistance
      return { status: 'COMPATIBLE', reason: 'PTFE outer surface' };
    }
    
    return { status: 'UNKNOWN', reason: 'Material not in test database' };
  },
  
  isProvisional(materialId) {
    const provisional = ['monel-400', 'inconel-625', 'duplex-2205', 'cast-iron', 
                        'peek', 'uhmwpe', 'frp', 'neoprene', 'silicone', 'ptfe-encap'];
    return provisional.some(p => materialId.toLowerCase().includes(p.replace('-', '')));
  },
  
  getMaterialStatus(materialId) {
    return this.isProvisional(materialId) ? 'PROVISIONAL' : 'VERIFIED';
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION F: MATERIAL EXPANSION TESTS (GT-151 to GT-180)
// ═══════════════════════════════════════════════════════════════════════════════

const SECTION_F_MATERIAL_EXPANSION = [
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-151 to GT-153: Monel 400
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-151', 
    name: 'Monel-400 + HF → CONDITIONAL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Monel-400',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('monel-400', 'FLUORIDE_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'CONDITIONAL', 'Monel HF');
    }
  },
  { 
    id: 'GT-152', 
    name: 'Monel-400 + HCl → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Monel-400',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('monel-400', 'REDUCING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Monel HCl');
    }
  },
  { 
    id: 'GT-153', 
    name: 'Monel-400 + Oxidizer → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Monel-400',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('monel-400', 'OXIDIZING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Monel Oxidizer');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-154 to GT-156: Inconel 625
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-154', 
    name: 'Inconel-625 + High Temp → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Inconel-625',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('inconel-625', 'HIGH_TEMP', 800);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Inconel high temp');
    }
  },
  { 
    id: 'GT-155', 
    name: 'Inconel-625 + Oxidizer → CONDITIONAL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Inconel-625',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('inconel-625', 'OXIDIZING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'CONDITIONAL', 'Inconel oxidizer');
    }
  },
  { 
    id: 'GT-156', 
    name: 'Inconel-625 + Chloride → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Inconel-625',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('inconel-625', 'HALOGENATED', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Inconel Cl');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-157 to GT-159: Duplex 2205
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-157', 
    name: 'Duplex-2205 + Chloride → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Duplex-2205',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('duplex-2205', 'HALOGENATED', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Duplex Cl');
    }
  },
  { 
    id: 'GT-158', 
    name: 'Duplex-2205 + Cryogenic → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Duplex-2205',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('duplex-2205', 'CRYOGENIC', -60);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Duplex cryo');
    }
  },
  { 
    id: 'GT-159', 
    name: 'Duplex-2205 + Caustic hot → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Duplex-2205',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('duplex-2205', 'STRONG_BASE', 90);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Duplex hot caustic');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-160 to GT-162: Cast Iron
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-160', 
    name: 'Cast-Iron + Water → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Cast-Iron',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('cast-iron', 'NEUTRAL', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Cast Iron water');
    }
  },
  { 
    id: 'GT-161', 
    name: 'Cast-Iron + Acid → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Cast-Iron',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('cast-iron', 'REDUCING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Cast Iron acid');
    }
  },
  { 
    id: 'GT-162', 
    name: 'Cast-Iron + Chloride → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Cast-Iron',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('cast-iron', 'HALOGENATED', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Cast Iron Cl');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-163 to GT-165: PEEK
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-163', 
    name: 'PEEK + High Temp → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'PEEK',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('peek', 'HIGH_TEMP', 200);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'PEEK high temp');
    }
  },
  { 
    id: 'GT-164', 
    name: 'PEEK + Caustic → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'PEEK',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('peek', 'STRONG_BASE', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'PEEK caustic');
    }
  },
  { 
    id: 'GT-165', 
    name: 'PEEK + Solvent → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'PEEK',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('peek', 'ORGANIC_SOLVENT', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'PEEK solvent');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-166 to GT-168: UHMWPE
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-166', 
    name: 'UHMWPE + Abrasive → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'UHMWPE',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('uhmwpe', 'ABRASIVE_SLURRY', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'UHMWPE abrasive');
    }
  },
  { 
    id: 'GT-167', 
    name: 'UHMWPE + Hot → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'UHMWPE',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('uhmwpe', 'AQUEOUS_CORROSIVE', 90);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'UHMWPE hot');
    }
  },
  { 
    id: 'GT-168', 
    name: 'UHMWPE + Oxidizer → CONDITIONAL', 
    policyRef: 'V15 §17, Session 4',
    material: 'UHMWPE',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('uhmwpe', 'OXIDIZING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'CONDITIONAL', 'UHMWPE oxidizer');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-169 to GT-171: FRP/GRP
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-169', 
    name: 'FRP + Acid → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'FRP',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('frp', 'OXIDIZING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'FRP acid');
    }
  },
  { 
    id: 'GT-170', 
    name: 'FRP + HF → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'FRP',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('frp', 'FLUORIDE_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'FRP HF');
    }
  },
  { 
    id: 'GT-171', 
    name: 'FRP + High Temp → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'FRP',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('frp', 'HIGH_TEMP', 150);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'FRP high temp');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-172 to GT-174: Neoprene
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-172', 
    name: 'Neoprene + Oil → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Neoprene',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('neoprene', 'PETROLEUM', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Neoprene oil');
    }
  },
  { 
    id: 'GT-173', 
    name: 'Neoprene + Oxidizer → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Neoprene',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('neoprene', 'OXIDIZING_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Neoprene oxidizer');
    }
  },
  { 
    id: 'GT-174', 
    name: 'Neoprene + Solvent → CONDITIONAL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Neoprene',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('neoprene', 'ORGANIC_SOLVENT', 25);
      TestUtils.assertStrictEqual(result.status, 'CONDITIONAL', 'Neoprene solvent');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-175 to GT-177: Silicone
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-175', 
    name: 'Silicone + High Temp → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Silicone',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('silicone', 'HIGH_TEMP', 200);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Silicone high temp');
    }
  },
  { 
    id: 'GT-176', 
    name: 'Silicone + Oil → FAIL', 
    policyRef: 'V15 §17, Session 4',
    material: 'Silicone',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('silicone', 'PETROLEUM', 25);
      TestUtils.assertStrictEqual(result.status, 'FAIL', 'Silicone oil');
    }
  },
  { 
    id: 'GT-177', 
    name: 'Silicone + FDA → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'Silicone',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('silicone', 'FOOD_PHARMA', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'Silicone FDA');
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // GT-178 to GT-180: PTFE-Encapsulated
  // ─────────────────────────────────────────────────────────────────────────────
  { 
    id: 'GT-178', 
    name: 'PTFE-Encap + HF → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'PTFE-Encap',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('ptfe-encap', 'FLUORIDE_ACID', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'PTFE-Encap HF');
    }
  },
  { 
    id: 'GT-179', 
    name: 'PTFE-Encap + Caustic → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'PTFE-Encap',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('ptfe-encap', 'STRONG_BASE', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'PTFE-Encap caustic');
    }
  },
  { 
    id: 'GT-180', 
    name: 'PTFE-Encap + Solvent → COMPATIBLE', 
    policyRef: 'V15 §17, Session 4',
    material: 'PTFE-Encap',
    test: (E) => {
      const result = E.evaluateMaterialCompatibility('ptfe-encap', 'ORGANIC_SOLVENT', 25);
      TestUtils.assertStrictEqual(result.status, 'COMPATIBLE', 'PTFE-Encap solvent');
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// TEST RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

async function runMaterialExpansionTests(engine = MaterialEngine) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('CERTA MATERIAL EXPANSION TESTS - GT-151 to GT-180');
  console.log('Parliament Session 4 - MAT-002');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  let passed = 0, failed = 0;
  const failures = [];
  
  // Group by material
  const materials = ['Monel-400', 'Inconel-625', 'Duplex-2205', 'Cast-Iron', 
                    'PEEK', 'UHMWPE', 'FRP', 'Neoprene', 'Silicone', 'PTFE-Encap'];
  
  for (const mat of materials) {
    const tests = SECTION_F_MATERIAL_EXPANSION.filter(t => t.material === mat);
    console.log(`─── ${mat} (${tests.length} tests) ───`);
    
    for (const t of tests) {
      try {
        t.test(engine);
        passed++;
        console.log(`  ✓ ${t.id}: ${t.name}`);
      } catch (e) {
        failed++;
        console.log(`  ✗ ${t.id}: ${t.name}`);
        console.log(`      ${e.message}`);
        failures.push({ id: t.id, name: t.name, error: e.message });
      }
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('MATERIAL EXPANSION TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`  Total: 30 | Passed: ${passed} | Failed: ${failed} | Rate: ${((passed/30)*100).toFixed(1)}%\n`);
  
  if (failed === 0) {
    console.log('  ╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('  ║  ✓ ALL 30 MATERIAL TESTS PASSED - Materials can be promoted to VERIFIED  ║');
    console.log('  ╚═══════════════════════════════════════════════════════════════════════════╝');
  } else {
    console.log('  ╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('  ║  ✗ MATERIAL TESTS FAILED - Materials remain PROVISIONAL                  ║');
    console.log('  ╚═══════════════════════════════════════════════════════════════════════════╝\n');
    failures.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
  }
  
  return { total: 30, passed, failed, passRate: ((passed/30)*100).toFixed(1)+'%', failures, canPromote: failed === 0 };
}

module.exports = { 
  SECTION_F_MATERIAL_EXPANSION, 
  MaterialEngine, 
  TestUtils,
  runMaterialExpansionTests 
};

if (require.main === module) { 
  runMaterialExpansionTests().then(r => process.exit(r.failed > 0 ? 1 : 0)); 
}
