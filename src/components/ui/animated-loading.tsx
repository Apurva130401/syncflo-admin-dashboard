'use client';

export function AnimatedLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse" />
    </div>
  );
}
