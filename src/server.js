const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const mediaHandler = require('./mediaResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// start the server and listen for HTTP traffic

const onRequest = (request, response) => {
  // the request.url is the URL after the domain:port (the pathname after the /
  // and including the /)**
  // does it put a / by default for the request.url
  // even though no / was in the url (127.0.0.1:3000)**
  console.log(request.url);

  // default case is index page so if the user types in something weird we send
  // them back the index page
  //this is correct right (go over what each case is supposed to do)****
  //why do we need all these cases if the client.html also shows the video/audio loading****
  //get party.mp4, bling.mp3, and bird.mp4 working****
  switch (request.url) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/party.mp4':
      mediaHandler.loadFile(request, response, '../client/party.mp4');
      break;
    case '/page2':
      htmlHandler.getPage2(request, response);
      break;
    case '/bling.mp3':
      mediaHandler.loadFile(request, response, '../client/bling.mp3');
      break;
    case '/page3':
      htmlHandler.getPage3(request, response);
      break;
    case '/bird.mp4':
      mediaHandler.loadFile(request, response, '../client/bird.mp4');
      break;
    default:
      htmlHandler.getIndex(request, response, '/');
      break;
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
