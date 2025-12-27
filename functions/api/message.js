export async function onRequest(context) {
  const url = new URL(context.request.url);

  const messageRaw = url.searchParams.get('message') || '메시지 없음';
const timeRaw = url.searchParams.get('time') || '오후 12:00';

const message = decodeURIComponent(messageRaw);
const time = decodeURIComponent(timeRaw);
  // 메시지 길이에 따라 폰트 크기 조절
  let fontSize, charWidth, charWidthEng, lineLimit;
  if (message.length <= 20) {
    fontSize = 38;
    charWidth = 34;
    charWidthEng = 19;
    lineLimit = 20;
  } else if (message.length <= 40) {
    fontSize = 34;
    charWidth = 27;
    charWidthEng = 15;
    lineLimit = 26;
  } else {
    fontSize = 30;
    charWidth = 22;
    charWidthEng = 12;
    lineLimit = 33;
  }

  // 줄바꿈 처리
  const isMultiLine = message.length > lineLimit;
  const firstLine = isMultiLine ? message.substring(0, lineLimit) : message;
  const secondLine = isMultiLine ? message.substring(lineLimit) : '';

  // 첫 줄 기준 x좌표 계산
  let messageWidth = 0;
  for (const char of firstLine) {
    if (/[가-힣]/.test(char)) {
      messageWidth += charWidth;
    } else {
      messageWidth += charWidthEng;
    }
  }
  
  const messageX = 200;
  const timeX = messageX + messageWidth + 25;
  const timeY = isMultiLine ? 200 : 160;

  // 배경 이미지 로드
  const bgUrl = url.origin + '/bg.png';
  const bgResponse = await fetch(bgUrl);
  const bgBuffer = await bgResponse.arrayBuffer();
  const bgBase64 = btoa(String.fromCharCode(...new Uint8Array(bgBuffer)));

  // 메시지 텍스트 생성
  let messageText = '';
  if (isMultiLine) {
    messageText = `
      <text x="${messageX}" y="130" fill="#EEEEEE" font-size="${fontSize}" font-family="'Nanum Gothic', sans-serif" font-weight="400">
        <tspan x="${messageX}" dy="0">${firstLine}</tspan>
        <tspan x="${messageX}" dy="${fontSize + 7}">${secondLine}</tspan>
      </text>
    `;
  } else {
    messageText = `<text x="${messageX}" y="130" fill="#EEEEEE" font-size="${fontSize}" font-family="'Nanum Gothic', sans-serif" font-weight="400">${message}</text>`;
  }

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
      ${messageText}
      
      <!-- 시간 -->
      <text x="${timeX}" y="${timeY}" fill="#C2C2C2" font-size="20" font-family="'Nanum Gothic', sans-serif" font-weight="400">${time}</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
