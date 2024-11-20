// server/uploadConfig.js
const multer = require('multer');
const path = require('path');

// Existing storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const fileName =
      file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

const saveFile = (file) => {
  // Return the relative path to be saved in the database
  return `uploads/${file.filename}`;
};

// **New multer instance for character level uploads**
const characterLevelUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/json'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only .png, .jpg, and .json files are allowed for character levels'
        )
      );
    }
  },
});

module.exports = { upload, saveFile, characterLevelUpload };
