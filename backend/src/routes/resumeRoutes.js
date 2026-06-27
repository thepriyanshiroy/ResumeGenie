const express = require("express");

const resumeController = require("../controllers/resumeController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

// Protect all resume routes
router.use(authMiddleware.protect);
router.post(
    '/upload',
    upload.single('resume'),
    resumeController.uploadResume
);
router
  .route("/")
  .get(resumeController.getAllResumes);


router
  .route("/:id")
  .get(resumeController.getResume)
  .delete(resumeController.deleteResume);

module.exports = router;