require("dotenv").config({ path: "../.env" });

const express = require("express");
const connectDB = require("./config/db");
const { seedSystemUsers } = require("./modules/academic-master/services/user.service");

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

const midMarkRoutes = require("./modules/midmarks-Timetable/routes/midMark.routes");
const timetableRoutes = require("./modules/midmarks-Timetable/routes/timetable.routes");

const resultRoutes = require("./modules/results-backlogs/routes/resultRoutes");
const backlogRoutes = require("./modules/results-backlogs/routes/backlogRoutes");
const riskRoutes = require("./modules/results-backlogs/routes/riskRoutes");
const supplyApplicationRoutes = require("./modules/results-backlogs/routes/supplyApplicationRoutes");
const resultUploadRoutes = require("./modules/results-backlogs/routes/resultUploadRoutes");
const analyticsRoutes = require("./modules/results-backlogs/routes/analyticsRoutes");


const app = express();

app.use(express.json());

connectDB().then(async () => {
    try {
        await seedSystemUsers();
    } catch (err) {}
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

app.use("/api/mid-marks",midMarkRoutes);
app.use("/api/timetables",timetableRoutes);

app.use("/api/results", resultRoutes);
app.use("/api/results", resultUploadRoutes);
app.use("/api/backlogs", backlogRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/supply-applications", supplyApplicationRoutes);
app.use("/api/analytics", analyticsRoutes);


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