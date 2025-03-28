const express = require("express");
const { checkGrammar, modifiedCheckGrammar } = require("../controllers/grammarController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Protect this route with authentication middleware
router.post("/check-modify/", authMiddleware, modifiedCheckGrammar);
router.post("/check/", authMiddleware, checkGrammar);

module.exports = router;
