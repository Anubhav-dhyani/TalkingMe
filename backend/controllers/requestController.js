const User = require('../models/User');

// 🚀 Send a Chat Request
exports.sendRequest = async (req, res) => {
  const { targetUserId } = req.body;
  const senderId = req.user._id;

  if (targetUserId === senderId.toString()) {
    return res.status(400).json({ message: "You can't send request to yourself" });
  }

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(targetUserId);

    if (!receiver) return res.status(404).json({ message: "User not found" });
    if (sender.contacts.includes(targetUserId)) {
      return res.status(400).json({ message: "Already in contacts" });
    }
    if (sender.sentRequests.includes(targetUserId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    sender.sentRequests.push(targetUserId);
    receiver.pendingRequests.push(senderId);

    await sender.save();
    await receiver.save();

    res.json({ message: "Request sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Accept Request
exports.acceptRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user._id;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

    // Add to contacts
    sender.contacts.push(receiverId);
    receiver.contacts.push(senderId);

    // Remove from pending/sent
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());
    receiver.pendingRequests = receiver.pendingRequests.filter(id => id.toString() !== senderId.toString());

    await sender.save();
    await receiver.save();

    res.json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ Reject Request
exports.rejectRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user._id;

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

    // Remove from pending/sent
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());
    receiver.pendingRequests = receiver.pendingRequests.filter(id => id.toString() !== senderId.toString());

    await sender.save();
    await receiver.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
