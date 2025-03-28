const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // ✅ Ensure JSON body parsing is enabled

connectDB();

// ✅ Health check route (changed to `/`)
app.get("/", (req, res) => {
    res.status(200).send("Healthy ✅");
});

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const grammarRoutes = require("./routes/grammarRoutes");

// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use("/api/grammar", grammarRoutes);

// ✅ Use Railway's assigned port and listen on all interfaces
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🔥 Server running on port ${PORT}`));
