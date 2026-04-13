import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../api/axios';

const SESSION_KEY = 'danatrip_visit_session';

const createSessionId = () => {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getSessionId = () => {
  const current = sessionStorage.getItem(SESSION_KEY);
  if (current) return current;

  const next = createSessionId();
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
};

const VisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const sessionId = getSessionId();

    API.post('/analytics/visit', {
      sessionId,
      path: `${location.pathname}${location.search}`,
    }).catch(() => {});
  }, [location.pathname, location.search]);

  return null;
};

export default VisitTracker;
