const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatHistory = require('../models/ChatHistory');
const Tour = require('../models/Tour');
const Place = require('../models/Place');
const Food = require('../models/Food');

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt cho chatbot du lịch Đà Nẵng
const SYSTEM_PROMPT = `Bạn là trợ lý du lịch AI của DANATrip - chuyên về du lịch Đà Nẵng.
Nhiệm vụ:
- Tư vấn địa điểm du lịch, tour, ẩm thực tại Đà Nẵng
- Gợi ý lịch trình phù hợp với nhu cầu khách hàng
- Trả lời bằng tiếng Việt, thân thiện và chi tiết
- Khi gợi ý tour/địa điểm/món ăn, hãy đề cập tên cụ thể để hệ thống có thể liên kết
- Nếu câu hỏi không liên quan đến du lịch Đà Nẵng, hãy lịch sự chuyển hướng về chủ đề du lịch`;

// @desc    Gửi tin nhắn cho AI
// @route   POST /api/chat
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn',
      });
    }

    // Lấy dữ liệu thực từ DB để AI tham khảo
    const [tours, places, foods] = await Promise.all([
      Tour.find({ hienThi: true }).select('tenTour moTaNgan giaNguoiLon').limit(20),
      Place.find({ hienThi: true }).select('tenDiaDiem noiDung viTri').limit(20),
      Food.find({ hienThi: true }).select('tenMon moTa').limit(20),
    ]);

    // Tạo context từ dữ liệu thực
    const dataContext = `
DANH SÁCH TOUR HIỆN CÓ:
${tours.map((t) => `- ${t.tenTour} (${t.giaNguoiLon?.toLocaleString()}đ): ${t.moTaNgan}`).join('\n')}

DANH SÁCH ĐỊA ĐIỂM:
${places.map((p) => `- ${p.tenDiaDiem} (${p.viTri}): ${p.noiDung}`).join('\n')}

DANH SÁCH MÓN ĂN:
${foods.map((f) => `- ${f.tenMon}: ${f.moTa}`).join('\n')}
`;

    // Lấy lịch sử chat (nếu có sessionId)
    let chatHistory = null;
    let previousMessages = [];

    if (sessionId) {
      chatHistory = await ChatHistory.findOne({ sessionId });
      if (chatHistory) {
        // Lấy 10 tin nhắn gần nhất làm context
        previousMessages = chatHistory.messages.slice(-10).flatMap((msg) => [
          { role: 'user', parts: [{ text: msg.tinNhanNguoiDung }] },
          { role: 'model', parts: [{ text: msg.phanHoiAI }] },
        ]);
      }
    }

    // Gọi Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nDỮ LIỆU THAM KHẢO:\n${dataContext}` }],
        },
        {
          role: 'model',
          parts: [{ text: 'Xin chào! Tôi là trợ lý du lịch DANATrip. Tôi sẵn sàng tư vấn cho bạn về du lịch Đà Nẵng! 🏖️' }],
        },
        ...previousMessages,
      ],
    });

    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // Tìm tour/place/food được đề cập trong câu trả lời để gợi ý
    const suggestedTours = tours.filter((t) =>
      aiResponse.toLowerCase().includes(t.tenTour.toLowerCase())
    );
    const suggestedPlaces = places.filter((p) =>
      aiResponse.toLowerCase().includes(p.tenDiaDiem.toLowerCase())
    );
    const suggestedFoods = foods.filter((f) =>
      aiResponse.toLowerCase().includes(f.tenMon.toLowerCase())
    );

    // Lưu lịch sử chat
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newMessage = {
      tinNhanNguoiDung: message,
      phanHoiAI: aiResponse,
      tourGoiY: suggestedTours.map((t) => t._id),
      placeGoiY: suggestedPlaces.map((p) => p._id),
      foodGoiY: suggestedFoods.map((f) => f._id),
      thoiGian: new Date(),
    };

    if (chatHistory) {
      chatHistory.messages.push(newMessage);
      await chatHistory.save();
    } else {
      await ChatHistory.create({
        user: req.user ? req.user._id : null,
        sessionId: currentSessionId,
        messages: [newMessage],
      });
    }

    res.status(200).json({
      success: true,
      sessionId: currentSessionId,
      data: {
        message: aiResponse,
        suggestions: {
          tours: suggestedTours.map((t) => ({
            _id: t._id,
            tenTour: t.tenTour,
            giaNguoiLon: t.giaNguoiLon,
          })),
          places: suggestedPlaces.map((p) => ({
            _id: p._id,
            tenDiaDiem: p.tenDiaDiem,
          })),
          foods: suggestedFoods.map((f) => ({
            _id: f._id,
            tenMon: f.tenMon,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Chat AI Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý tin nhắn. Vui lòng thử lại.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Lấy lịch sử chat theo session
// @route   GET /api/chat/:sessionId
exports.getChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
    })
      .populate('messages.tourGoiY', 'tenTour giaNguoiLon')
      .populate('messages.placeGoiY', 'tenDiaDiem hinhAnhChinh')
      .populate('messages.foodGoiY', 'tenMon hinhAnh');

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử chat',
      });
    }

    res.status(200).json({ success: true, data: chatHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy tất cả chat sessions của user
// @route   GET /api/chat/user/sessions
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await ChatHistory.find({ user: req.user._id })
      .select('sessionId createdAt messages')
      .sort('-updatedAt');

    // Trả về danh sách session kèm tin nhắn đầu tiên
    const sessionList = sessions.map((s) => ({
      sessionId: s.sessionId,
      createdAt: s.createdAt,
      messageCount: s.messages.length,
      lastMessage:
        s.messages.length > 0
          ? s.messages[s.messages.length - 1].tinNhanNguoiDung
          : '',
    }));

    res.status(200).json({
      success: true,
      count: sessionList.length,
      data: sessionList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Xóa lịch sử chat (Admin)
// @route   DELETE /api/chat/:sessionId
exports.deleteChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOneAndDelete({
      sessionId: req.params.sessionId,
    });

    if (!chatHistory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử chat',
      });
    }

    res.status(200).json({ success: true, message: 'Đã xóa lịch sử chat' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};