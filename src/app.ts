import express from 'express';
import cors from 'cors';
import notFound from './middleware/notFound';
import globalErrorHandelar from './middleware/globalErrorHandelar';
import router from './router';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/src/uploads', express.static('src/uploads'));

app.get('/', (req, res) => {
  res.send({
    status: true,
    message: 'Well Come To Contruct Management Server',
  });
});

// Error Handeller

// router handeller
app.use('/api/v1', router);

app.use(notFound);
app.use(globalErrorHandelar);

export default app;
