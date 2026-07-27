import { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { Heart } from 'lucide-react';
import { toggleFavorite, isListingFavorited } from '../services/favorites';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeartToggle = ({ listingId, size = 18, className = '' }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (currentUser && listingId) {
      isListingFavorited(currentUser.id, listingId)
        .then(setFavorited)
        .catch(() => {});
    }
  }, [currentUser, listingId]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    setToggling(true);
    try {
      const newState = await toggleFavorite(currentUser.id, listingId);
      setFavorited(newState);
    } catch (err) {
      console.error('Toggle favorite error:', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <Tooltip title={favorited ? 'Remove from saved' : 'Save item'}>
      <div
        onClick={handleToggle}
        style={{
          cursor: toggling ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: favorited ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.8)',
          transition: 'all 0.2s ease',
          opacity: toggling ? 0.6 : 1,
        }}
        className={className}
      >
        <Heart
          size={size}
          fill={favorited ? '#ef4444' : 'none'}
          color={favorited ? '#ef4444' : '#64748b'}
          style={{
            transition: 'all 0.2s ease',
            transform: toggling ? 'scale(0.8)' : 'scale(1)',
          }}
        />
      </div>
    </Tooltip>
  );
};

export default HeartToggle;
