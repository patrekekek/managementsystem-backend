const Leave = require("../models/Leave.js");
const User = require("../models/User.js");

const ExcelJS = require("exceljs");
const path = require("path");


const applyLeave = async (req, res) => {
  const {
    officeDepartment,
    name,
    position,
    salary,
    leaveType,
    vacation,
    sick,
    study,
    others,
    numberOfDays,
    startDate,
    endDate
  } = req.body;


  if (
    !officeDepartment || 
    !name?.last || 
    !name?.first || 
    !position || 
    salary === undefined || 
    leaveType === undefined || 
    !startDate || 
    !endDate || 
    numberOfDays === undefined

  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const leaveData = {
      officeDepartment,
      name,
      position,
      salary,
      leaveType,
      vacation,
      sick,
      study,
      others,
      numberOfDays,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    const leave = await Leave.applyLeave(req.user._id, leaveData);
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const approveLeave = async (req, res) => {
  const { leaveId } = req.params;

  if (!leaveId) {
    return res.status(400).json({ error: "leaveId is required" });
  }

  try {
    const leave = await Leave.approveLeave(leaveId);
    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const rejectLeave = async (req, res) => {
  const { leaveId } = req.params;

  if (!leaveId) {
    return res.status(400).json({ error: "leaveId is required" });
  }

  try {
    const leave = await Leave.rejectLeave(leaveId);
    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const getLeaveBalance = async (req, res) => {
  try {
    const balance = await Leave.getLeaveBalance(req.user._id);
    res.status(200).json({ balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getRecentLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id})
      .sort({ createdAt: -1})
      .limit(3);

    res.status(200).json(leaves);

  } catch (error) {
    res.status(400).json({ error: error.message})
  }
}



const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("user", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getLeaveById = async (req,res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id).populate("user", "username email");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found"})
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave", error: error.message})
  }
}


const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("name email office_department position salary profilePicture, bio, role");
    
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTeacherDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id)
      .select("name email office_department position salary profilePicture bio role username");

    if (!teacher) {
      return res.status(404).json({ error: "No teacher found" })
    }

    const leaves = await Leave.find({ user: id }).sort({ createdAt: -1 })

    res.status(200).json({ teacher, leaves })
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ error: "Server error" });
  }
}

const generateExcelFile = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("user");
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    // ✅ 1. Check if template exists (optional safeguard)
    const templatePath = path.join(__dirname, "../templates/leave-form-template.xlsx");
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.readFile(templatePath);
    } catch (err) {
      return res.status(500).json({ message: "Template file not found or unreadable." });
    }

    const sheet = workbook.getWorksheet(1);
    if (!sheet) {
      return res.status(500).json({ message: "No worksheet found in template." });
    }

    // ✅ 2. Safely handle date and optional fields
    const formatDate = (date) => {
      if (!date) return "";
      try {
        return new Date(date).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return "";
      }
    };

    // ✅ 3. Fill template cells
    sheet.getCell("B2").value = `${leave.name.last}, ${leave.name.first} ${
      leave.name.middle ? leave.name.middle[0] + "." : ""
    }`;
    sheet.getCell("B3").value = leave.officeDepartment || "";
    sheet.getCell("B4").value = leave.leaveType || "";
    sheet.getCell("B5").value = formatDate(leave.startDate);
    sheet.getCell("B6").value = formatDate(leave.endDate);
    sheet.getCell("B7").value = leave.status || "";
    sheet.getCell("B8").value = leave.numberOfDays || "";
    sheet.getCell("B9").value = leave.position || "";
    sheet.getCell("B10").value = leave.salary || "";

    if (leave.leaveType === "sick") {
      sheet.getCell("B11").value = leave.sick?.type || "";
      sheet.getCell("B12").value = leave.sick?.illness || "";
    }

    // ✅ 4. Optional: mark checkboxes or X-marks in template
    // e.g., if your Excel has tick boxes for leaveType:
    // if (leave.leaveType === "vacation") sheet.getCell("C4").value = "✔";

    // ✅ 5. Write and send
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leave-${leave._id}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Excel generation failed:", error);
    res.status(500).json({ message: "Error generating Excel file", error: error.message });
  }
};



module.exports = {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  getUserLeaves,
  getRecentLeaves,
  getAllLeaves,
  getLeaveById,
  getAllTeachers,
  getTeacherDetails,
  generateExcelFile
};
