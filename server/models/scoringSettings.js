const mongoose = require('mongoose');

const scoringSettingsSchema = new mongoose.Schema({
  // A unique key to ensure only one settings document exists
  key: {
    type: String,
    default: 'main',
    unique: true,
    required: true,
  },
  completedPoints: { type: Number, default: 5, min: 0 },
  moderatePoints: { type: Number, default: 3, min: 0 },
  lowPoints: { type: Number, default: 1, min: 0 },
  pendingPoints: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const ScoringSettings = mongoose.model('ScoringSettings', scoringSettingsSchema);

module.exports = ScoringSettings;