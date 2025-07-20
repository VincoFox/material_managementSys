export const Loading = ({ className = '' }: { className: string }) => (
  <div
    className={`fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50 ${className}`}
  >
    <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
  </div>
);
