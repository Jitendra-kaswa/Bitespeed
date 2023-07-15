import express,{Request, Response} from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req:Request, res:Response) => {
  res.send('Server started ...');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
