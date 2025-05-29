import httpStatus from 'http-status';
import configList from '../config/index';
import AppError from '../error/AppError';
import { transporter } from './mailer.config';

export const sendMail = async (to: string, subject: string, html: string):Promise<void> => {
  const mailOptions = {
    from: configList.owner_mail,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return ;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send email',
      error as any
    );
  }
};
