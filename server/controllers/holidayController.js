const Holiday = require('../models/holiday.js');

class HolidayController {
  static getHolidays = async (req, res) => {
    try {
      const holidays = await Holiday.find({});
      res.status(200).json(holidays);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching holidays.' });
    }
  };

  static addHoliday = async (req, res) => {
    const { date, name } = req.body;
    if (!date || !name) {
      return res.status(400).json({ message: 'Date and name are required.' });
    }

    try {
      const newHoliday = new Holiday({ date: new Date(date), name });
      await newHoliday.save();
      res.status(201).json(newHoliday);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'This date is already a holiday.' });
      }
      res.status(500).json({ message: 'Error adding holiday.' });
    }
  };

  static deleteHoliday = async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await Holiday.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Holiday not found.' });
      }
      res.status(200).json({ message: 'Holiday deleted.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting holiday.' });
    }
  };

  static isTodayHoliday = async (req, res) => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const holiday = await Holiday.findOne({ date: today });
      res.status(200).json({ isHoliday: !!holiday, holiday });
    } catch (error) {
      res.status(500).json({ message: 'Error checking for holiday.' });
    }
  };
}

module.exports = HolidayController;