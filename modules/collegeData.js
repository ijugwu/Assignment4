const fs = require('fs').promises;

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      const studentsData = await fs.readFile('./data/students.json', 'utf8');
      const coursesData = await fs.readFile('./data/courses.json', 'utf8');
      const students = JSON.parse(studentsData);
      const courses = JSON.parse(coursesData);
      dataCollection = new Data(students, courses);
      resolve();
    } catch (error) {
      reject("Failed to initialize data");
    }
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject("No students found");
    }
  });
}

function getTAs() {
  return new Promise((resolve, reject) => {
    if (dataCollection) {
      const tas = dataCollection.students.filter(student => student.TA);
      if (tas.length > 0) {
        resolve(tas);
      } else {
        reject("No TAs found");
      }
    } else {
      reject("Data not initialized");
    }
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject("No courses found");
    }
  });
}

// New function: getStudentsByCourse
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("Data not initialized");
            return;
        }
        const filteredStudents = dataCollection.students.filter(student => student.course == course);
        if (filteredStudents.length > 0) {
            resolve(filteredStudents);
        } else {
            reject("No results returned for course " + course);
        }
    });
}

// New function: getStudentByNum
function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("Data not initialized");
            return;
        }
        const student = dataCollection.students.find(student => student.studentNum == num);
        if (student) {
            resolve(student);
        } else {
            reject("No results returned for student number " + num);
        }
    });
}

function addStudent(studentData) {
  return new Promise(async (resolve, reject) => {
      try {
          // If TA is undefined, set it to false, otherwise true
          studentData.TA = !!studentData.TA;

          // Set the studentNum property
          studentData.studentNum = dataCollection.students.length + 1;

          // Push the updated studentData object onto the students array
          dataCollection.students.push(studentData);

          // Save the updated students array back to the file
          await fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 4), 'utf8');

          resolve();
      } catch (error) {
          reject("Failed to add student");
      }
  });
}

// Exporting functions
module.exports = { initialize, getAllStudents, getTAs, getCourses, getStudentsByCourse, getStudentByNum, addStudent };