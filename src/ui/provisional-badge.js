/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CERTA UI COMPONENTS - PROVISIONAL BADGE
 * Parliament Session 4 - MAT-003
 * UI indicators for PROVISIONAL status materials
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CSS STYLES FOR PROVISIONAL BADGES
// ═══════════════════════════════════════════════════════════════════════════════

const PROVISIONAL_BADGE_STYLES = `
/* CERTA Provisional Badge Styles */
.certa-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.certa-badge-verified {
  background: linear-gradient(135deg, #064e3b, #065f46);
  color: #6ee7b7;
  border: 1px solid #10b981;
}

.certa-badge-provisional {
  background: linear-gradient(135deg, #78350f, #92400e);
  color: #fcd34d;
  border: 1px solid #f59e0b;
  animation: pulse-provisional 2s ease-in-out infinite;
}

@keyframes pulse-provisional {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.certa-badge-icon {
  font-size: 0.8em;
}

/* Tooltip for provisional materials */
.certa-provisional-tooltip {
  position: relative;
  cursor: help;
}

.certa-provisional-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  white-space: nowrap;
  border-radius: 6px;
  border: 1px solid #475569;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
}

.certa-provisional-tooltip:hover::after {
  opacity: 1;
  visibility: visible;
}

/* Material card with provisional indicator */
.certa-material-card {
  position: relative;
  padding: 12px;
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid #334155;
}

.certa-material-card.provisional {
  border-color: #f59e0b;
  border-style: dashed;
}

.certa-material-card.provisional::before {
  content: '⚠️ PROVISIONAL';
  position: absolute;
  top: -10px;
  right: 10px;
  padding: 2px 8px;
  background: #78350f;
  color: #fcd34d;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid #f59e0b;
}

/* Material list provisional highlight */
.certa-material-list .provisional-material {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
}

/* Compatibility result with provisional warning */
.certa-result-provisional-warning {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #fcd34d;
}

.certa-result-provisional-warning::before {
  content: '⚠️ ';
}
`;

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE HTML GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a status badge HTML
 * @param {string} status - 'VERIFIED' or 'PROVISIONAL'
 * @returns {string} HTML string
 */
function generateStatusBadge(status) {
  if (status === 'VERIFIED') {
    return `<span class="certa-badge certa-badge-verified">
      <span class="certa-badge-icon">✓</span>
      Verified
    </span>`;
  }
  
  if (status === 'PROVISIONAL') {
    return `<span class="certa-badge certa-badge-provisional certa-provisional-tooltip" 
            data-tooltip="Recently added material - validation in progress">
      <span class="certa-badge-icon">⚠</span>
      Provisional
    </span>`;
  }
  
  return `<span class="certa-badge">Unknown</span>`;
}

/**
 * Generate material card HTML with provisional indicator
 * @param {object} material - Material object from registry
 * @returns {string} HTML string
 */
function generateMaterialCard(material) {
  const isProvisional = material.status === 'PROVISIONAL';
  const cardClass = isProvisional ? 'certa-material-card provisional' : 'certa-material-card';
  
  return `
<div class="${cardClass}">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <h4 style="margin: 0 0 4px 0; color: #e2e8f0;">${material.name}</h4>
      <span style="font-size: 0.75rem; color: #64748b;">${material.type}</span>
    </div>
    ${generateStatusBadge(material.status)}
  </div>
  ${isProvisional ? `
  <div class="certa-result-provisional-warning">
    This material was recently added and is undergoing validation. 
    Results should be verified against manufacturer specifications.
  </div>
  ` : ''}
</div>`;
}

/**
 * Generate provisional warning banner for results
 * @param {string[]} provisionalMaterials - Array of provisional material names
 * @returns {string} HTML string
 */
function generateProvisionalWarningBanner(provisionalMaterials) {
  if (!provisionalMaterials || provisionalMaterials.length === 0) {
    return '';
  }
  
  return `
<div style="
  margin: 12px 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1));
  border: 1px solid #f59e0b;
  border-radius: 8px;
  color: #fcd34d;
">
  <div style="display: flex; align-items: flex-start; gap: 10px;">
    <span style="font-size: 1.2rem;">⚠️</span>
    <div>
      <strong style="display: block; margin-bottom: 4px;">Provisional Materials Included</strong>
      <p style="margin: 0; font-size: 0.8rem; color: #fde68a;">
        The following materials are recently added and undergoing validation:
        <strong>${provisionalMaterials.join(', ')}</strong>.
        Results should be verified against manufacturer specifications and industry standards.
      </p>
    </div>
  </div>
</div>`;
}

