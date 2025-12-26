export async function onRequest(context) {
  const url = new URL(context.request.url);

  const message = url.searchParams.get('message') || '메시지 없음';
  const time = url.searchParams.get('time') || '오후 12:00';

  // 메시지 길이 기반 x좌표 계산 (한글 약 22px, 영문/숫자 약 13px per char)
  let messageWidth = 0;
  for (const char of message) {
    if (/[가-힣]/.test(char)) {
      messageWidth += 22;
    } else {
      messageWidth += 13;
    }
  }
  
  const messageX = 200;
  const timeX = messageX + messageWidth + 25;

  // 배경 이미지 로드
  const bgUrl = url.origin + '/bg.png';
  const bgResponse = await fetch(bgUrl);
  const bgBuffer = await bgResponse.arrayBuffer();
  const bgBase64 = btoa(String.fromCharCode(...new Uint8Array(bgBuffer)));

  const svg = `
    <svg width="1024" height="256" viewBox="0 0 1024 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400&amp;display=swap');
        </style>
      </defs>
      
      <!-- 배경 이미지 -->
      <image href="data:image/png;base64,${bgBase64}" width="1024" height="256"/>
      
      <!-- 메시지 -->
      <text x="${messageX}" y="130" fill="#EEEEEE" font-size="38" font-family="'Nanum Gothic', sans-serif" font-weight="400">${message}</text>
      
      <!-- 시간 (메시지 끝 + 20px) -->
      <text x="${timeX}" y="160" fill="#C2C2C2" font-size="20" font-family="'Nanum Gothic', sans-serif" font-weight="400">${time}</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
