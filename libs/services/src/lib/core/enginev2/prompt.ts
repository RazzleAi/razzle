export class Prompt {
  constructor(
    private readonly text: string,
    private readonly vars: Map<string, string>
  ) {}

  public toString(): string {
    // loop through vars and replace them in the text
    let result = this.text

    this.vars.forEach((value, key) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value)
    })

    return result
  }
}
