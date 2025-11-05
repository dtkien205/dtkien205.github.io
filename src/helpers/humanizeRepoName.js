export function humanizeRepoName(name) {
  if (!name || typeof name !== 'string') return '';

  // Tách theo camelCase/PascalCase ; giữa số & chữ
  let spaced = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  return spaced
    .split(' ')
    .map(w => {
      const up = w.toUpperCase();
      if (up == 'CTF') return up;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}
