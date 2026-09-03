export function stripPassword(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

export function stripPasswordList(list) {
  return list.map(stripPassword);
}
