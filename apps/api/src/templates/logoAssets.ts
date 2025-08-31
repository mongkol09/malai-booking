// ฟังก์ชันสำหรับแปลง logo เป็น base64 เพื่อ embed ใน email
// หรือใช้ CDN URL

export const logoDataUri = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160">
  <!-- Background -->
  <rect width="500" height="160" fill="#FFFFFF"/>
  
  <!-- Decorative flowers (top center) -->
  <g transform="translate(250, 30)">
    <!-- Large flower -->
    <circle cx="0" cy="0" r="4" fill="#8B4513"/>
    <circle cx="-6" cy="-3" r="3.5" fill="#8B4513"/>
    <circle cx="6" cy="-3" r="3.5" fill="#8B4513"/>
    <circle cx="-4" cy="5" r="3.5" fill="#8B4513"/>
    <circle cx="4" cy="5" r="3.5" fill="#8B4513"/>
    <circle cx="-5" cy="-5" r="3" fill="#8B4513"/>
    <circle cx="5" cy="-5" r="3" fill="#8B4513"/>
    <circle cx="0" cy="7" r="3" fill="#8B4513"/>
  </g>
  
  <g transform="translate(250, 55)">
    <!-- Small flower -->
    <circle cx="0" cy="0" r="2.5" fill="#A0522D"/>
    <circle cx="-4" cy="-1.5" r="2" fill="#A0522D"/>
    <circle cx="4" cy="-1.5" r="2" fill="#A0522D"/>
    <circle cx="-2.5" cy="3" r="2" fill="#A0522D"/>
    <circle cx="2.5" cy="3" r="2" fill="#A0522D"/>
  </g>
  
  <!-- Main Text MALAI (larger) -->
  <text x="250" y="110" font-family="serif" font-size="52" font-weight="300" text-anchor="middle" fill="#8B4513" letter-spacing="12px">
    MALAI
  </text>
  
  <!-- Subtitle Khaoyai (larger) -->
  <text x="250" y="140" font-family="serif" font-size="22" font-weight="300" text-anchor="middle" fill="#8B4513" letter-spacing="6px">
    Khaoyai
  </text>
</svg>
`)}`;

export const getLogoUrl = () => {
  // สำหรับ production ให้ใช้ CDN หรือ hosted image
  if (process.env.NODE_ENV === 'production') {
    // ถ้าคุณมี hosted logo แล้ว ให้ใช้ URL จริง
    return 'https://your-cdn-domain.com/malai-khaoyai-logo.png';
  }
  
  // สำหรับ development ใช้ data URI ที่สร้างขึ้น
  return logoDataUri;
};
