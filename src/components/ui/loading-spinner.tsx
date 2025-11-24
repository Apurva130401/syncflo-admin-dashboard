'use client'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div
        className="w-16 h-16 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin"
        style={{ borderTopColor: '#3b82f6' }}
      />
    </div>
  );
}
