const Chat = require('../models/Chat');

// GET /api/chat/:otherUserId
exports.getMessages = async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;

  try {
    const chat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] }
    }).populate('messages.sender', 'name email');

    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
