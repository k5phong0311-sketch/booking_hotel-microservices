import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Đang tải...' }) => (
  <div style={styles.wrap}>
    <div style={styles.spinner} />
    <p style={styles.text}>{text}</p>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 60, gap: 16 },
  spinner: { width: 44, height: 44, border: '4px solid #f0f0f0',
    borderTop: '4px solid #e94560', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite' },
  text: { color: '#888', fontSize: 14 },
};

export default LoadingSpinner;
