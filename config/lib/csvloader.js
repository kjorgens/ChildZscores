'use strict';

module.exports.csvUploadFileFilter = function (req, file, cb) {
  if (file.mimetype !== 'text/csv') {
    return cb(new Error('Only csv files are allowed!'), false);
  }
  cb(null, true);
};
