export const pathToProfessionMap = {
  frontend: 'frontend',
  backend: 'backend',
  fullstack: 'fullstack',
  data: 'data',
  mobile: 'mobile',
  database: 'database',
  cloud: 'cloud',
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const professionMatchesPath = (jobProfession, selectedPath) => {
  const targetProfession = pathToProfessionMap[selectedPath];

  if (!targetProfession || !jobProfession) {
    return false;
  }

  const normalizedProfession = String(jobProfession).toLowerCase().trim();
  const normalizedTarget = String(targetProfession).toLowerCase().trim();

  if (!normalizedProfession || !normalizedTarget) {
    return false;
  }

  // Match profession by word boundary so "data" does not match "database".
  const escapedTarget = escapeRegExp(normalizedTarget);
  const boundaryPattern = new RegExp(`(^|[^a-z0-9])${escapedTarget}([^a-z0-9]|$)`, 'i');

  return boundaryPattern.test(normalizedProfession);
};
