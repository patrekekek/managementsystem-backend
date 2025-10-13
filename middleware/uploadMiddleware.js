const multer = require("multer");
const path = require("path");
const os = require("os");

// store temporarily in OS temp folder
const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
});

module.exports = upload;
