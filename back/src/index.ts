import koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import mongoose from 'mongoose'
import api from './api'
import jwtMiddlware from './lib/jwtMiddlware';
import 'dotenv/config'
import {callFindBluChip} from './api/company/findStock'

const app = new koa();
app.use(bodyParser());

const {PORT, MONGO_URL} = process.env;
const router = new Router();

mongoose.connect(`${MONGO_URL}`, {useNewUrlParser: true, useFindAndModify: false})
    .then(() => {
        console.log("connect to mongodb");
    })
    .catch((e: Error) => {
        console.log(e.message);
    }) 

router.use('/api', api.routes())

app.use(bodyParser())   // bodyparser
app.use(jwtMiddlware)
app.use(router.routes()).use(router.allowedMethods);



app.listen(PORT, () => {
    console.log("node server connect port is ", PORT);
    callFindBluChip();
})


