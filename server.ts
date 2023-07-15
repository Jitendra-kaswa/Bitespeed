import express,{Request, Response} from 'express';
import bodyParser from 'body-parser';
import contactRouter from './routers/contactRouters';
import { Database } from 'sqlite3';
import { ContactModel } from './models/contact';

const app = express();
const port = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', contactRouter);

//  Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
