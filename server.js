var express = require('express');
var app = express();
var shortId = require('shortId');
var MongoClient = require('mongodb').MongoClient;
var validUrl = require('valid-url');


app.get('/', function(req, res){
  res.send('hello world');
});

MongoClient.connect("mongodb://localhost:27017/shortId", function(err, db){
  if(err) throw err;
  console.log("Successfully connected to MongoDB.");

  app.get('/:shortId', function(req, res){
      var id = req.params.shortId
      db.collection('shortIds').find({url: id}).toArray(function(err, docs){
      res.send(docs);
    });
  });

  app.get('/new/*', function(req, res){
    var input = req.url.split('/').slice(2,99).join('/');
    var collection = db.collection('shortIds');
    if (validUrl.isUri(input)){
        collection.find({original_url: input}, {_id: 0}).toArray(function(err, docs){
          if(docs.length>0){
            res.send(docs[0]);
          }else{
            var id = shortId.generate();
            collection.insert({shortId: 'herokuDomain' + id, original_url: input})
            res.send({shortId: 'herokuDomain' + id, original_url: input});
          }
        });
    } else {
        res.send(input + '   Not a URI');
    }
  });

})

app.listen(3000, function(){
  console.log('express server listening on port 3000...');
});
