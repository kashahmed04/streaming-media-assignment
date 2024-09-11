const fs = require('fs'); // pull in the file system module
// nodes path module is a collection of utilities for working with
// files and paths (allows us to create a file object from a file path)**
const path = require('path');

const loadFile = (request, response, filePath, videoType) => {
  // use path modules resolve function to create a file object**
  // the resolve function takes a directory (dirname)** and the relative path to a file
  // from that directory** (how is the party.mp4 from the dirname directory)**
  // does not load the file but creates a file object based on the file**

  // const file = path.resolve(__dirname, '../client/party.mp4');

  // is this correct how does this work (how does it put the link together)****
  // is this cleaner code or****
  // check if changing pages is ok****
  const file = path.resolve(__dirname, filePath);

  // fs modules stat function provides statistics about the file (asynchronous function
  // which runs in the background at the same time the main process is running)**
  // stat function takes a file object and a callback function of what to do
  // next (after it loads)**
  // why do we need the statisitics about a file**

  // The callback of this function receives an err field and a stats object.** If the err field
  // is not null, then there was an error. In that event we will respond with an error. If
  // the error code is ‘ENOENT’ (Error No Entry), then the file could not be found. We
  // will set the status code to 404. In the event of any error, we will send the error
  // back to the client for now

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      // why do we need a return here whereas before in htmlResponses
      // we did not need it and we just did response.end()**
      return response.end(err);
    }

    // we ned to see if the client sends us a range header
    // if there is not a range header for the request then we start
    // at the beginning of the file (or byte 0)

    // requests to stream media are sent with a range header that requests
    // a byte range of the file (the bytes representing the part
    // of the media they want)

    // As the file streams or the user moves around in the file time,
    // new requests will be sent to the server asking for a new range
    // to add to the browser’s buffer**

    // To keep memory low and processing efficient, we will only send the bytes
    // requested and only if they are valid. This means not loading the entire file into
    // memory, but only loading a particular range of bytes from the file

    // this line says grab the range element out of the
    // request.headers object, and store it in a
    // new variable I am making called range**
    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    // Example of byte range header without the ending range (common) bytes=63995904-
    // What we need to do is grab the string, replace the word bytes= with nothing and
    // then that will give us 0000-0001. Then we can split on the - to get an array of
    // beginning and end positions. ['0000', '0001']. (this is the beginning and
    // end ranges of the audio the client wants)**
    const positions = range.replace(/bytes=/, '').split('-');

    // Next we'll parse the first position (starting range) to an int. The second parameter
    // of parseInt is which number base to use. 10 means base 10 which is typical
    // human readable numbers and what we'll need for the file.
    // why do we only do the first position**
    let start = parseInt(positions[0], 10);

    // Stats.size will give us the total file size in bytes.
    const total = stats.size;

    // Next, we just need to check if we got an end position from the client. If not, we
    // will just set our end position to the end of the file. (total - 1)**
    // If so, we will parse it into base
    // 10.
    // why do we check if here if there was an end point but not in the start as well**
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    // In the event that the start range is greater than the end range, we will need to
    // reset the start range because**
    if (start > end) {
      start = end - 1;
    }

    // we need to determine how big of a chunk we are sending
    // back to the browser in bytes (why plus one here)**
    const chunksize = (end - start) + 1;

    // 206 is a success code and it tells the browser that it can
    // request other ranges (before or after), but it has not recieved the entire file**
    response.writeHead(206, {
      // how much are we sending out of the total (as a string)
      'Content-Range': `bytes ${start}-${end}/${total}`,
      // tells the browser what type of data to expect the range in (usually bytes or none)
      'Accept-Ranges': 'bytes',
      // tells the browser how big this chunk is in bytes (how did we know to put chunksize)**
      'Content-Length': chunksize,
      // tells the browser the encoding type so that it can reassemble the byte correctly**
      'Content-Type': videoType,
    });

    // create a file stream (take file object and an object
    // containing the start and end points in bytes to only load what we need)
    // the streams are asynchronous so we need to have callback functions for
    // when the stream is in the open or error status
    const stream = fs.createReadStream(file, { start, end });

    // when the file opens (stream.on)** we connect the file stream to our response
    // with the streams pipe function
    // the pipe function is a stream function in node that will set the
    // output of a stream to another stream (key to keep it lightweight)**

    // We are piping the file stream directly to our client response. This means as one
    // byte is read in from the response, it is written back to the client. Since it only
    // reads a few bytes, sends them, and replaces them with new bytes from the file,
    // our memory usage stays very low.
    stream.on('open', () => {
      stream.pipe(response);
    });

    // In the event of an error (usually running out of bytes), we will end the response
    // and return our stream error. This will tell the browser to stop listening for bytes.
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

module.exports.loadFile = loadFile;
