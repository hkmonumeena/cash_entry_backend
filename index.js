require('dotenv').config();
var http = require('http');
const router = http.Router;

//const mongoose = require('mongodb');
const mongoose = require('mongoose');
const mongoUri = process.env.DBURI;
const port = 3000;
const db = mongoose.connection;

mongoose.connect(mongoUri,{
  useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
}).then(()=>{
console.log("kghjdkfg");
}).catch((err)=>{
  console.log(err);
});

http.createServer(function (req, res) {
  res.write('A Monk in Cloud'); //write a response to the client
  res.end(); //end the response
}).listen(80); 


// Connection status API endpoint
router.get('/status', (req, res) => {
  if (db.readyState === 1) {
      res.json({ status: "success", message: "MongoDB is connected." });
  } else {
      res.json({ status: "fail", message: "MongoDB is not connected." });
  }
});