/**
 * Generate material list item with provisional highlighting
 * @param {object} material - Material object
 * @param {object} compatibility - Compatibility result
 * @returns {string} HTML string
 */
function generateMaterialListItem(material, compatibility) {
  const isProvisional = material.status === 'PROVISIONAL';
  const itemClass = isProvisional ? 'provisional-material' : '';
  
  const statusColors = {
    'COMPATIBLE': '#10b981',
    'CONDITIONAL': '#f59e0b',
    'FAIL': '#ef4444',
    'UNKNOWN': '#6b7280'
  };
  
  const statusColor = statusColors[compatibility.status] || statusColors.UNKNOWN;
  
  return `
<div class="certa-material-list-item ${itemClass}" style="
  padding: 10px 12px;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${isProvisional ? 'background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b;' : ''}
">
  <div>
    <span style="color: #e2e8f0; font-weight: 500;">${material.name}</span>
    ${isProvisional ? '<span style="margin-left: 8px; font-size: 0.65rem; color: #f59e0b;">⚠ PROVISIONAL</span>' : ''}
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <span style="
      padding: 2px 8px;
      background: ${statusColor}20;
      color: ${statusColor};
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    ">${compatibility.status}</span>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REACT COMPONENTS (JSX)
// ═══════════════════════════════════════════════════════════════════════════════

const PROVISIONAL_BADGE_REACT = `
import React from 'react';

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status }) => {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-emerald-900 text-emerald-300 border border-emerald-500">
        <span>✓</span>
        Verified
      </span>
    );
  }
  
  if (status === 'PROVISIONAL') {
    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-amber-900 text-amber-300 border border-amber-500 animate-pulse cursor-help"
        title="Recently added material - validation in progress"
      >
        <span>⚠</span>
        Provisional
      </span>
    );
  }
  
  return <span className="text-xs text-gray-500">Unknown</span>;
};

/**
 * Provisional Warning Banner Component
 */
export const ProvisionalWarningBanner = ({ materials }) => {
  if (!materials || materials.length === 0) return null;
  
  return (
    <div className="my-3 p-4 bg-amber-900/20 border border-amber-500 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <strong className="block mb-1 text-amber-300">Provisional Materials Included</strong>
          <p className="text-sm text-amber-200/80">
            The following materials are recently added and undergoing validation:{' '}
            <strong>{materials.join(', ')}</strong>.
            Results should be verified against manufacturer specifications.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Material Card Component with Provisional Indicator
 */
export const MaterialCard = ({ material, compatibility }) => {
  const isProvisional = material.status === 'PROVISIONAL';
  
  return (
    <div className={\`relative p-3 rounded-lg border \${
      isProvisional 
        ? 'border-amber-500 border-dashed bg-slate-800' 
        : 'border-slate-600 bg-slate-800'
    }\`}>
      {isProvisional && (
        <span className="absolute -top-2 right-3 px-2 py-0.5 text-xs font-semibold bg-amber-900 text-amber-300 border border-amber-500 rounded">
          ⚠️ PROVISIONAL
        </span>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-white font-medium">{material.name}</h4>
          <span className="text-xs text-slate-400">{material.type}</span>
        </div>
        <StatusBadge status={material.status} />
      </div>
      {isProvisional && (
        <p className="mt-2 p-2 text-xs text-amber-200 bg-amber-900/30 border border-amber-600 rounded">
          ⚠️ This material is undergoing validation. Verify against manufacturer specs.
        </p>
      )}
    </div>
  );
};

export default { StatusBadge, ProvisionalWarningBanner, MaterialCard };
`;

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  PROVISIONAL_BADGE_STYLES,
  generateStatusBadge,
  generateMaterialCard,
  generateProvisionalWarningBanner,
  generateMaterialListItem,
  PROVISIONAL_BADGE_REACT
};
