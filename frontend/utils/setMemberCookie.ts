// This sets s cooke that will tell the platform that this person has signed up or signed in for an account before

export function setMemberCookie() {
  document.cookie = `member=true; path=/; max-age=31536000`; // 1 year
}
