import React, { useEffect, useState } from 'react';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "สำเร็จ!", 
  message = "", 
  orderId = "",
  itemCount = 0,
  showConfetti = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // สร้าง confetti effect
      if (showConfetti) {
        const pieces = [];
        for (let i = 0; i < 50; i++) {
          pieces.push({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
          });
        }
        setConfettiPieces(pieces);
        
        // ลบ confetti หลัง 3 วินาที
        setTimeout(() => setConfettiPieces([]), 3000);
      }
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen, showConfetti]);

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
      {/* Confetti */}
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.left}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            backgroundColor: piece.color,
            borderRadius: '50%',
            animation: `confetti-fall 3s ease-in-out ${piece.delay}s forwards`,
            pointerEvents: 'none'
          }}
        />
      ))}

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
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'success-bounce 0.6s ease-in-out'
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
              d="M5 13l4 4L19 7"
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
        {message && (
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}
          >
            {message}
          </p>
        )}

        {/* Order Details */}
        <div
          style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}
        >
          {orderId && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>รหัสคำสั่งซื้อ</span>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontFamily: 'monospace',
                  backgroundColor: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px'
                }}
              >
                {orderId}
              </div>
            </div>
          )}
          
          {itemCount > 0 && (
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>จำนวนรายการ</span>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#10b981',
                  marginTop: '4px'
                }}
              >
                {itemCount} รายการ
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: '#10b981',
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
            e.target.style.backgroundColor = '#059669';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#10b981';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          เรียบร้อย
        </button>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes success-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;