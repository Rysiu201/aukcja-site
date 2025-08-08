import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendWinnerEmail(to: string, auctionTitle: string, amount: number) {
    if (!to) {
      this.logger.warn('Missing recipient for winner email');
      return;
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const message = {
      from,
      to,
      subject: `Wygrana aukcja: ${auctionTitle}`,
      text: `Gratulacje! Wygrałeś aukcję \"${auctionTitle}\" z ofertą ${amount}.`,
    };
    try {
      await this.transporter.sendMail(message);
    } catch (err) {
      this.logger.error('Failed to send winner email', err);
    }
  }
}
