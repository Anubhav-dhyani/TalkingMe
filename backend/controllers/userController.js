const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const all = await User.find({}, '_id name email');
    const me = await User.findById(req.user._id)
      .populate('pendingRequests', '_id name email')
      .populate('contacts', '_id name email');

    const others = all.filter(u => u._id.toString() !== req.user._id.toString());

    res.json({
      users: others,
      pendingRequests: me.pendingRequests,
      contacts: me.contacts
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users' });
  }
};
