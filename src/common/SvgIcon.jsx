export const TrendLine = ({ up }) => (
  <svg width="72" height="32" viewBox="0 0 72 32" fill="none">
    <path
      d={
        up
          ? 'M2 24 C6 22, 10 20, 14 18 C18 16, 20 22, 25 18 C30 14, 34 10, 40 8 C46 6, 50 9, 56 6 C60 4, 64 3, 70 2'
          : 'M2 8 C6 9, 10 8, 14 10 C18 12, 20 8, 26 12 C32 16, 36 14, 42 18 C48 22, 54 20, 60 24 C64 26, 67 27, 70 28'
      }
      stroke={up ? '#22c55e' : '#E52321'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);