export const showMessageIcon = (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrendLine = ({ up }) => (
  <svg width="56" height="24" viewBox="0 0 56 24" fill="none">
    <path
      d={up ? 'M2 20 C16 15, 32 9, 46 5 L54 3' : 'M2 4 C16 9, 32 15, 46 19 L54 22'}
      stroke={up ? '#22c55e' : '#E52321'}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);