export function cn(...inputs: any[]): string {
  return inputs
    .flatMap((x) => (typeof x === 'object' && x !== null ? Object.keys(x).filter((k) => x[k]) : x))
    .filter((x) => typeof x === 'string' && x.trim() !== '')
    .join(' ');
}
export default cn;
