const express = require("express");
const { loginUser, registerUser } = require('../controllers/userController')

const { uploadProfilePic, updateBio } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");
const requireAuth = require("../middleware/requireAuth")

const router = express.Router();


router.post('/login', loginUser);
router.post('/register', registerUser);



router.use(requireAuth);
router.post("/upload-profile", upload.single("image"), uploadProfilePic);
router.put("/update-bio", updateBio)

module.exports = router;
