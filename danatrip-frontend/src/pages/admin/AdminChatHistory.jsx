import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import { FaComments, FaTrash, FaUser, FaRobot } from 'react-icons/fa';
import API from '../../api/axios';
import Loading from '../../components/common/Loading';

const AdminChatHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await API.get('/chat/admin/sessions');
      const data = res.data.data || [];
      setSessions(data);
      setSelectedSessionId((current) => current || data[0]?.sessionId || '');
    } catch {
      toast.error('Không tải được lịch sử chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sessions;

    return sessions.filter((session) => {
      const userText = `${session.user?.hoTen || ''} ${session.user?.email || ''}`.toLowerCase();
      const messageText = `${session.sessionId} ${session.lastMessage || ''}`.toLowerCase();
      return userText.includes(keyword) || messageText.includes(keyword);
    });
  }, [sessions, search]);

  const selectedSession =
    sessions.find((session) => session.sessionId === selectedSessionId) ||
    filteredSessions[0];

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Xóa toàn bộ lịch sử chat này?')) return;

    try {
      await API.delete(`/chat/${sessionId}`);
      toast.success('Đã xóa lịch sử chat');

      setSessions((prev) => {
        const next = prev.filter((session) => session.sessionId !== sessionId);
        setSelectedSessionId(next[0]?.sessionId || '');
        return next;
      });
    } catch {
      toast.error('Xóa lịch sử chat thất bại');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-page chat-admin-page">
      <div className="admin-page-header">
        <div>
          <h1>💬 Lịch sử Chat AI</h1>
          <p className="admin-subtitle">Theo dõi các cuộc trò chuyện giữa khách hàng và DANATrip AI</p>
        </div>
        <div className="chat-admin-count">
          <FaComments />
          <span>{sessions.length} phiên</span>
        </div>
      </div>

      <div className="chat-admin-layout">
        <aside className="chat-session-panel">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="chat-session-search"
            placeholder="Tìm theo tên, email, nội dung..."
          />

          <div className="chat-session-list">
            {filteredSessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                className={`chat-session-item ${selectedSession?.sessionId === session.sessionId ? 'active' : ''}`}
                onClick={() => setSelectedSessionId(session.sessionId)}
              >
                <strong>{session.user?.hoTen || 'Khách vãng lai'}</strong>
                <span>{session.lastMessage || 'Chưa có tin nhắn'}</span>
                <small>
                  {session.messageCount} tin nhắn • {new Date(session.updatedAt).toLocaleString('vi-VN')}
                </small>
              </button>
            ))}

            {filteredSessions.length === 0 && (
              <div className="empty">Không có lịch sử chat phù hợp</div>
            )}
          </div>
        </aside>

        <section className="chat-detail-panel">
          {selectedSession ? (
            <>
              <div className="chat-detail-header">
                <div>
                  <h2>{selectedSession.user?.hoTen || 'Khách vãng lai'}</h2>
                  <p>
                    {selectedSession.user?.email || selectedSession.sessionId}
                    {' • '}
                    {new Date(selectedSession.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => handleDelete(selectedSession.sessionId)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>

              <div className="chat-detail-messages">
                {selectedSession.messages.map((msg) => (
                  <div key={msg._id} className="chat-admin-pair">
                    <div className="chat-admin-message user">
                      <div className="chat-admin-avatar"><FaUser /></div>
                      <div>
                        <span>Người dùng</span>
                        <p>{msg.tinNhanNguoiDung}</p>
                      </div>
                    </div>

                    <div className="chat-admin-message ai">
                      <div className="chat-admin-avatar"><FaRobot /></div>
                      <div>
                        <span>DANATrip AI</span>
                        <div className="chat-admin-markdown">
                          <ReactMarkdown>{msg.phanHoiAI}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty">Chưa có lịch sử chat</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminChatHistory;
