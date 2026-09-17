require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const { seedSystemUsers } = require("./modules/academic-master/services/user.service");
const { seedPDFSubjects } = require("./modules/academic-master/services/subject.service");

const authRoutes = require("./modules/academic-master/routes/auth.routes");
const { getMe } = require("./modules/academic-master/controllers/auth.controller");
const { authenticate } = require("./middlewares/auth.middleware");

const campusRoutes = require("./modules/academic-master/routes/campus.routes");
const branchRoutes = require("./modules/academic-master/routes/branch.routes");
const campusBranchAvailabilityRoutes = require("./modules/academic-master/routes/campusBranchAvailability.routes");
const academicYearRoutes = require("./modules/academic-master/routes/academicYear.routes");
const semesterRoutes = require("./modules/academic-master/routes/semester.routes");
const sectionRoutes = require("./modules/academic-master/routes/section.routes");
const subjectRoutes = require("./modules/academic-master/routes/subject.routes");
const studentRoutes = require("./modules/academic-master/routes/student.routes");
const userRoutes = require("./modules/academic-master/routes/user.routes");
const internalRoutes = require("./modules/academic-master/routes/internal.routes");
const dashboardRoutes = require("./modules/academic-master/routes/dashboard.routes");

const app = express();

app.use(express.json());

connectDB().then(async () => {
    try {
        await seedSystemUsers();
        await seedPDFSubjects();
    } catch (err) {
        console.error("Initialization error:", err.message);
    }
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Academic Management Backend is running"
    });
});

app.use("/api/auth", authRoutes);
app.get("/api/me", authenticate, getMe);

app.use("/api/campuses", campusRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/campus-branch-availability", campusBranchAvailabilityRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});