import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import contactRouter from './routers/contactRouters';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routing
app.use('/', contactRouter);

//  Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
