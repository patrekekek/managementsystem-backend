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
    specialWomen,
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
      specialWomen,
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


const getLeaveById = async (req, res) => {
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
      .select("name email office_department position salary profilePicture bio role username");
    
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
    console.log("yow", leave)
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    const templatePath = path.join(__dirname, "../templates/leave-form-template2.xlsx");
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

    //optional fields
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

    // template cells
    sheet.getCell("F5").value = leave.name.last;
    sheet.getCell("J5").value = leave.name.first;
    sheet.getCell("M5").value = leave.name.middle || "";

    //function of check fonts and unchecked the same
    function setCheckbox(cell, checked = false) {
      cell.value = checked ? "☑" : "□";
      cell.font = { name: "Segoe UI Symbol", size: 12 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    }

    //checkbox cells
    const leaveTypeCells = {
      vacation: "B11",
      "mandatory-forced": "B13",
      sick: "B15",
      maternity: "B17",
      paternity: "B19",
      "special-privilege": "B21",
      "solo-parent": "B23",
      study: "B25",
      vawc: "B27",
      rehabilitation: "B29",
      "special-women": "B31",
      emergency: "B33",
      adoption: "B35",
      others: "",
    };

    //checkbox reset
    for (const cell of Object.values(leaveTypeCells)) {
      if (cell) setCheckbox(sheet.getCell(cell), false)
    }

    //check leave type
    if (leave.leaveType && leaveTypeCells[leave.leaveType]) {
      setCheckbox(sheet.getCell(leaveTypeCells[leave.leaveType]), true)
    }

    //if vacation leave-details
    if (leave.leaveType === "vacation") {
      
      setCheckbox(sheet.getCell("H13"), !!leave.vacation?.withinPhilippines?.trim());
      setCheckbox(sheet.getCell("H15"), !!leave.vacation?.abroad?.trim());

      sheet.getCell("L13").value = leave.vacation?.withinPhilippines || "";
      sheet.getCell("L15").value = leave.vacation?.abroad || "";
    }

    //if sick laeave
    if (leave.leaveType === "sick") {

      if (leave.sick?.type === "out-patient") {
        setCheckbox(sheet.getCell("H19"), true);
        sheet.getCell("L19").value = leave.sick?.illness?.trim() || "";
      } else if (leave.sick?.type === "in-hospital") {
        setCheckbox(sheet.getCell("H21"), true);
        sheet.getCell("L21").value = leave.sick?.illness?.trim() || "";
      }
    }

    //if special women

    if (leave.leaveType === "special-women") {
      sheet.getCell("K27").value = leave.specialWomen?.illness?.trim() || "";
    }


    //if study leeave
    if (leave.leaveType === "study") {
      if (!leave.study?.mastersDegree) {
        setCheckbox(sheet.getCell("H33"), true)
      } else if (!leave.study?.boardExamReview) {
        setCheckbox(sheet.getCell("H35"), true)
      }
    }

    //if other purpose
  






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
    return res.send(buffer);
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
