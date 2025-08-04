export const closureCounter = () => {
  let result = 0;
  return (n: number = 1) => (result += n);
};
