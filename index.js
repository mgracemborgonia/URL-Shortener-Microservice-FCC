require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require("mongodb");
const dns = require("dns");
const parse_url = require("url");
const client = new MongoClient(process.env.DB_URL);
const db = client.db("url-shortener-microservice");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  const { url } = req.body;
  dns.lookup(parse_url.parse(url).hostname, async function(err, address) {
    if(!address){
      const obj = {error: 'invalid url'}
      res.json(obj);
    }else{
      const url_count_docu = await urls.countDocuments({});
      const url_docu = {
        url,
        short_url: url_count_docu
      }
      const result = await urls.insertOne(url_docu);
      console.log(result);
      const obj = {
        original_url: url,
        short_url: url_count_docu
      }
      res.json(obj);
    }
  });
  //res.json({ greeting: 'hello API' });
});
app.get('/api/shorturl/:short_url', async function(req, res){
  const shortUrl = req.params.short_url;
  const url_docu = await urls.findOne({short_url: +shortUrl});
  res.redirect(url_docu.url);
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
