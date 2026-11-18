/**
 * Client-side AI Priority Engine Simulation & Analysis
 * Analyzes complaint title, description, category, and location to compute dynamic priority score (0-100)
 * and extracted keywords.
 */

const HIGH_PRIORITY_TRIGGERS = [
  'emergency', 'danger', 'fire', 'hazard', 'leak', 'short circuit',
  'electricity', 'blood', 'injury', 'broken window', 'security',
  'exam', 'hall ticket', 'admit card', 'results', 'fee deadline',
  'ragging', 'harassment', 'sewage', 'outage', 'gas', 'smoke'
];

const MEDIUM_PRIORITY_TRIGGERS = [
  'projector', 'wifi', 'internet', 'ac', 'air conditioner',
  'lab', 'assignment', 'grade', 'attendance', 'water dispenser',
  'fan', 'light', 'cleanliness', 'trash', 'stink', 'dorm', 'washroom'
];

export const analyzeComplaintPriority = ({ title = '', description = '', category = '', location = '' }) => {
  const combinedText = `${title} ${description} ${location}`.toLowerCase();
  
  let score = 15; // base score
  const detectedKeywords = [];

  // Check high priority triggers
  HIGH_PRIORITY_TRIGGERS.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      score += 22;
      detectedKeywords.push(keyword);
    }
  });

  // Check medium priority triggers
  MEDIUM_PRIORITY_TRIGGERS.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      score += 12;
      if (!detectedKeywords.includes(keyword)) {
        detectedKeywords.push(keyword);
      }
    }
  });

  // Category Multipliers
  if (category === 'Emergency' || category === 'Security') {
    score += 30;
    detectedKeywords.push(category.toLowerCase());
  } else if (category === 'Academic') {
    score += 15;
  } else if (category === 'Maintenance') {
    score += 10;
  }

  // Sentiment / Exclamation / Urgency detection
  if (combinedText.includes('urgent') || combinedText.includes('asap') || combinedText.includes('immediately')) {
    score += 15;
    if (!detectedKeywords.includes('urgent')) detectedKeywords.push('urgent');
  }

  // Cap score between 0 and 100
  score = Math.min(Math.max(score, 10), 99);

  let priority = 'LOW';
  let priorityReason = 'Standard routine request processed with default response SLA.';

  if (score >= 70) {
    priority = 'HIGH';
    priorityReason = `Urgent keywords detected (${detectedKeywords.slice(0, 3).join(', ')}). Auto-escalated for immediate admin intervention.`;
  } else if (score >= 40) {
    priority = 'MEDIUM';
    priorityReason = `Moderate urgency level detected. Scheduled for priority review within 12-24 hours.`;
  }

  return {
    priorityScore: score,
    priority,
    priorityReason,
    detectedKeywords: [...new Set(detectedKeywords)],
    estimatedSLA: priority === 'HIGH' ? '1-4 Hours' : priority === 'MEDIUM' ? '12-24 Hours' : '24-48 Hours'
  };
};
