const ScoringSettings = require('../models/scoringSettings.js');

class SettingsController {
  /**
   * @description Get the current scoring settings, creating them if they don't exist.
   * @route GET /api/settings/scoring
   * @access Private
   */
  static getScoringSettings = async (req, res) => {
    try {
      // Find the settings, or create them with default values if they don't exist.
      const settings = await ScoringSettings.findOneAndUpdate(
        { key: 'main' },
        { $setOnInsert: { key: 'main' } }, // Only set on creation
        { new: true, upsert: true, runValidators: true }
      );
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching scoring settings:', error);
      res.status(500).json({ message: 'Server error while fetching settings.' });
    }
  };

  /**
   * @description Update the scoring settings.
   * @route PUT /api/settings/scoring
   * @access Admin
   */
  static updateScoringSettings = async (req, res) => {
    // Admin check
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    try {
      const updatedSettings = await ScoringSettings.findOneAndUpdate(
        { key: 'main' },
        { $set: req.body },
        { new: true, upsert: true, runValidators: true }
      );
      res.status(200).json({ message: 'Scoring settings updated successfully.', settings: updatedSettings });
    } catch (error) {
      res.status(500).json({ message: 'Server error while updating settings.' });
    }
  };
}

module.exports = SettingsController;