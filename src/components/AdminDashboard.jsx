import React, { useState, useEffect } from 'react';
import { getAdminDashboardData, checkAdminConnection } from '../services/adminService';

const AdminDashboard = ({ currentUser, onLogout, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState({
    pendingOrders: 0,
    regularShops: 0,
    premiumShops: 0,
    dateRange: { start: '', end: '' },
    topProducts: [],
    recentOrders: [],
    procurementSessions: [],
    pendingOrderDetails: [] // เพิ่มรายละเอียด orders
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null); // เพิ่ม state สำหรับ drill-down

  // โหลดข้อมูลจาก Google Apps Script
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ดึงข้อมูล dashboard
      const data = await getAdminDashboardData();
      setDashboardData(data);
      setIsConnected(data.isConnected !== false);
      
      if (data.error) {
        setError(data.error);
      }
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
      setIsConnected(false);
      
      // ใช้ mock data เป็น fallback
      setDashboardData({
        pendingOrders: 0,
        regularShops: 0, 
        premiumShops: 0,
        dateRange: { start: 'N/A', end: 'N/A' },
        topProducts: [],
        recentOrders: [],
        procurementSessions: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSummarizeOrders = () => {
    console.log('Creating new procurement session...');
    onNavigate('procurement-planning');
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleShopClick = (shopData) => {
    // หา orders ทั้งหมดของร้านนี้
    const shopOrders = dashboardData.pendingOrderDetails.filter(
      order => order.shopId === shopData.shopId
    );
    
    setSelectedShop({
      ...shopData,
      orders: shopOrders
    });
  };

  const closeShopDetails = () => {
    setSelectedShop(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* เอา Header ออก - ให้ App.jsx จัดการแทน */}
      
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '20px' }}>⚠️</div>
            <div>
              <p style={{ color: '#dc2626', fontWeight: '500', margin: 0 }}>
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </p>
              <p style={{ color: '#7f1d1d', fontSize: '14px', margin: '4px 0 0 0' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: '0 0 8px 0'
                }}>
                  รายการรอสรุป
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#d97706',
                  margin: '0 0 4px 0'
                }}>
                  {dashboardData.premiumShops}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  สั่งซื้อแล้ว
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🍣
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              การดำเนินการหลัก
            </h2>
            <p style={{
              color: '#6b7280',
              margin: '0 0 32px 0',
              fontSize: '16px'
            }}>
              มีรายการสั่งซื้อ {dashboardData.pendingOrders} รายการ จาก {dashboardData.regularShops + dashboardData.premiumShops} ร้านค้า รอการประมวลผล
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleSummarizeOrders}
                disabled={dashboardData.pendingOrders === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: dashboardData.pendingOrders > 0 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : '#9ca3af',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '18px',
                  border: 'none',
                  cursor: dashboardData.pendingOrders > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: dashboardData.pendingOrders > 0 
                    ? '0 4px 6px rgba(16, 185, 129, 0.25)'
                    : '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  if (dashboardData.pendingOrders > 0) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 12px rgba(16, 185, 129, 0.35)';
                  }
                }}
                onMouseOut={(e) => {
                  if (dashboardData.pendingOrders > 0) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.25)';
                  }
                }}
              >
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                สรุปรายการสั่งซื้อ
              </button>
              
              <button 
                onClick={() => onNavigate('stock-management')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                จัดการสต็อก
              </button>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
          gap: '32px'
        }}>
          {/* Top Products */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              สินค้ายอดนิยม
            </h3>
            
            {dashboardData.topProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p>ยังไม่มีรายการสั่งซื้อ</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dashboardData.topProducts.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        backgroundColor: 
                          index === 0 ? '#eab308' : 
                          index === 1 ? '#6b7280' : 
                          index === 2 ? '#ea580c' : '#3b82f6'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <p style={{
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {product.name}
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {product.shops} ร้านสั่ง
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 4px 0'
                      }}>
                        {product.totalQuantity}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {product.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              รายการล่าสุด
            </h3>
            
            {dashboardData.recentOrders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                <p>ยังไม่มีรายการล่าสุด</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dashboardData.recentOrders.map((order, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      border: '1px solid #f3f4f6',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#bbf7d0';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#f3f4f6';
                    }}
                    onClick={() => handleShopClick(order)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>
                        {order.shopType === 'premium' ? '🍣' : '🏪'}
                      </div>
                      <div>
                        <p style={{
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {order.shopName}
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {order.items} รายการ
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {order.time}
                      </div>
                      <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Procurement History */}
        <div style={{
          marginTop: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              ประวัติการจัดซื้อ
            </h3>
            <button style={{
              fontSize: '14px',
              color: '#2563eb',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
              ดูทั้งหมด →
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    รหัสเซสชัน
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    วันที่
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    จำนวนรายการ
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    สถานะ
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.procurementSessions.map((session, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      padding: '12px 16px',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}>
                      {session.id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {session.date}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {session.orders} รายการ
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#d1fae5',
                        color: '#166534'
                      }}>
                        เสร็จสิ้น
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button style={{
                        color: '#2563eb',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shop Details Modal */}
      {selectedShop && (
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
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={closeShopDetails}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>
                  {selectedShop.shopType === 'premium' ? '🍣' : '🏪'}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#111827',
                    margin: 0
                  }}>
                    {selectedShop.shopName}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    รหัสร้าน: {selectedShop.shopId} • ประเภท: {selectedShop.shopType}
                  </p>
                </div>
              </div>
              
              <button
                onClick={closeShopDetails}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Orders List */}
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px'
              }}>
                รายการสั่งซื้อ ({selectedShop.orders?.length || 0} รายการ)
              </h4>
              
              {selectedShop.orders && selectedShop.orders.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  {selectedShop.orders.map((order, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div>
                        <p style={{
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>
                          {order.productName}
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {order.unit}
                        </p>
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#059669',
                        fontSize: '16px'
                      }}>
                        {order.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#6b7280'
                }}>
                  ไม่มีข้อมูลรายการสั่งซื้อ
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;