// //conditionals


// const generateExcelFile = async (req, res) => {
//   try {
//     const leave = await Leave.findById(req.params.id).populate("user");
//     if (!leave) {
//       return res.status(404).json({ message: "Leave request not found." });
//     }

//     // ✅ 1. Check if template exists (optional safeguard)
//     const templatePath = path.join(__dirname, "../templates/leave-form-template.xlsx");
//     const workbook = new ExcelJS.Workbook();

//     try {
//       await workbook.xlsx.readFile(templatePath);
//     } catch (err) {
//       return res.status(500).json({ message: "Template file not found or unreadable." });
//     }

//     const sheet = workbook.getWorksheet(1);
//     if (!sheet) {
//       return res.status(500).json({ message: "No worksheet found in template." });
//     }

//     // ✅ 2. Safely handle date and optional fields
//     const formatDate = (date) => {
//       if (!date) return "";
//       try {
//         return new Date(date).toLocaleDateString("en-PH", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         });
//       } catch {
//         return "";
//       }
//     };

//     // ✅ 3. Fill template cells
//     sheet.getCell("B2").value = `${leave.name.last}, ${leave.name.first} ${
//       leave.name.middle ? leave.name.middle[0] + "." : ""
//     }`;
//     sheet.getCell("B3").value = leave.officeDepartment || "";
//     sheet.getCell("B4").value = leave.leaveType || "";
//     sheet.getCell("B5").value = formatDate(leave.startDate);
//     sheet.getCell("B6").value = formatDate(leave.endDate);
//     sheet.getCell("B7").value = leave.status || "";
//     sheet.getCell("B8").value = leave.numberOfDays || "";
//     sheet.getCell("B9").value = leave.position || "";
//     sheet.getCell("B10").value = leave.salary || "";

//     if (leave.leaveType === "sick") {
//       sheet.getCell("B11").value = leave.sick?.type || "";
//       sheet.getCell("B12").value = leave.sick?.illness || "";
//     }

//     // ✅ 4. Optional: mark checkboxes or X-marks in template
//     // e.g., if your Excel has tick boxes for leaveType:
//     // if (leave.leaveType === "vacation") sheet.getCell("C4").value = "✔";

//     // ✅ 5. Write and send
//     const buffer = await workbook.xlsx.writeBuffer();

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=leave-${leave._id}.xlsx`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.send(buffer);
//   } catch (error) {
//     console.error("Excel generation failed:", error);
//     res.status(500).json({ message: "Error generating Excel file", error: error.message });
//   }
// };
