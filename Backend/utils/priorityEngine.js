/**
 * Rule-Based AI Intelligent Priority Engine
 * Calculates dynamic priority (HIGH, MEDIUM, LOW) based on urgency score (0-100).
 * 
 * Score Thresholds:
 * - 0-30   : LOW
 * - 31-70  : MEDIUM
 * - 71-100 : HIGH
 */

// Category base weight multipliers (0 - 30 max base)
const CATEGORY_WEIGHTS = {
  Academic: 20,
  Maintenance: 25,
  Facilities: 20,
  Hostel: 25,
  Security: 35,
  Emergency: 45,
  Other: 15
};

// High-urgency safety, hazard, and emergency keywords (adds 20-30 pts each)
const HIGH_URGENCY_KEYWORDS = [
  'fire', 'short circuit', 'spark', 'electric shock', 'smoke', 'gas leak', 'explosion',
  'flood', 'overflow', 'water leakage', 'collapse', 'broken window', 'theft', 'harassment',
  'medical', 'injury', 'accident', 'unconscious', 'bleeding', 'blood', 'poison', 'snake',
  'ragging', 'fight', 'physical assault', 'lock broken', 'trap', 'stuck in lift', 'elevator'
];

// Medium-urgency functional impact keywords (adds 10-15 pts each)
const MEDIUM_URGENCY_KEYWORDS = [
  'exam', 'test', 'deadline', 'server down', 'no internet', 'wifi offline', 'projector broken',
  'ac failure', 'air conditioner', 'blackout', 'no power', 'no water', 'drinking water',
  'sanitation', 'restroom blocked', 'toilet', 'contamination', 'mold', 'fungus', 'sound system',
  'hall ticket', 'admit card', 'result error', 'grade discrepancy'
];

// Low-urgency routine maintenance keywords (adds 5 pts each)
const LOW_URGENCY_KEYWORDS = [
  'chair', 'table', 'whiteboard', 'marker', 'fan noise', 'dust', 'cleaning', 'paint',
  'door handle', 'light bulb', 'curtain', 'bench', 'speaker noise', 're-evaluation'
];

// Critical location modifiers (adds 10-20 pts)
const CRITICAL_LOCATIONS = [
  'server room', 'examination hall', 'exam hall', 'main lab', 'computer lab',
  'auditorium', 'library', 'mess', 'canteen', 'girls hostel', 'boys hostel',
  'principal office', 'chemistry lab', 'medical room', 'dispensary'
];

function calculatePriority({ subject = '', description = '', category = 'Other', location = '' }) {
  const combinedText = `${subject} ${description} ${location}`.toLowerCase();
  
  let score = 0;
  let detectedKeywords = [];
  let reasons = [];

  // 1. Category Base Urgency Weight
  const baseCategoryWeight = CATEGORY_WEIGHTS[category] || CATEGORY_WEIGHTS.Other;
  score += baseCategoryWeight;
  reasons.push(`Base category weight for '${category}': +${baseCategoryWeight} pts`);

  // 2. Scan High Urgency / Emergency Keywords
  const foundHigh = HIGH_URGENCY_KEYWORDS.filter(word => combinedText.includes(word));
  if (foundHigh.length > 0) {
    const pts = Math.min(foundHigh.length * 25, 45);
    score += pts;
    detectedKeywords.push(...foundHigh);
    reasons.push(`Critical safety/emergency terms detected (${foundHigh.join(', ')}): +${pts} pts`);
  }

  // 3. Scan Medium Urgency Keywords
  const foundMedium = MEDIUM_URGENCY_KEYWORDS.filter(word => combinedText.includes(word));
  if (foundMedium.length > 0) {
    const pts = Math.min(foundMedium.length * 12, 30);
    score += pts;
    detectedKeywords.push(...foundMedium);
    reasons.push(`Functional disruption terms detected (${foundMedium.join(', ')}): +${pts} pts`);
  }

  // 4. Scan Low Urgency Keywords
  const foundLow = LOW_URGENCY_KEYWORDS.filter(word => combinedText.includes(word));
  if (foundLow.length > 0) {
    const pts = Math.min(foundLow.length * 5, 15);
    score += pts;
    detectedKeywords.push(...foundLow);
    reasons.push(`Routine maintenance terms detected (${foundLow.join(', ')}): +${pts} pts`);
  }

  // 5. Critical Location Modifier
  const foundLocation = CRITICAL_LOCATIONS.find(loc => combinedText.includes(loc));
  if (foundLocation) {
    score += 15;
    reasons.push(`High-impact campus location ('${foundLocation}'): +15 pts`);
  }

  // 6. Time/Deadline Specific Urgency Detection
  if (combinedText.includes('today') || combinedText.includes('immediately') || combinedText.includes('urgent') || combinedText.includes('asap')) {
    score += 10;
    detectedKeywords.push('urgent deadline');
    reasons.push(`Explicit urgency flag detected in text: +10 pts`);
  }

  // Cap score at 100 max, 5 min
  const priorityScore = Math.min(Math.max(score, 5), 100);

  // Determine Priority Level
  let priority = 'LOW';
  if (priorityScore >= 71) {
    priority = 'HIGH';
  } else if (priorityScore >= 31) {
    priority = 'MEDIUM';
  }

  const priorityReason = reasons.join(' | ');

  return {
    priority,
    priorityScore,
    priorityReason,
    detectedKeywords: Array.from(new Set(detectedKeywords))
  };
}

module.exports = { calculatePriority };
