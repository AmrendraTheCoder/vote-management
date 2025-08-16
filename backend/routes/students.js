import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

// GET /api/students - Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: 1 });

    const stats = {
      total: students.length,
      forChirag: students.filter((s) => s.vote === "Yes").length,
      againstChirag: students.filter((s) => s.vote === "No").length,
      undecided: students.filter((s) => s.vote === "Undecided").length,
      absent: students.filter((s) => s.vote === "Absent").length,
      notAsked: students.filter((s) => s.vote === "").length,
    };

    res.json({
      success: true,
      data: students,
      stats,
      count: students.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
});

// POST /api/students - Create a new student
router.post("/", async (req, res) => {
  try {
    const { name, roomNumber, hostel = "BH", vote = "" } = req.body;

    // Validation
    if (!name || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and room number are required",
      });
    }

    // Validate hostel type
    if (!["GH", "BH"].includes(hostel)) {
      return res.status(400).json({
        success: false,
        message: "Hostel must be either GH (Girls Hostel) or BH (Boys Hostel)",
      });
    }

    // Check for exact duplicate entry (same name + room + hostel)
    const existingStudent = await Student.findOne({
      name: name.trim(),
      roomNumber: roomNumber.trim(),
      hostel: hostel,
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `A student named "${name.trim()}" already exists in room ${roomNumber.trim()} at ${hostel}. Please check if this is a duplicate entry.`,
      });
    }

    // Note: Multiple students per room are allowed, but exact duplicates are prevented

    const student = new Student({
      name: name.trim(),
      roomNumber: roomNumber.trim(),
      hostel,
      vote,
    });

    const savedStudent = await student.save();

    res.status(201).json({
      success: true,
      data: savedStudent,
      message: "Student created successfully",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      success: false,
      message: "Error creating student",
      error: error.message,
    });
  }
});

// PUT /api/students/:id - Update a student
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roomNumber, hostel, vote } = req.body;

    // Validation
    if (!name || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and room number are required",
      });
    }

    // Validate hostel type if provided
    if (hostel && !["GH", "BH"].includes(hostel)) {
      return res.status(400).json({
        success: false,
        message: "Hostel must be either GH (Girls Hostel) or BH (Boys Hostel)",
      });
    }

    // Check if student exists
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check for exact duplicate entry (same name + room + hostel), excluding current student
    const duplicateStudent = await Student.findOne({
      name: name.trim(),
      roomNumber: roomNumber.trim(),
      hostel: hostel || existingStudent.hostel,
      _id: { $ne: id },
    });

    if (duplicateStudent) {
      return res.status(400).json({
        success: false,
        message: `A student named "${name.trim()}" already exists in room ${roomNumber.trim()} at ${
          hostel || existingStudent.hostel
        }. Please check if this is a duplicate entry.`,
      });
    }

    // Note: Multiple students per room are allowed, but exact duplicates are prevented

    const updateData = {
      name: name.trim(),
      roomNumber: roomNumber.trim(),
      vote,
      updatedAt: new Date(),
    };

    // Only update hostel if provided (for backward compatibility)
    if (hostel) {
      updateData.hostel = hostel;
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: updatedStudent,
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student",
      error: error.message,
    });
  }
});

// DELETE /api/students/:id - Delete a student
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: deletedStudent,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
});

// POST /api/students/bulk - Create multiple students
router.post("/bulk", async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students array is required and must not be empty",
      });
    }

    // Validate and prepare students
    const validStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (!student.name || !student.roomNumber) {
        errors.push(`Student ${i + 1}: Name and room number are required`);
        continue;
      }

      // Check for duplicates within the array
      const duplicateInArray = validStudents.find(
        (s) => s.roomNumber === student.roomNumber.trim()
      );
      if (duplicateInArray) {
        errors.push(
          `Student ${i + 1}: Duplicate room number ${
            student.roomNumber
          } in request`
        );
        continue;
      }

      // Check for existing in database
      const existingStudent = await Student.findOne({
        roomNumber: student.roomNumber.trim(),
      });
      if (existingStudent) {
        errors.push(
          `Student ${i + 1}: Room number ${student.roomNumber} already exists`
        );
        continue;
      }

      validStudents.push({
        name: student.name.trim(),
        roomNumber: student.roomNumber.trim(),
        vote: student.vote || "",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors occurred",
        errors,
      });
    }

    const createdStudents = await Student.insertMany(validStudents);

    res.status(201).json({
      success: true,
      data: createdStudents,
      message: `${createdStudents.length} students created successfully`,
    });
  } catch (error) {
    console.error("Error creating bulk students:", error);
    res.status(500).json({
      success: false,
      message: "Error creating students",
      error: error.message,
    });
  }
});

// GET /api/students/stats - Get voting statistics
router.get("/stats", async (req, res) => {
  try {
    const total = await Student.countDocuments();
    const forChirag = await Student.countDocuments({ vote: "Yes" });
    const againstChirag = await Student.countDocuments({ vote: "No" });
    const undecided = await Student.countDocuments({ vote: "Undecided" });
    const absent = await Student.countDocuments({ vote: "Absent" });
    const notAsked = await Student.countDocuments({ vote: "" });

    const stats = {
      total,
      forChirag,
      againstChirag,
      undecided,
      absent,
      notAsked,
      percentages: {
        forChirag: total > 0 ? Math.round((forChirag / total) * 100) : 0,
        againstChirag:
          total > 0 ? Math.round((againstChirag / total) * 100) : 0,
        undecided: total > 0 ? Math.round((undecided / total) * 100) : 0,
        absent: total > 0 ? Math.round((absent / total) * 100) : 0,
        notAsked: total > 0 ? Math.round((notAsked / total) * 100) : 0,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
});

export default router;
