const express = require("express");
const process = require("process"); // Required to mock environment variables

const projectId = "uofthacksix-chamomile";
const location = "us"; // Format is 'us' or 'eu'
const processorId = "55e7c48bc5f6701b"; // Create processor in Cloud Console

// [START gae_flex_storage_app]
const { format } = require("util");
const Multer = require("multer");
// var formidable  = require('formidable')

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine
const { Storage } = require("@google-cloud/storage");
const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

var fs = require("fs");
var readline = require("readline");
const { text } = require("express");
const res = require("express/lib/response");
const { match } = require("assert");

const docClient = new DocumentProcessorServiceClient();

// Instantiate a storage client
const storage = new Storage();

const app = express();
const port = process.env.PORT || 5000;
app.set("view engine", "pug");

// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

// A bucket is a container for objects (files).
const bucket = storage.bucket("chamomile-uploaded-images");

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// create a GET route
app.get("/", (req, res) => {
  // res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
  res.render("form.pug");
});

// const upload = Multer({
//   dest:"/temp"
// });

// app.post(
//   "/upload",
//   upload.single("file" /* name attribute of <file> element in your form */),
//   (req, res) => {
//     try {
//       res.send(req.file);
//     }catch(err) {
//       res.send(400);
//     }
//   }
// );

var byteContent;

// Process the file upload and upload to Google Cloud Storage.
app.post("/upload", multer.single("file"), (req, res, next) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  byteContent = req.file;

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );

    encodedImage = Buffer.from(byteContent["buffer"]).toString("base64");
    if (req.file.originalname.endsWith(".png")) {
      mime = "image/png";
    } else {
      mime = "image/jpeg";
    }
    processImage(encodedImage, mime, function(matches) {
      res.status(200).send(sort_object(matches));
    });

    
    
   
  });

  blobStream.end(req.file.buffer);
});

function sort_object(obj) {
  items = Object.keys(obj).map(function(key) {
      return [key, obj[key]];
  });
  items.sort(function(first, second) {
      return second[1] - first[1];
  });
  sorted_obj={}
  items.forEach(v => {
    use_key = v[0]
    use_value = v[1]
    sorted_obj[use_key] = use_value
  });
  return(sorted_obj)
} 

const processImage = async (encodedImage, mime, _callback) => {
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType: mime,
    },
  };

  // Recognizes text entities in the PDF document
  const [result] = await docClient.processDocument(request);
  const { document } = result;

  // Get all of the document text as one big string
  const { text } = document;

  extractGeneNames(text, function(matches){
    _callback(matches);
  });


};

const extractGeneNames = (body, _callback) => {

  textSet = new Set(body.split(/\W+/));
  matchSet = {};

  console.log(textSet);

  var rd = readline.createInterface({
    input: fs.createReadStream("./geneNames.txt"),
    console: false,
  });

  rd.on("line", function (line) {
    if (textSet.has(line) && line.length >= 3){
      var re = new RegExp("\\b" + line + "\\b", 'g');
      var count = (body.match(re) || []).length;
      matchSet[line] = count;
    }
  });

  
//   app.post('/user' , (req,res)=>{
//     // 200 status code means OK
//     res.status(200).send(matchSet); 
//  })


  rd.on('close', function() {
    console.log("done searching");
    _callback(matchSet);
  });  

  return(matchSet);

};

module.exports = app;
