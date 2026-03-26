import { useState, useRef, useEffect } from 'react';
import API from '../../api/axios';
import ReactMarkdown from 'react-markdown';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import '../../styles/chat.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Xin chào! 👋 Tôi là trợ lý du lịch DANATrip. Bạn muốn khám phá gì ở Đà Nẵng?',
      suggestions: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await API.post('/chat', {
        message: userMessage,
        sessionId: sessionId,
      });

      const { data, sessionId: newSessionId } = res.data;
      if (newSessionId) setSessionId(newSessionId);

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: data.message,
          suggestions: data.suggestions,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau! 😅',
          suggestions: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMessage = (text) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    API.post('/chat', { message: text, sessionId })
      .then((res) => {
        const { data, sessionId: newSessionId } = res.data;
        if (newSessionId) setSessionId(newSessionId);
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: data.message, suggestions: data.suggestions },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: 'Xin lỗi, có lỗi xảy ra. Thử lại nhé! 😅' },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        role: 'ai',
        content: 'Xin chào! 👋 Tôi là trợ lý du lịch DANATrip. Bạn muốn khám phá gì ở Đà Nẵng?',
        suggestions: null,
      },
    ]);
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <FaComments />
          <span className="chat-toggle-text">Chat AI</span>
        </button>
      )}

      {isOpen && (
        <div className="chat-widget">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <FaRobot className="chat-header-icon" />
              <div>
                <h3>DANATrip AI</h3>
                <span className="chat-status">
                  {loading ? '⏳ Đang trả lời...' : '🟢 Online'}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button onClick={handleNewChat} className="btn-new-chat" title="Cuộc trò chuyện mới">
                🔄
              </button>
              <button onClick={() => setIsOpen(false)} className="btn-close-chat">
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="quick-suggestions">
              <button onClick={() => handleQuickMessage('Gợi ý lịch trình 3 ngày 2 đêm ở Đà Nẵng')}>
                📅 Lịch trình 3N2Đ
              </button>
              <button onClick={() => handleQuickMessage('Địa điểm nổi tiếng ở Đà Nẵng')}>
                📍 Địa điểm nổi tiếng
              </button>
              <button onClick={() => handleQuickMessage('Món ăn đặc sản Đà Nẵng phải thử')}>
                🍜 Ẩm thực đặc sản
              </button>
              <button onClick={() => handleQuickMessage('Tour du lịch giá rẻ ở Đà Nẵng')}>
                🗺️ Tour giá rẻ
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'ai' ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  {/* ✅ Dùng ReactMarkdown thay vì plain text */}
                  <div className="message-text">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Suggestions */}
                  {msg.suggestions && (
                    <div className="message-suggestions">
                      {msg.suggestions.tours?.length > 0 && (
                        <div className="suggestion-group">
                          <span className="suggestion-label">🗺️ Tour gợi ý:</span>
                          {msg.suggestions.tours.map((tour) => (
                            <a key={tour._id} href={`/tours/${tour._id}`} className="suggestion-chip">
                              {tour.tenTour}
                              {tour.giaNguoiLon && (
                                <span> - {tour.giaNguoiLon.toLocaleString('vi-VN')}đ</span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      {msg.suggestions.places?.length > 0 && (
                        <div className="suggestion-group">
                          <span className="suggestion-label">📍 Địa điểm:</span>
                          {msg.suggestions.places.map((place) => (
                            <a key={place._id} href={`/places/${place._id}`} className="suggestion-chip">
                              {place.tenDiaDiem}
                            </a>
                          ))}
                        </div>
                      )}
                      {msg.suggestions.foods?.length > 0 && (
                        <div className="suggestion-group">
                          <span className="suggestion-label">🍜 Món ăn:</span>
                          {msg.suggestions.foods.map((food) => (
                            <a key={food._id} href={`/foods/${food._id}`} className="suggestion-chip">
                              {food.tenMon}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message ai">
                <div className="message-avatar"><FaRobot /></div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về du lịch Đà Nẵng..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;