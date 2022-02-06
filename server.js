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
    processImage(encodedImage, mime);

    // res.status(200).send(publicUrl);
    
   
  });

  blobStream.end(req.file.buffer);
});

const processImage = async (encodedImage, mime) => {
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

  extractGeneNames(text);
};

const extractGeneNames = (body) => {

  textSet = new Set(body.split(/\W+/));
  matchSet = {};

  console.log(textSet);

  var rd = readline.createInterface({
    input: fs.createReadStream("./geneNames.txt"),
    console: false,
  });

  rd.on("line", function (line) {
    if (textSet.has(line)){
      var re = new RegExp("\\b" + line + "\\b", 'g');
      var count = (body.match(re) || []).length;
      matchSet[line] = count;
    }
  });

  

  rd.on('close', function() {
    console.log("done searching");
    console.log(matchSet);
    app.post('/user' , (req,res)=>{

      for(let gene of m ) 

      res.status(200).send(matchSet); 
    })
  });  

};

module.exports = app;
