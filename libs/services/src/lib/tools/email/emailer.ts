export interface Emailer {
  sendEmail(recipient: string, subject: string, message: string): Promise<boolean>
}
