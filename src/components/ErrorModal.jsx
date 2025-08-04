import React, { useEffect, useState } from 'react';

const ErrorModal = ({ 
  isOpen, 
  onClose, 
  title = "เกิดข้อผิดพลาด", 
  message = "กรุณาลองใหม่อีกครั้ง",
  onRetry = null
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          margin: '20px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          transition: 'all 0.3s ease-in-out',
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Error Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'error-shake 0.6s ease-in-out'
          }}
        >
          <svg
            style={{ width: '40px', height: '40px', color: 'white' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: onRetry ? 'row' : 'column'
        }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ลองใหม่
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: onRetry ? '#6b7280' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = onRetry ? '#4b5563' : '#059669';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = onRetry ? '#6b7280' : '#10b981';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {onRetry ? 'ปิด' : 'เข้าใจแล้ว'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes error-shake {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            transform: scale(1.1) rotate(-5deg);
            opacity: 1;
          }
          20% {
            transform: scale(1.1) rotate(5deg);
          }
          30% {
            transform: scale(1.1) rotate(-5deg);
          }
          40% {
            transform: scale(1.1) rotate(5deg);
          }
          50% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorModal;