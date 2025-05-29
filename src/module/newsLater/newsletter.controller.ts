import { RequestHandler } from 'express';
import catchAsync from '../../utility/catchAsync';
import sendResponse from '../../utility/sendResponse';
import httpStatus from 'http-status';
import newsletterService from './newsletter.services';

const addNewsletterMail: RequestHandler = catchAsync(async (req, res) => {
  const result = await newsletterService.addNewsletterMail(req.user?._id!, req.body.data);
  console.log(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully add email to newsletter',
    data: result,
  });
});

const findAllNewsletterEmail: RequestHandler = catchAsync(async (req, res) => {
  const result = await newsletterService.findAllNewsletterEmailIntoDb(
    req.query,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully retrieve newsletter emails',
    data: result,
  });
});

const deleteAllNewsletter: RequestHandler = catchAsync(async (req, res) => {
  const result = await newsletterService.deleteAllNewsletterIntoDB();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully delete all the newsletter emails',
    data: result,
  });
});

const deleteNewsletter: RequestHandler = catchAsync(async (req, res) => {
  const result = await newsletterService.deleteNewsletterIntoDB(
    req.body.data.newsletterId,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'successfully delete newsletter email',
    data: result,
  });
});

const newsletterController = {
  addNewsletterMail,
  findAllNewsletterEmail,
  deleteAllNewsletter,
  deleteNewsletter,
};

export default newsletterController;
