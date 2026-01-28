/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA REVENUE GATES - FEATURE UNLOCKS
 * Parliament Session 1 - V16 §21.2
 * Features unlocked at MRR milestones
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// REVENUE GATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const REVENUE_GATES = {
  'RG-001': {
    id: 'RG-001',
    name: 'Assessment History',
    mrrTrigger: 500,
    description: 'Save and access past assessments',
    owner: 'TechArch',
    status: 'PENDING',
    implementation: 'Supabase table + API endpoints',
    dependencies: ['Supabase setup', 'User authentication'],
    estimatedEffort: '2-3 days',
    features: [
      'Save assessment results to database',
      'List past assessments with filters',
      'Load and view historical results',
      'Delete assessment history'
    ]
  },
  
  'RG-002': {
    id: 'RG-002',
    name: 'Excel Export',
    mrrTrigger: 1000,
    description: 'Export assessment results to Excel (.xlsx)',
    owner: 'TechArch',
    status: 'PENDING',
    implementation: 'xlsx library + download endpoint',
    dependencies: ['Assessment results structure'],
    estimatedEffort: '1-2 days',
    features: [
      'Export single assessment to Excel',
      'Multiple worksheets (materials, seals, TCO)',
      'Formatted headers and styling',
      'Charts for compatibility visualization'
    ]
  },
  
  'RG-003': {
    id: 'RG-003',
    name: 'Team Tier',
    mrrTrigger: 5000,
    description: 'Multi-user teams with shared assessments',
    owner: 'BizRev',
    status: 'PENDING',
    implementation: 'Team management + RBAC',
    dependencies: ['User auth', 'Assessment history'],
    estimatedEffort: '2-3 weeks',
    pricing: {
      base: 199, // per month
      perSeat: 29 // additional seats
    },
    features: [
      'Create and manage teams',
      'Invite team members',
      'Shared assessment library',
      'Team admin dashboard',
      'Usage analytics per team'
    ]
  },
  
  'RG-004': {
    id: 'RG-004',
    name: 'Custom Fluid Requests',
    mrrTrigger: 10000,
    description: 'Request addition of custom/proprietary fluids',
    owner: 'ChemSafe',
    status: 'PENDING',
    implementation: 'Request form + review workflow',
    dependencies: ['Chemistry Chamber review process'],
    estimatedEffort: '1-2 weeks',
    features: [
      'Custom fluid request form',
      'Upload SDS/technical data',
      'Chemistry review queue',
      'Request status tracking',
      'Priority processing for Enterprise'
    ]
  },
  
  'RG-005': {
    id: 'RG-005',
    name: 'API Access',
    mrrTrigger: 20000,
    description: 'Programmatic access to CERTA engine',
    owner: 'TechArch',
    status: 'PENDING',
    implementation: 'REST API + API key management',
    dependencies: ['Rate limiting', 'API documentation'],
    estimatedEffort: '3-4 weeks',
    pricing: {
      included: 10000, // requests per month
      additional: 0.01 // per request overage
    },
    features: [
      'REST API endpoints',
      'API key generation/management',
      'Rate limiting (10K requests/month)',
      'Webhook notifications',
      'API usage dashboard',
      'OpenAPI/Swagger documentation'
    ]
  },
  
  'RG-006': {
    id: 'RG-006',
    name: 'ISO 9001 Certification',
    mrrTrigger: 25000,
    description: 'CERTA quality management system certification',
    owner: 'CompGov',
    status: 'PENDING',
    implementation: 'QMS documentation + audit',
    dependencies: ['Stable process', 'Documentation'],
    estimatedEffort: '3-6 months',
    features: [
      'ISO 9001:2015 certified QMS',
      'Documented procedures',
      'Internal audit program',
      'Continuous improvement process',
      'Certificate for customer display'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REVENUE GATE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class RevenueGateEngine {
  constructor() {
    this.currentMRR = 0;
    this.unlockedGates = new Set();
    this.gateUnlockHistory = [];
  }
  
  /**
   * Update current MRR and check for gate unlocks
   * @param {number} mrr - Current monthly recurring revenue
   * @returns {object[]} Newly unlocked gates
   */
  updateMRR(mrr) {
    this.currentMRR = mrr;
    const newlyUnlocked = [];
    
    Object.values(REVENUE_GATES).forEach(gate => {
      if (mrr >= gate.mrrTrigger && !this.unlockedGates.has(gate.id)) {
        this.unlockedGates.add(gate.id);
        gate.status = 'UNLOCKED';
        gate.unlockedAt = new Date().toISOString();
        
        this.gateUnlockHistory.push({
          gateId: gate.id,
          gateName: gate.name,
          mrrAtUnlock: mrr,
          unlockedAt: gate.unlockedAt
        });
        
        newlyUnlocked.push(gate);
      }
    });
    
    return newlyUnlocked;
  }
  
  /**
   * Check if a specific gate is unlocked
   * @param {string} gateId - Gate ID (e.g., 'RG-001')
   * @returns {boolean}
   */
  isGateUnlocked(gateId) {
    return this.unlockedGates.has(gateId);
  }
  
  /**
   * Get next gate to unlock
   * @returns {object|null} Next gate or null if all unlocked
   */
  getNextGate() {
    const lockedGates = Object.values(REVENUE_GATES)
      .filter(g => !this.unlockedGates.has(g.id))
      .sort((a, b) => a.mrrTrigger - b.mrrTrigger);
    
    return lockedGates.length > 0 ? lockedGates[0] : null;
  }
  
  /**
   * Get MRR needed for next unlock
   * @returns {number} MRR needed or 0 if all unlocked
   */
  getMRRToNextUnlock() {
    const nextGate = this.getNextGate();
    if (!nextGate) return 0;
    return Math.max(0, nextGate.mrrTrigger - this.currentMRR);
  }
  
  /**
   * Get progress to next gate as percentage
   * @returns {number} 0-100
   */
  getProgressToNextGate() {
    const nextGate = this.getNextGate();
    if (!nextGate) return 100;
    
    const previousGate = Object.values(REVENUE_GATES)
      .filter(g => g.mrrTrigger < nextGate.mrrTrigger)
      .sort((a, b) => b.mrrTrigger - a.mrrTrigger)[0];
    
    const floor = previousGate ? previousGate.mrrTrigger : 0;
    const ceiling = nextGate.mrrTrigger;
    const progress = ((this.currentMRR - floor) / (ceiling - floor)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  }
  
  /**
   * Get all gates with their status
   * @returns {object[]}
   */
  getAllGates() {
    return Object.values(REVENUE_GATES).map(gate => ({
      ...gate,
      isUnlocked: this.unlockedGates.has(gate.id),
      mrrNeeded: Math.max(0, gate.mrrTrigger - this.currentMRR)
    }));
  }
  
  /**
   * Get summary dashboard data
   * @returns {object}
   */
  getDashboard() {
    const allGates = Object.values(REVENUE_GATES);
    const unlockedCount = this.unlockedGates.size;
    const nextGate = this.getNextGate();
    
    return {
      currentMRR: this.currentMRR,
      formattedMRR: `$${this.currentMRR.toLocaleString()}`,
      totalGates: allGates.length,
      unlockedGates: unlockedCount,
      lockedGates: allGates.length - unlockedCount,
      nextGate: nextGate ? {
        id: nextGate.id,
        name: nextGate.name,
        mrrTrigger: nextGate.mrrTrigger,
        mrrNeeded: nextGate.mrrTrigger - this.currentMRR,
        progress: this.getProgressToNextGate()
      } : null,
      recentUnlocks: this.gateUnlockHistory.slice(-3),
      milestones: allGates.map(g => ({
        mrr: g.mrrTrigger,
        name: g.name,
        unlocked: this.unlockedGates.has(g.id)
      }))
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE IMPLEMENTATIONS (STUBS)
// ═══════════════════════════════════════════════════════════════════════════════

// RG-001: Assessment History
const AssessmentHistory = {
  gateId: 'RG-001',
  
  async saveAssessment(userId, assessment) {
    // Supabase implementation
    return {
      id: `ASMT-${Date.now()}`,
      userId,
      fluidId: assessment.fluidId,
      temperature: assessment.temperature,
      createdAt: new Date().toISOString(),
      results: assessment.results
    };
  },
  
  async listAssessments(userId, options = {}) {
    // Return paginated list
    return {
      assessments: [],
      total: 0,
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
  },
  
  async getAssessment(userId, assessmentId) {
    return null; // Fetch from Supabase
  },
  
  async deleteAssessment(userId, assessmentId) {
    return { deleted: true };
  }
};

// RG-002: Excel Export
const ExcelExport = {
  gateId: 'RG-002',
  
  async generateExcel(assessment) {
    // Using xlsx library
    const XLSX = require('xlsx');
    
    const workbook = XLSX.utils.book_new();
    
    // Materials worksheet
    const materialsData = [
      ['Material', 'Status', 'Confidence', 'Notes'],
      // ... assessment.materials
    ];
    const materialsSheet = XLSX.utils.aoa_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(workbook, materialsSheet, 'Materials');
    
    // Seals worksheet
    const sealsData = [
      ['Seal Type', 'Eligibility', 'Notes'],
      // ... assessment.seals
    ];
    const sealsSheet = XLSX.utils.aoa_to_sheet(sealsData);
    XLSX.utils.book_append_sheet(workbook, sealsSheet, 'Seals');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
};

// RG-003: Team Tier
const TeamManagement = {
  gateId: 'RG-003',
  
  async createTeam(ownerId, teamName) {
    return {
      id: `TEAM-${Date.now()}`,
      name: teamName,
      ownerId,
      createdAt: new Date().toISOString(),
      members: [{ userId: ownerId, role: 'owner' }]
    };
  },
  
  async inviteMember(teamId, email, role = 'member') {
    return {
      inviteId: `INV-${Date.now()}`,
      teamId,
      email,
      role,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  },
  
  async getTeamAssessments(teamId) {
    return [];
  }
};

// RG-004: Custom Fluid Requests
const CustomFluidRequests = {
  gateId: 'RG-004',
  
  async submitRequest(userId, fluidData) {
    return {
      requestId: `CFR-${Date.now()}`,
      userId,
      fluidName: fluidData.name,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: '5-7 business days'
    };
  },
  
  async getRequestStatus(requestId) {
    return {
      requestId,
      status: 'pending_review',
      reviewerNotes: null,
      estimatedCompletion: null
    };
  }
};

// RG-005: API Access
const APIAccess = {
  gateId: 'RG-005',
  
  async generateAPIKey(userId) {
    const crypto = require('crypto');
    const key = `certa_${crypto.randomBytes(32).toString('hex')}`;
    
    return {
      keyId: `KEY-${Date.now()}`,
      userId,
      key: key, // Only shown once!
      prefix: key.substring(0, 12) + '...',
      createdAt: new Date().toISOString(),
      rateLimit: {
        requests: 10000,
        period: 'month'
      }
    };
  },
  
  async getAPIUsage(userId) {
    return {
      currentPeriod: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        requests: 0,
        limit: 10000
      }
    };
  },
  
  // API Endpoints
  endpoints: {
    'POST /api/v1/assess': 'Run compatibility assessment',
    'GET /api/v1/fluids': 'List available fluids',
    'GET /api/v1/fluids/:id': 'Get fluid details',
    'GET /api/v1/materials': 'List available materials',
    'GET /api/v1/materials/:id': 'Get material details',
    'GET /api/v1/usage': 'Get API usage stats'
  }
};

// RG-006: ISO 9001
const ISO9001 = {
  gateId: 'RG-006',
  
  qmsDocuments: [
    'Quality Manual',
    'Quality Policy',
    'Quality Objectives',
    'Procedure: Document Control',
    'Procedure: Internal Audit',
    'Procedure: Corrective Action',
    'Procedure: Management Review',
    'Work Instruction: Assessment Process',
    'Work Instruction: Material Validation'
  ],
  
  certificationStatus: {
    status: 'NOT_STARTED',
    targetDate: null,
    registrar: null,
    certificateNumber: null
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  REVENUE_GATES,
  RevenueGateEngine,
  
  // Feature implementations
  AssessmentHistory,
  ExcelExport,
  TeamManagement,
  CustomFluidRequests,
  APIAccess,
  ISO9001
};
