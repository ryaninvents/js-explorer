export const propMatcher = (name) => (p) => p && p.name === name;

export const propFinder = (name) => {
  const isMatch = propMatcher(name);
  return (properties) => properties.find(isMatch);
};
