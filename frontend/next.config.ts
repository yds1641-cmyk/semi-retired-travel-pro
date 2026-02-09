/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 넷리파이에서 페이지를 찾을 수 있게 해주는 핵심 설정입니다!
  images: {
    unoptimized: true, // 배포 시 이미지 에러를 방지합니다.
  },
};

export default nextConfig;