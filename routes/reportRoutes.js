const express = require("express");
const ExcelJS = require("exceljs");
const path = require("path");
const { Leave } = require("../models/Leave");


const router = express.Router();

router.post('/:id/excel', async(req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate("user");
        if (!leave) return res.status(404).json({ message: "Leave request not found."})

        //load excel templave from uploaded file
            //need to make changes esp. for tick boxes
        const templatePath = path.join(__dirname, "../templates/leave-form-template.xlsx");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);

        const sheet = workbook.getWorksheet(1);

        //sample
        sheet.getCell("B2").value = `${leave.name.last}, ${leave.name.first} ${leave.name.middle ? leave.name.middle[0] + "." : ""}`;
        sheet.getCell("B3").value = leave.officeDepartment;
        sheet.getCell("B4").value = leave.leaveType;
        sheet.getCell("B5").value = leave.startDate.toLocaleDateString();
        sheet.getCell("B6").value = leave.endDate.toLocaleDateString();
        sheet.getCell("B7").value = leave.status;
        sheet.getCell("B8").value = leave.numberOfDays;
        sheet.getCell("B9").value = leave.position;
        sheet.getCell("B10").value = leave.salary;

        if (leave.leaveType === "sick") {
            sheet.getCell("B11").value = leave.sick?.type || "";
            sheet.getCell("B12").value = leave.sick?.illness || "";
        }

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
        console.error("Excel generation failed", error);
        res.status(500).json({message: "Error generating excel file" })
    }
    
})

module.exports = router;