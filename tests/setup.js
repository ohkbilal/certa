/**
 * CERTA Test Setup
 * V15 Policy Compliance Testing Environment
 */

// Extend Jest matchers if needed
expect.extend({
  toBeValidSealState(received) {
    const validStates = [
      'STANDARD_ALLOWED',
      'REINFORCED_REQUIRED', 
      'SPECIALIZED_REQUIRED',
      'SEALLESS_REQUIRED',
      'SEAL_SELECTION_SUPPRESSED'
    ];
    
    const pass = validStates.includes(received);
    
    return {
      message: () => pass
        ? `expected ${received} not to be a valid seal state`
        : `expected ${received} to be one of: ${validStates.join(', ')}`,
      pass
    };
  },
  
  toBeValidRegime(received) {
    const validRegimes = [
      'NEUTRAL',
      'AQUEOUS_NON_HAZARDOUS',
      'AQUEOUS_CORROSIVE',
      'OXIDIZING_ACID',
      'REDUCING_ACID',
      'FLUORIDE_ACID',
      'STRONG_BASE',
      'HALOGENATED',
      'ORGANIC_SOLVENT',
      'TOXIC_SPECIAL',
      'EXPLOSIVE_ENERGETIC',
      'UNKNOWN_RESTRICTED'
    ];
    
    const pass = validRegimes.includes(received);
    
    return {
      message: () => pass
        ? `expected ${received} not to be a valid regime`
        : `expected ${received} to be one of: ${validRegimes.join(', ')}`,
      pass
    };
  }
});

// Global test timeout
jest.setTimeout(10000);

// Console logging for test debugging
if (process.env.DEBUG_TESTS) {
  global.debugLog = console.log;
} else {
  global.debugLog = () => {};
}
