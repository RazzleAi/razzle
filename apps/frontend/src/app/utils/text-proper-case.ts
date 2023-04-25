// FUnction to convert text to proper case
export function textProperCase(text: string): string {
  return text
    ?.split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
//
