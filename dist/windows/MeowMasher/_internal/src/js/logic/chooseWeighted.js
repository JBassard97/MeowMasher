export function chooseWeighted(weights) {
  const entries = Object.entries(weights); // [ ["mps",2], ["mew",1] ]
  const total = entries.reduce((sum, [, w]) => sum + w, 0);

  let r = Math.random() * total;

  for (const [key, weight] of entries) {
    if ((r -= weight) <= 0) return key;
  }
}
