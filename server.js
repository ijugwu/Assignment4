const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData.js");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize college data before setting up routes
collegeData.initialize()
  .then(() => {
    console.log("Data initialized. Setting up routes.");

    // Route for homepage
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, 'views', 'home.html'));
    });

    // Route for fetching all students or students by course
    app.get("/students", (req, res) => {
      const { course } = req.query;
      const studentsPromise = course ? collegeData.getStudentsByCourse(course) : collegeData.getAllStudents();
      studentsPromise
        .then((students) => res.json(students))
        .catch(() => res.status(500).json({ message: "Failed to fetch students" }));
    });

    // Route for fetching TAs
    app.get("/tas", (req, res) => {
      collegeData.getTAs()
        .then((tas) => res.json(tas))
        .catch(() => res.status(500).json({ message: "Failed to fetch TAs" }));
    });

    // Route for fetching courses
    app.get("/courses", (req, res) => {
      collegeData.getCourses()
        .then((courses) => res.json(courses))
        .catch(() => res.status(500).json({ message: "Failed to fetch courses" }));
    });

    // Route for fetching a student by number
    app.get("/student/:num", (req, res) => {
      const studentNum = req.params.num;
      collegeData.getStudentByNum(studentNum)
        .then((student) => res.json(student))
        .catch(() => res.status(404).json({ message: "Student not found" }));
    });

    // Route for serving add student form
    app.get("/students/add", (req, res) => {
      res.sendFile(path.join(__dirname, 'views', 'addStudent.html'));
    });

    // Route for submitting new student data
    app.post("/students/add", (req, res) => {
      collegeData.addStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch((err) => {
          console.error(err);
          res.status(500).send("Failed to save student data");
        });
    });

    // Route for about page
    app.get("/about", (req, res) => {
      res.sendFile(path.join(__dirname, 'views', 'about.html'));
    });

    // Catch-all route for handling unmatched routes
    app.use((req, res) => {
      res.status(404).send("Page Not Found");
    });

    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port:", HTTP_PORT);
    });

  })
  .catch(err => {
    console.error("Failed to initialize data:", err);
  });
