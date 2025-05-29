import nodemailer from 'nodemailer';
import configList from '../config/index'

export const transporter = nodemailer.createTransport({
  host: configList.smtp_host,
  port:Number(configList.smtp_port),
  secure:false,
  auth:{
    user:configList.owner_mail,
    pass:configList.mail_password
  },
  // tls: {
  //   ciphers: 'SSLv3',
  // },

});

transporter.verify((error, success) => {
    if (error) {
      console.error('Nodemailer connection error:', error);
    } else {
      console.log('Nodemailer is ready to send emails 🚀');
    }
  });