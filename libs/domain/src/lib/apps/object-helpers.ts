export function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = 31 * h + str.charCodeAt(i)
  }
  return h & 0xffffffff
}

export function hashCodeArr(strs: string[]): number {
  return strs.reduce((prev, s) => prev + hashCode(s), 0)
}
