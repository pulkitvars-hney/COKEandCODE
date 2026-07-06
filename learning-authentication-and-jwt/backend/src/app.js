const express= require('express');
const router= require('./routes/auth.routes');
const router2= require('./routes/artist.routes');

const app= express();
const cookieParser= require('cookie-parser');
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', router);
app.use('/api/music', router2);

module.exports= app;
