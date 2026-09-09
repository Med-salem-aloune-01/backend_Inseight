
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { Course } from './models/Course.js';
import Department from './models/Department.js';
import { Teacher } from './models/User.js';
import { Quiz, Question, Choice } from './models/Quiz.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    // =====================================================
    // 1. FIND EXISTING DEPARTMENT
    // =====================================================

    const department = await Department.findOne({
      name: 'mathematics'
    });

    if (!department) {
      throw new Error('Mathematics department not found.');
    }

    console.log(`Department found: ${department.name}`);

    // =====================================================
    // 2. FIND EXISTING TEACHERS
    // =====================================================

    const teacherEmails = [
      'amine.jaziri@eduinsight.com',
      'yassine.khalfallah@eduinsight.com',
      'mohamed.trabelsi@eduinsight.com',
      'sabrine.guidara@eduinsight.com',
      'ahmed.benali@eduinsight.com'
    ];

    const teachers = [];

    for (const email of teacherEmails) {
      const teacher = await Teacher.findOne({ email });

      if (!teacher) {
        throw new Error(`Teacher not found: ${email}`);
      }

      teachers.push(teacher);

      console.log(
        `Teacher found: ${teacher.firstName} ${teacher.lastName}`
      );
    }

    // =====================================================
    // 3. COURSE DATA
    // =====================================================

    const courseData = [
      {
        title: 'Arithmetic and Number Theory',
        description:
          'Study of integers, divisibility, prime numbers and modular arithmetic.',
        duration: 30,
        level: 'Beginner'
      },
      {
        title: 'Linear Algebra',
        description:
          'Study of vectors, matrices, linear transformations and eigenvalues.',
        duration: 35,
        level: 'Intermediate'
      },
      {
        title: 'General Algebra',
        description:
          'Introduction to groups, rings, fields and algebraic structures.',
        duration: 35,
        level: 'Intermediate'
      },
      {
        title: 'Mathematical Analysis',
        description:
          'Study of limits, continuity, sequences and mathematical functions.',
        duration: 40,
        level: 'Intermediate'
      },
      {
        title: 'Differential and Integral Calculus',
        description:
          'Study of derivatives, integrals and fundamental calculus concepts.',
        duration: 40,
        level: 'Intermediate'
      },
      {
        title: 'Euclidean Geometry',
        description:
          'Study of geometric figures, angles, triangles and classical theorems.',
        duration: 30,
        level: 'Beginner'
      },
      {
        title: 'Probability and Statistics',
        description:
          'Study of probability, distributions and statistical measures.',
        duration: 35,
        level: 'Intermediate'
      },
      {
        title: 'Numerical Analysis',
        description:
          'Study of numerical methods, approximation and computational mathematics.',
        duration: 40,
        level: 'Advanced'
      },
      {
        title: 'Mathematical Logic',
        description:
          'Study of propositions, proofs, logical operators and mathematical reasoning.',
        duration: 30,
        level: 'Intermediate'
      },
      {
        title: 'Graph Theory',
        description:
          'Study of graphs, vertices, edges, paths, trees and graph algorithms.',
        duration: 35,
        level: 'Intermediate'
      }
    ];

    // =====================================================
    // 4. TEACHER ASSIGNMENT
    // =====================================================

    const courseTeacherMap = {
      'Arithmetic and Number Theory': teachers[0]._id,
      'Linear Algebra': teachers[0]._id,

      'General Algebra': teachers[1]._id,
      'Mathematical Analysis': teachers[1]._id,

      'Differential and Integral Calculus': teachers[2]._id,
      'Euclidean Geometry': teachers[2]._id,

      'Probability and Statistics': teachers[3]._id,
      'Numerical Analysis': teachers[3]._id,

      'Mathematical Logic': teachers[4]._id,
      'Graph Theory': teachers[4]._id
    };

    // =====================================================
    // 5. FIND OR CREATE COURSES
    // =====================================================

    console.log('\nChecking courses...');

    const courses = [];

    for (const data of courseData) {
      let course = await Course.findOne({
        title: data.title
      });

      const teacherId = courseTeacherMap[data.title];

      if (course) {
        console.log(`Course exists: ${course.title}`);

        // Update teacher and department only.
        // Existing modules/lessons are NOT touched.
        course.teacher = teacherId;
        course.department = department._id;

        await course.save();
      } else {
        course = await Course.create({
          title: data.title,
          description: data.description,
          department: department._id,
          teacher: teacherId,
          duration: data.duration,
          level: data.level
        });

        console.log(`Course created: ${course.title}`);
      }

      courses.push(course);
    }

    console.log(`\nTotal courses: ${courses.length}`);

    // =====================================================
    // 6. DISPLAY TEACHER ASSIGNMENTS
    // =====================================================

    console.log('\nAssigning courses to teachers...');

    for (const course of courses) {
      const teacherId = courseTeacherMap[course.title];

      const teacher = teachers.find(
        t => t._id.toString() === teacherId.toString()
      );

      console.log(
        `${course.title} -> ${teacher.firstName} ${teacher.lastName}`
      );
    }

    // =====================================================
    // 7. QUIZ DATA
    // =====================================================

    const quizzesData = [
      // ===================================================
      // QUIZ 1
      // ===================================================
      {
        courseTitle: 'Arithmetic and Number Theory',
        title: 'Quiz 1: Arithmetic and Number Theory',
        description:
          'Test your knowledge of divisibility, primes and modular arithmetic.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'A prime number is divisible only by 1 and itself.',
            type: 'TrueFalse',
            points: 20,
            order: 1,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is the GCD (greatest common divisor) of 12 and 18?',
            type: 'MCQ',
            points: 20,
            order: 2,
            choices: [
              { text: '2', isCorrect: false },
              { text: '6', isCorrect: true },
              { text: '9', isCorrect: false },
              { text: '36', isCorrect: false }
            ]
          },
          {
            statement:
              'Which theorem states that every integer greater than 1 has a unique prime factorization?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              {
                text: 'Fundamental Theorem of Arithmetic',
                isCorrect: true
              },
              {
                text: 'Pythagorean Theorem',
                isCorrect: false
              },
              {
                text: "Fermat's Last Theorem",
                isCorrect: false
              },
              {
                text: 'Binomial Theorem',
                isCorrect: false
              }
            ]
          },
          {
            statement:
              'Modular arithmetic deals with remainders after division.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement: 'What is 17 mod 5?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: '0', isCorrect: false },
              { text: '1', isCorrect: false },
              { text: '2', isCorrect: true },
              { text: '3', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 2
      // ===================================================
      {
        courseTitle: 'Linear Algebra',
        title: 'Quiz 2: Linear Algebra',
        description:
          'Test your knowledge of vectors, matrices and linear transformations.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What is the result of multiplying a matrix by the identity matrix?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              { text: 'The zero matrix', isCorrect: false },
              { text: 'The same matrix', isCorrect: true },
              { text: 'Its transpose', isCorrect: false },
              { text: 'Its inverse', isCorrect: false }
            ]
          },
          {
            statement:
              'A matrix is invertible only if its determinant is non-zero.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What do we call a set of vectors that spans a vector space and is linearly independent?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              { text: 'A basis', isCorrect: true },
              { text: 'A scalar', isCorrect: false },
              { text: 'A determinant', isCorrect: false },
              { text: 'A norm', isCorrect: false }
            ]
          },
          {
            statement:
              'Eigenvalues are only defined for square matrices.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What operation combines two matrices row-by-column to produce a new matrix?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: 'Matrix addition', isCorrect: false },
              { text: 'Matrix multiplication', isCorrect: true },
              { text: 'Scalar division', isCorrect: false },
              { text: 'Transposition', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 3
      // ===================================================
      {
        courseTitle: 'General Algebra',
        title: 'Quiz 3: General Algebra',
        description:
          'Test your knowledge of groups, rings and fields.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement: 'What is a group in abstract algebra?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              {
                text: 'A set with a single operation satisfying closure, associativity, identity and inverses',
                isCorrect: true
              },
              {
                text: 'Any collection of numbers',
                isCorrect: false
              },
              {
                text: 'A type of matrix',
                isCorrect: false
              },
              {
                text: 'A geometric shape',
                isCorrect: false
              }
            ]
          },
          {
            statement:
              'A ring requires two operations: addition and multiplication.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'Which structure guarantees that every non-zero element has a multiplicative inverse?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              { text: 'A field', isCorrect: true },
              { text: 'A semigroup', isCorrect: false },
              { text: 'A monoid', isCorrect: false },
              { text: 'A lattice', isCorrect: false }
            ]
          },
          {
            statement:
              'An operation is commutative if the order of operands does not affect the result.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is the identity element for addition in the real numbers?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: '1', isCorrect: false },
              { text: '0', isCorrect: true },
              { text: '-1', isCorrect: false },
              { text: 'Infinity', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 4
      // ===================================================
      {
        courseTitle: 'Mathematical Analysis',
        title: 'Quiz 4: Mathematical Analysis',
        description:
          'Test your knowledge of limits, continuity and sequences.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What does it mean for a sequence to converge?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              {
                text: 'It approaches a fixed limit as terms increase',
                isCorrect: true
              },
              {
                text: 'It grows without bound',
                isCorrect: false
              },
              {
                text: 'It oscillates forever',
                isCorrect: false
              },
              {
                text: 'It has no defined terms',
                isCorrect: false
              }
            ]
          },
          {
            statement:
              'A function is continuous at a point if its limit there equals its value there.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement: 'What is a Taylor series used for?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              {
                text: 'Approximating a function using an infinite sum of terms',
                isCorrect: true
              },
              { text: 'Sorting numbers', isCorrect: false },
              {
                text: 'Solving linear equations',
                isCorrect: false
              },
              { text: 'Storing data', isCorrect: false }
            ]
          },
          {
            statement:
              'Every convergent sequence is bounded.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is the term for the rate of change of a function at a point?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: 'The derivative', isCorrect: true },
              { text: 'The integral', isCorrect: false },
              { text: 'The determinant', isCorrect: false },
              { text: 'The residue', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 5
      // ===================================================
      {
        courseTitle: 'Differential and Integral Calculus',
        title: 'Quiz 5: Differential and Integral Calculus',
        description:
          'Test your knowledge of derivatives and integrals.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement: 'What is the derivative of x^2?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              { text: 'x', isCorrect: false },
              { text: '2x', isCorrect: true },
              { text: 'x^2', isCorrect: false },
              { text: '2', isCorrect: false }
            ]
          },
          {
            statement:
              'The Fundamental Theorem of Calculus links differentiation and integration.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What does a definite integral represent geometrically?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              { text: 'The area under a curve', isCorrect: true },
              { text: 'The slope of a curve', isCorrect: false },
              { text: 'The length of a line', isCorrect: false },
              { text: 'The volume of a cube', isCorrect: false }
            ]
          },
          {
            statement:
              'An antiderivative is also called an indefinite integral.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What rule is used to differentiate a product of two functions?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: 'The product rule', isCorrect: true },
              {
                text: 'The chain rule only',
                isCorrect: false
              },
              {
                text: 'The power rule only',
                isCorrect: false
              },
              {
                text: 'The sum rule only',
                isCorrect: false
              }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 6
      // ===================================================
      {
        courseTitle: 'Euclidean Geometry',
        title: 'Quiz 6: Euclidean Geometry',
        description:
          'Test your knowledge of shapes, angles and theorems.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What is the sum of interior angles in a triangle?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              { text: '90 degrees', isCorrect: false },
              { text: '180 degrees', isCorrect: true },
              { text: '270 degrees', isCorrect: false },
              { text: '360 degrees', isCorrect: false }
            ]
          },
          {
            statement:
              'The Pythagorean theorem applies to right triangles.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is the term for two lines that never intersect?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              { text: 'Parallel lines', isCorrect: true },
              { text: 'Perpendicular lines', isCorrect: false },
              { text: 'Intersecting lines', isCorrect: false },
              { text: 'Tangent lines', isCorrect: false }
            ]
          },
          {
            statement:
              'A regular polygon has all sides and angles equal.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is the formula for the circumference of a circle?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: 'πr^2', isCorrect: false },
              { text: '2πr', isCorrect: true },
              { text: 'πd^2', isCorrect: false },
              { text: 'r^2', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 7
      // ===================================================
      {
        courseTitle: 'Probability and Statistics',
        title: 'Quiz 7: Probability and Statistics',
        description:
          'Test your knowledge of probability distributions and statistical measures.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What is the probability of an impossible event?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              { text: '0', isCorrect: true },
              { text: '1', isCorrect: false },
              { text: '0.5', isCorrect: false },
              { text: 'Undefined', isCorrect: false }
            ]
          },
          {
            statement:
              'The mean and the median are always equal.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: false },
              { text: 'False', isCorrect: true }
            ]
          },
          {
            statement:
              'What does the normal distribution look like?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              {
                text: 'A symmetric bell-shaped curve',
                isCorrect: true
              },
              { text: 'A straight line', isCorrect: false },
              {
                text: 'A set of disconnected points',
                isCorrect: false
              },
              { text: 'A square wave', isCorrect: false }
            ]
          },
          {
            statement:
              'Two events are independent if the occurrence of one does not affect the other.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What measure describes how spread out data values are?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: 'Variance', isCorrect: true },
              { text: 'Mode', isCorrect: false },
              { text: 'Median', isCorrect: false },
              { text: 'Frequency', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 8
      // ===================================================
      {
        courseTitle: 'Numerical Analysis',
        title: 'Quiz 8: Numerical Analysis',
        description:
          'Test your knowledge of numerical methods and approximation.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What is the purpose of numerical analysis?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              {
                text: 'Approximating solutions to problems that lack exact analytical solutions',
                isCorrect: true
              },
              { text: 'Designing websites', isCorrect: false },
              { text: 'Storing large files', isCorrect: false },
              { text: 'Managing databases', isCorrect: false }
            ]
          },
          {
            statement:
              "Newton's method is used to find roots of equations.",
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement: 'What does interpolation do?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              {
                text: 'Estimates values between known data points',
                isCorrect: true
              },
              { text: 'Deletes data points', isCorrect: false },
              {
                text: 'Sorts data alphabetically',
                isCorrect: false
              },
              { text: 'Encrypts data', isCorrect: false }
            ]
          },
          {
            statement:
              'Numerical methods always give exact results.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: false },
              { text: 'False', isCorrect: true }
            ]
          },
          {
            statement:
              'Which method approximates the area under a curve using trapezoids?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              {
                text: 'The trapezoidal rule',
                isCorrect: true
              },
              {
                text: "Newton's method",
                isCorrect: false
              },
              {
                text: 'Gaussian elimination',
                isCorrect: false
              },
              {
                text: 'The bisection method only',
                isCorrect: false
              }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 9
      // ===================================================
      {
        courseTitle: 'Mathematical Logic',
        title: 'Quiz 9: Mathematical Logic',
        description:
          'Test your knowledge of propositions, proofs and logical operators.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What is a proposition in logic?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              {
                text: 'A statement that is either true or false',
                isCorrect: true
              },
              { text: 'A random number', isCorrect: false },
              { text: 'A geometric shape', isCorrect: false },
              { text: 'A variable name', isCorrect: false }
            ]
          },
          {
            statement:
              'The logical AND operator returns true only if both operands are true.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is a proof by contradiction?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              {
                text: 'Assuming the opposite of a statement and showing it leads to a contradiction',
                isCorrect: true
              },
              { text: 'Drawing a diagram', isCorrect: false },
              { text: 'Guessing the answer', isCorrect: false },
              {
                text: 'Testing one example only',
                isCorrect: false
              }
            ]
          },
          {
            statement:
              'Mathematical induction is used to prove statements for all natural numbers.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What does the symbol "∀" mean in logic?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              { text: 'For all', isCorrect: true },
              { text: 'There exists', isCorrect: false },
              { text: 'Not equal', isCorrect: false },
              { text: 'Implies', isCorrect: false }
            ]
          }
        ]
      },

      // ===================================================
      // QUIZ 10
      // ===================================================
      {
        courseTitle: 'Graph Theory',
        title: 'Quiz 10: Graph Theory',
        description:
          'Test your knowledge of graphs, nodes and paths.',
        duration: 15,
        passingScore: 50,
        isPublished: true,
        questions: [
          {
            statement:
              'What is a graph in graph theory?',
            type: 'MCQ',
            points: 20,
            order: 1,
            choices: [
              {
                text: 'A set of vertices connected by edges',
                isCorrect: true
              },
              { text: 'A chart of numbers only', isCorrect: false },
              { text: 'A type of matrix', isCorrect: false },
              { text: 'A sorting algorithm', isCorrect: false }
            ]
          },
          {
            statement:
              'A tree is a connected graph with no cycles.',
            type: 'TrueFalse',
            points: 20,
            order: 2,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'Which algorithm finds the shortest path in a weighted graph?',
            type: 'MCQ',
            points: 20,
            order: 3,
            choices: [
              {
                text: "Dijkstra's algorithm",
                isCorrect: true
              },
              { text: 'Bubble sort', isCorrect: false },
              { text: 'Binary search', isCorrect: false },
              { text: 'Quick sort', isCorrect: false }
            ]
          },
          {
            statement:
              'A graph is directed if its edges have a specific direction.',
            type: 'TrueFalse',
            points: 20,
            order: 4,
            choices: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ]
          },
          {
            statement:
              'What is the degree of a vertex?',
            type: 'MCQ',
            points: 20,
            order: 5,
            choices: [
              {
                text: 'The number of edges connected to it',
                isCorrect: true
              },
              {
                text: 'Its position in the graph',
                isCorrect: false
              },
              {
                text: 'Its weight value',
                isCorrect: false
              },
              {
                text: 'Its color',
                isCorrect: false
              }
            ]
          }
        ]
      }
    ];

    // =====================================================
    // 8. CREATE QUIZZES IF MISSING
    // =====================================================

    let newQuizzes = 0;
    let newQuestions = 0;
    let newChoices = 0;

    console.log('\nChecking quizzes...');

    for (const quizData of quizzesData) {
      const course = courses.find(
        c => c.title === quizData.courseTitle
      );

      if (!course) {
        console.log(
          `Course not found for quiz: ${quizData.title}`
        );
        continue;
      }

      const teacher = teachers.find(
        t =>
          t._id.toString() ===
          course.teacher.toString()
      );

      if (!teacher) {
        console.log(
          `Teacher not found for course: ${course.title}`
        );
        continue;
      }

      // Find existing quiz
      const existingQuiz = await Quiz.findOne({
        course: course._id
      });

      if (existingQuiz) {
        console.log(
          `Quiz already exists: ${existingQuiz.title}`
        );

        // Make sure correct teacher owns the quiz
        if (
          !existingQuiz.createdBy ||
          existingQuiz.createdBy.toString() !==
            teacher._id.toString()
        ) {
          existingQuiz.createdBy = teacher._id;
          await existingQuiz.save();

          console.log(
            `  Updated quiz creator -> ${teacher.firstName} ${teacher.lastName}`
          );
        }

        continue;
      }

      // ===================================================
      // CREATE QUIZ
      // ===================================================

      const quiz = await Quiz.create({
        course: course._id,
        title: quizData.title,
        description: quizData.description,
        duration: quizData.duration,
        passingScore: quizData.passingScore,
        isPublished: quizData.isPublished,
        createdBy: teacher._id
      });

      newQuizzes++;

      console.log('');
      console.log(`Quiz created: ${quiz.title}`);
      console.log(
        `Teacher: ${teacher.firstName} ${teacher.lastName}`
      );

      // ===================================================
      // CREATE QUESTIONS
      // ===================================================

      let totalPoints = 0;

      for (const questionData of quizData.questions) {
        const question = await Question.create({
          quiz: quiz._id,
          statement: questionData.statement,
          type: questionData.type,
          points: questionData.points,
          order: questionData.order
        });

        newQuestions++;
        totalPoints += questionData.points;

        // =================================================
        // CREATE CHOICES
        // =================================================

        for (
          let i = 0;
          i < questionData.choices.length;
          i++
        ) {
          const choiceData = questionData.choices[i];

          await Choice.create({
            question: question._id,
            text: choiceData.text,
            isCorrect: choiceData.isCorrect,
            order: i + 1
          });

          newChoices++;
        }
      }

      console.log(
        `  Questions: ${quizData.questions.length}`
      );
      console.log(`  Points: ${totalPoints}/100`);
    }

    // =====================================================
    // 9. FINAL RESULT
    // =====================================================

    console.log('');
    console.log('==============================================');
    console.log('          SEED COMPLETED');
    console.log('==============================================');

    for (const teacher of teachers) {
      const teacherCourses = await Course.find({
        teacher: teacher._id
      }).select('title');

      console.log('');
      console.log(
        `${teacher.firstName} ${teacher.lastName}`
      );

      teacherCourses.forEach(course => {
        console.log(`  - ${course.title}`);
      });
    }

    console.log('');
    console.log(`New quizzes:    ${newQuizzes}`);
    console.log(`New questions:  ${newQuestions}`);
    console.log(`New choices:    ${newChoices}`);

    console.log('');
    console.log('Each quiz:');
    console.log('  5 questions');
    console.log('  20 points/question');
    console.log('  100 points total');
    console.log('  Passing score: 50');

    console.log('');
    console.log('NO USERS DELETED');
    console.log('NO COURSES DELETED');
    console.log('NO MODULES DELETED');
    console.log('NO LESSONS DELETED');
    console.log('==============================================');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('SEED ERROR:', error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();

