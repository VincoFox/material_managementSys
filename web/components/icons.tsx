export const LoaderIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      className='mr-2 h-5 w-5 animate-spin text-white'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8v8h-8z'
      ></path>
    </svg>
  );
};
