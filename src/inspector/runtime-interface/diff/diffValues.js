export default function diffValues(left, right) {
  // If either value is hidden behind a getter: we can't really diff that,
  // so return null.
  if (left === null || right === null) {
    return null;
  }

  // TODO: Given two value objects, construct a new value object with
  // useful information about their differences. For instance, diff between
  // two strings might store a structural representation of that difference
  // (patch object) on the `data` key.
  return {
    // Returning `right` is just a stopgap until I have time to think properly about this
    ...right,
    identifier: [left.identifier, right.identifier],
  };
}
