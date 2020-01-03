export function parseGenderFromZhihuGenderID(id: number, username: string) {
  if (id === 1 && username !== '') {
    return 'male';
  } else if (id === 0) {
    return 'female';
  } else {
    return 'unknown';
  }
}

export function getCurrentTime() {
  return Math.floor(Date.now() / 1000);
}
