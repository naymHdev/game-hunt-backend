import httpStatus from 'http-status';
import AppError from '../../app/error/AppError';
import QueryBuilder from '../../app/builder/QueryBuilder';
import NewsLetter from './newsletter.model';
import { idConverter } from '../../utility/idCoverter';

type TNewsLater = {
  email: string;
};

export const addNewsletterMail = async (userId: string, payload: TNewsLater) => {
  try {
    console.log(payload);
    const { email } = payload;
    console.log(userId);

    // const userIdObject = await idConverter(userId)

    const isExist = await NewsLetter.findOne({
      email,
      isDeleted: { $ne: true },
    });

    if (isExist) {
      throw new AppError(httpStatus.FORBIDDEN, 'Mail already exist', '');
    }
    const addNewsletterMailBuilder = new NewsLetter({ email: email });
    console.log(addNewsletterMailBuilder);
    const result = await addNewsletterMailBuilder.save();
    return (
      result && { status: true, message: 'successfully add newsletter email' }
    );
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      ' addNewsletterMail server unavailable',
      error.message,
    );
  }
};

const findAllNewsletterEmailIntoDb = async (query: Record<string, unknown>) => {
  try {
    const allNewsletterMailQuery = new QueryBuilder(NewsLetter.find(), query)
      .search(['email'])
      .filter()
      .sort()
      .pagination()
      .fields();

    const emails = await allNewsletterMailQuery.modelQuery;

    const meta = await allNewsletterMailQuery.countTotal();


    return { meta, emails };
  } catch (error: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'allNewsletterMailQuery server unavailable',
      '',
    );
  }
};

const deleteAllNewsletterIntoDB = async () => {
  const newsletterEmailCount = await NewsLetter.countDocuments({
    isDeleted: false,
  });
  if (newsletterEmailCount < 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'There is no newsletter subscribe email',
      '',
    );
  }

  const deleteAll = await NewsLetter.deleteMany({ isDeleted: false });

  return deleteAll;
};

const deleteNewsletterIntoDB = async (newsletterId: string) => {
  if (!newsletterId) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid newsletter Id', '');
  }

  const newletterIdObject = await idConverter(newsletterId)
  const deleteOne = await NewsLetter.deleteOne({ _id: newletterIdObject });

  return deleteOne;
};

const newsletterService = {
  addNewsletterMail,
  findAllNewsletterEmailIntoDb,
  deleteAllNewsletterIntoDB,
  deleteNewsletterIntoDB,
};

export default newsletterService;
