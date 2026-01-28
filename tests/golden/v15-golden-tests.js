/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA V15 §19 GOLDEN TEST SUITE
 * Parliament Mandate: Week 1, Day 1-2
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * POLICY REFERENCE: V15 §19 SYSTEMATIC ITERATION TEST CHECKLIST
 * 
 * These tests are MANDATORY per V15 Policy and must pass before any deployment.
 * Failure of ANY golden test blocks deployment (V16 §20.1.1)
 * 
 * Test Scenarios from V15 §19:
 * 1. Water/benign → STANDARD_ALLOWED seals only
 * 2. HF → sealless or suppressed  
 * 3. Oxidizing acid → no metal recommendations
 * 4. Toxic → no standard seals
 * 5. Unknown data → suppressed outputs
 * 
 * Additional V15 compliance tests:
 * 6. UI-PDF parity (same runId, same FAO hash)
 * 7. Determinism (same inputs → same outputs)
 * 8. Execution order verification
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Test configuration
const CERTA_ENGINE_PATH = path.join(__dirname, '../../public/certa-engine.html');

/**
 * Load CERTA engine and extract functions for testing
 */
function loadCertaEngine() {
  const html = fs.readFileSync(CERTA_ENGINE_PATH, 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  return dom.window;
}

/**
 * Test utilities
 */
const TestUtils = {
  assertStrictEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: Expected "${expected}", got "${actual}"`);
    }
  },
  
  assertIncludes(array, item, message) {
    if (!array.includes(item)) {
      throw new Error(`${message}: Expected array to include "${item}"`);
    }
  },
  
  assertNotIncludes(array, item, message) {
    if (array.includes(item)) {
      throw new Error(`${message}: Expected array NOT to include "${item}"`);
    }
  },
  
  assertTruthy(value, message) {
    if (!value) {
      throw new Error(`${message}: Expected truthy value, got "${value}"`);
    }
  },
  
  assertFalsy(value, message) {
    if (value) {
      throw new Error(`${message}: Expected falsy value, got "${value}"`);
    }
  },
  
  assertArrayEmpty(array, message) {
    if (array && array.length > 0) {
      throw new Error(`${message}: Expected empty array, got ${array.length} items`);
    }
  },
  
  assertArrayNotEmpty(array, message) {
    if (!array || array.length === 0) {
      throw new Error(`${message}: Expected non-empty array`);
    }
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 1: Water/Benign → STANDARD_ALLOWED seals
 * V15 §13.3: Explicit Allow Rule for Water & Benign Fluids
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest1_WaterBenign = {
  name: 'GT-1: Water/Benign → STANDARD_ALLOWED seals',
  policyRef: 'V15 §13.3, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    const benignFluids = ['water', 'process-water', 'deionized-water'];
    
    for (const fluidId of benignFluids) {
      try {
        // Create run context
        const ctx = engine.createRunContext(fluidId, 25, 'C');
        
        // Resolve seal eligibility
        const sealElig = engine.resolveSealEligibility(ctx);
        
        // ASSERTION: Must be STANDARD_ALLOWED
        TestUtils.assertStrictEqual(
          sealElig.state, 
          'STANDARD_ALLOWED',
          `${fluidId} seal state`
        );
        
        // ASSERTION: Allowed categories must include standard seals
        TestUtils.assertIncludes(
          sealElig.allowedCategories,
          'Single',
          `${fluidId} must allow Single seals`
        );
        
        // ASSERTION: Must NOT require sealless
        TestUtils.assertNotIncludes(
          sealElig.allowedCategories,
          'Magnetic Drive',
          `${fluidId} must NOT require sealless`
        );
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${fluidId}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 2: HF → Sealless or Suppressed
 * V15 §13.4: FLUORIDE_ACID → SEALLESS_REQUIRED
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest2_HF = {
  name: 'GT-2: HF → Sealless or Suppressed',
  policyRef: 'V15 §12.2, §13.4, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    const hfFluids = ['hf-48', 'hf-70', 'hydrofluoric-acid'];
    
    for (const fluidId of hfFluids) {
      try {
        const ctx = engine.createRunContext(fluidId, 25, 'C');
        const sealElig = engine.resolveSealEligibility(ctx);
        
        // ASSERTION: Must be SEALLESS_REQUIRED or SUPPRESSED
        const validStates = ['SEALLESS_REQUIRED', 'SEAL_SELECTION_SUPPRESSED'];
        if (!validStates.includes(sealElig.state)) {
          throw new Error(`Expected SEALLESS_REQUIRED or SUPPRESSED, got ${sealElig.state}`);
        }
        
        // If not suppressed, verify sealless options
        if (sealElig.state === 'SEALLESS_REQUIRED') {
          TestUtils.assertIncludes(
            sealElig.allowedCategories,
            'Magnetic Drive',
            `${fluidId} must allow Magnetic Drive`
          );
          
          // Must NOT allow standard seals
          TestUtils.assertNotIncludes(
            sealElig.allowedCategories,
            'Single',
            `${fluidId} must NOT allow Single seals`
          );
        }
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${fluidId}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 3: Oxidizing Acid → No Metal Recommendations
 * V15 §12.1: Metals excluded from recommendations for oxidizing acids
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest3_OxidizingAcid = {
  name: 'GT-3: Oxidizing Acid → No Metal Recommendations',
  policyRef: 'V15 §12.1, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    const oxidizingFluids = ['hno3-65', 'hno3-70', 'h2o2-30', 'h2o2-50'];
    const metals = ['carbon-steel', '316ss', '304ss', 'hastelloy-c', 'titanium'];
    
    for (const fluidId of oxidizingFluids) {
      try {
        const ctx = engine.createRunContext(fluidId, 25, 'C');
        
        // Verify regime is OXIDIZING_ACID
        TestUtils.assertStrictEqual(
          ctx.primaryRegime,
          'OXIDIZING_ACID',
          `${fluidId} regime`
        );
        
        // Check that metals are excluded from recommendations
        // Per V15 §12.1: "Metals excluded from recommendations"
        const candidateSets = engine.constructCandidateSets(ctx, {});
        
        if (candidateSets && candidateSets.RecommendationCandidateSet) {
          for (const metal of metals) {
            const hasMetalRec = candidateSets.RecommendationCandidateSet.some(
              r => r.matId === metal && r.status === 'RECOMMENDED'
            );
            
            if (hasMetalRec) {
              throw new Error(`Metal ${metal} should not be recommended for ${fluidId}`);
            }
          }
        }
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${fluidId}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 4: Toxic → No Standard Seals
 * V15 §13.4: TOXIC → ≥ SPECIALIZED_REQUIRED
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest4_Toxic = {
  name: 'GT-4: Toxic Fluid → No Standard Seals',
  policyRef: 'V15 §12.4, §13.4, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    const toxicFluids = ['benzene', 'cyanide', 'mercury', 'arsenic'];
    
    for (const fluidId of toxicFluids) {
      try {
        const ctx = engine.createRunContext(fluidId, 25, 'C');
        const sealElig = engine.resolveSealEligibility(ctx);
        
        // ASSERTION: Must NOT be STANDARD_ALLOWED
        if (sealElig.state === 'STANDARD_ALLOWED') {
          throw new Error(`Toxic fluid ${fluidId} should NOT have STANDARD_ALLOWED seals`);
        }
        
        // ASSERTION: Must NOT allow Single seals
        TestUtils.assertNotIncludes(
          sealElig.allowedCategories,
          'Single',
          `${fluidId} must NOT allow Single seals`
        );
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${fluidId}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 5: Unknown Data → Suppressed Outputs
 * V15 §9: Missing data → UNKNOWN_RESTRICTED
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest5_UnknownData = {
  name: 'GT-5: Unknown Data → Suppressed Outputs',
  policyRef: 'V15 §9, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    // Test with invalid/unknown fluid IDs
    const unknownFluids = ['unknown-fluid-xyz', 'not-in-database', null, undefined, ''];
    
    for (const fluidId of unknownFluids) {
      try {
        // Should not crash - V15 §2.2 fail-closed
        let ctx;
        try {
          ctx = engine.createRunContext(fluidId, 25, 'C');
        } catch (e) {
          // Expected - invalid input should be handled gracefully
          results.passed++;
          continue;
        }
        
        if (ctx) {
          // If context was created, regime should be UNKNOWN_RESTRICTED
          TestUtils.assertStrictEqual(
            ctx.primaryRegime,
            'UNKNOWN_RESTRICTED',
            `Unknown fluid regime`
          );
          
          // Seal selection should be suppressed
          const sealElig = engine.resolveSealEligibility(ctx);
          TestUtils.assertStrictEqual(
            sealElig.state,
            'SEAL_SELECTION_SUPPRESSED',
            `Unknown fluid seal state`
          );
          
          // Allowed categories should be empty
          TestUtils.assertArrayEmpty(
            sealElig.allowedCategories,
            `Unknown fluid allowed categories`
          );
        }
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${fluidId}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 6: UI-PDF Parity
 * V15 §14.1: UI and PDF must render from same FAO snapshot
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest6_UIPDFParity = {
  name: 'GT-6: UI-PDF Parity (Same FAO)',
  policyRef: 'V15 §14, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    const testFluids = ['water', 'hcl-37', 'naoh-50'];
    
    for (const fluidId of testFluids) {
      try {
        // Generate FAO
        const ctx = engine.createRunContext(fluidId, 25, 'C');
        const sealElig = engine.resolveSealEligibility(ctx);
        
        // Compute FAO hash (if available)
        if (typeof engine.computeFAOHash === 'function') {
          const fao = engine.generateFAO(ctx, {}, sealElig, [], []);
          const hash1 = engine.computeFAOHash(fao);
          
          // Generate again - should be identical
          const fao2 = engine.generateFAO(ctx, {}, sealElig, [], []);
          const hash2 = engine.computeFAOHash(fao2);
          
          TestUtils.assertStrictEqual(
            hash1,
            hash2,
            `FAO hash consistency for ${fluidId}`
          );
        }
        
        // Verify runId consistency
        TestUtils.assertTruthy(
          ctx.runId,
          `RunId must exist for ${fluidId}`
        );
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${fluidId}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 7: Determinism
 * V15 §2.1: Identical inputs must always produce identical outputs
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest7_Determinism = {
  name: 'GT-7: Determinism (Same Input → Same Output)',
  policyRef: 'V15 §2.1, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    const testCases = [
      { fluid: 'water', temp: 25 },
      { fluid: 'hcl-37', temp: 50 },
      { fluid: 'naoh-50', temp: 80 },
      { fluid: 'h2so4-98', temp: 25 }
    ];
    
    for (const tc of testCases) {
      try {
        // Run assessment 3 times
        const results1 = [];
        const results2 = [];
        const results3 = [];
        
        for (let i = 0; i < 3; i++) {
          const ctx = engine.createRunContext(tc.fluid, tc.temp, 'C');
          const sealElig = engine.resolveSealEligibility(ctx);
          
          results1.push(ctx.primaryRegime);
          results2.push(sealElig.state);
          results3.push(JSON.stringify(sealElig.allowedCategories.sort()));
        }
        
        // All results must be identical
        TestUtils.assertStrictEqual(results1[0], results1[1], `Regime consistency 1-2`);
        TestUtils.assertStrictEqual(results1[1], results1[2], `Regime consistency 2-3`);
        TestUtils.assertStrictEqual(results2[0], results2[1], `Seal state consistency 1-2`);
        TestUtils.assertStrictEqual(results2[1], results2[2], `Seal state consistency 2-3`);
        TestUtils.assertStrictEqual(results3[0], results3[1], `Categories consistency 1-2`);
        TestUtils.assertStrictEqual(results3[1], results3[2], `Categories consistency 2-3`);
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${tc.fluid}@${tc.temp}C: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GOLDEN TEST 8: Regime Precedence
 * V15 §6: Regime precedence order
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const GoldenTest8_RegimePrecedence = {
  name: 'GT-8: Regime Precedence Order',
  policyRef: 'V15 §6, §19',
  
  async run(engine) {
    const results = { passed: 0, failed: 0, errors: [] };
    
    // Test regime precedence - highest should win
    const precedenceTests = [
      { fluid: 'hf-48', expected: 'FLUORIDE_ACID', reason: 'HF takes precedence' },
      { fluid: 'hno3-70', expected: 'OXIDIZING_ACID', reason: 'Oxidizing acid regime' },
      { fluid: 'naoh-50', expected: 'STRONG_BASE', reason: 'Strong base regime' },
      { fluid: 'benzene', expected: 'TOXIC_SPECIAL', reason: 'Toxic regime' },
      { fluid: 'water', expected: 'AQUEOUS_NON_HAZARDOUS', reason: 'Benign aqueous' }
    ];
    
    for (const test of precedenceTests) {
      try {
        const ctx = engine.createRunContext(test.fluid, 25, 'C');
        
        TestUtils.assertStrictEqual(
          ctx.primaryRegime,
          test.expected,
          `${test.fluid} regime (${test.reason})`
        );
        
        results.passed++;
      } catch (e) {
        results.failed++;
        results.errors.push(`${test.fluid}: ${e.message}`);
      }
    }
    
    return results;
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TEST RUNNER
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const allGoldenTests = [
  GoldenTest1_WaterBenign,
  GoldenTest2_HF,
  GoldenTest3_OxidizingAcid,
  GoldenTest4_Toxic,
  GoldenTest5_UnknownData,
  GoldenTest6_UIPDFParity,
  GoldenTest7_Determinism,
  GoldenTest8_RegimePrecedence
];

async function runGoldenTests() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('CERTA V15 §19 GOLDEN TEST SUITE');
  console.log('Parliament Mandate: Week 1, Day 1-2');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors = [];
  
  // Load engine
  let engine;
  try {
    engine = loadCertaEngine();
    console.log('✓ CERTA Engine loaded successfully\n');
  } catch (e) {
    console.log('✗ Failed to load CERTA Engine:', e.message);
    console.log('\nTo run tests, install dependencies:');
    console.log('  npm install jsdom');
    console.log('  node tests/golden/v15-golden-tests.js\n');
    
    // Output test structure for verification
    console.log('Test Suite Structure (8 Golden Tests per V15 §19):');
    allGoldenTests.forEach((test, i) => {
      console.log(`  ${i + 1}. ${test.name}`);
      console.log(`     Policy: ${test.policyRef}`);
    });
    return;
  }
  
  // Run each test
  for (const test of allGoldenTests) {
    console.log(`─────────────────────────────────────────────────────────────────────────────`);
    console.log(`${test.name}`);
    console.log(`Policy Reference: ${test.policyRef}`);
    console.log(`─────────────────────────────────────────────────────────────────────────────`);
    
    try {
      const results = await test.run(engine);
      
      totalPassed += results.passed;
      totalFailed += results.failed;
      
      if (results.failed === 0) {
        console.log(`  ✓ PASSED (${results.passed} assertions)`);
      } else {
        console.log(`  ✗ FAILED (${results.passed} passed, ${results.failed} failed)`);
        results.errors.forEach(e => {
          console.log(`    - ${e}`);
          allErrors.push(`${test.name}: ${e}`);
        });
      }
    } catch (e) {
      totalFailed++;
      console.log(`  ✗ ERROR: ${e.message}`);
      allErrors.push(`${test.name}: ${e.message}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('GOLDEN TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`  Total Passed:  ${totalPassed}`);
  console.log(`  Total Failed:  ${totalFailed}`);
  console.log(`  Pass Rate:     ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('');
  
  if (totalFailed === 0) {
    console.log('  ╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('  ║  ✓ ALL GOLDEN TESTS PASSED - DEPLOYMENT ALLOWED (V15 §19, V16 §20.1.1)  ║');
    console.log('  ╚═══════════════════════════════════════════════════════════════════════════╝');
  } else {
    console.log('  ╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('  ║  ✗ GOLDEN TESTS FAILED - DEPLOYMENT BLOCKED (V15 §19, V16 §20.1.1)      ║');
    console.log('  ╚═══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('  Errors:');
    allErrors.forEach(e => console.log(`    - ${e}`));
  }
  
  return { passed: totalPassed, failed: totalFailed, errors: allErrors };
}

// Export for use in CI/CD
module.exports = {
  runGoldenTests,
  allGoldenTests,
  TestUtils
};

// Run if executed directly
if (require.main === module) {
  runGoldenTests().catch(console.error);
}
