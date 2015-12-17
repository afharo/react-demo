var express = require('express');
var router = express.Router();

/* GET all entries listing. */
router.get('/', function(req, res, next) {
  getEntries({}, function (err, docs) {
    if (err) {
      console.error(err);
      res.send({status:"ERROR", error:err});
    } else {
      res.send({status:"OK", results:docs});
    }
  });
});

/* GET all entries from user. */
router.get('/user/:user', function(req, res, next) {
  getEntries({ 'user':req.params.user }, function (err, docs) {
    if (err) {
      console.error(err);
      res.send({status:"ERROR", error:err});
    } else {
      res.send({status:"OK", results:docs});
    }
  });
});

/* POST entry for user. */
router.post('/user/:user', function(req, res, next) {
  var document = {
    user: req.params.user,
    date: new Date(parseInt(req.body.date)),
    text: req.body.text
  };
  entriesDB.insertOne(document, {w:1}, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log('Document inserted!');
      console.info(result);
      getEntries({ 'user':req.params.user }, function (err, docs) {
        if (err) {
          console.error(err);
          res.send({status:"ERROR", error:err});
        } else {
          res.send({status:"OK", results:docs});
        }
      });
    }
  });
});

/*
  Get Entries stored in MongoDB
  @param filter - MongoDB format query
  @param callback - Function call after the query. Sends err and docs as params.
*/
function getEntries(filter, callback) {
  if (entriesDB) {
    entriesDB.find(filter).sort({date:-1}).toArray(function (err, docs) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, docs);
      }
    });
  } else {
    callback('API not connected to database. Try again or contact with afharo@gmail.com', null);
  }
}

// Connection stage
var MongoClient = require('mongodb').MongoClient;

var url = process.env.MONGODB_URL || '';
if (url === '') {
  console.error('MONGODB_URL not defined!');
  process.exit(1);
}

var entriesDB = null;

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.error(err);
  }
  entriesDB = db.collection('entries');
});

module.exports = router;
