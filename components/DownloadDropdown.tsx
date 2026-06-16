/**
 * DownloadDropdown Component
 *
 * This component provides a dropdown menu for downloading job application data
 * in two formats: CSV and Excel. It uses shadcn UI components for the dropdown
 * and handles file generation and download on the client side.
 *
 * Key Features:
 * - CSV export: Simple text-based format, easy to open in any spreadsheet app
 * - Excel export: Proper XLSX format with merged cells for headers
 * - Statistics summary: Shows total applied, declined, interview, and pending counts
 * - Monthly grouping: Adds visual gaps between different months
 * - Latest first: Sorts jobs by newest application date first
 */
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, ChevronDown } from "lucide-react";
import { getAllJobsForDownloadAction } from "@/utils/actions";
import { JobType } from "@/utils/types";
import dayjs from "dayjs";
import ExcelJS from "exceljs";

function DownloadDropdown() {
  /**
   * Handler for CSV download
   * Fetches all jobs from the server action and triggers CSV file generation
   * Uses async/await pattern for handling server actions
   */
  const handleDownloadCSV = async () => {
    try {
      const jobs = await getAllJobsForDownloadAction();
      downloadAsCSV(jobs);
    } catch {
      // Download failed — user can retry from the menu
    }
  };

  /**
   * Handler for Excel download
   * Fetches all jobs from the server action and triggers Excel file generation
   * Uses async/await pattern for handling server actions
   */
  const handleDownloadExcel = async () => {
    try {
      const jobs = await getAllJobsForDownloadAction();
      await downloadAsExcel(jobs);
    } catch {
      // Download failed — user can retry from the menu
    }
  };

  /**
   * Generates and downloads a CSV file with job application data
   *
   * CSV Format:
   * - First line: "Job Application History" (title)
   * - Second line: Statistics summary with report generation timestamp
   * - Blank line for separation
   * - Table header row
   * - Data rows with monthly gaps for visual separation
   *
   * @param jobs - Array of job application records from the database
   */
  const downloadAsCSV = (jobs: JobType[]) => {
    // Calculate statistics by filtering jobs by status
    // This gives us a summary of application statuses
    const totalApplied = jobs.length;
    const declined = jobs.filter((j) => j.status === "declined").length;
    const interview = jobs.filter((j) => j.status === "interview").length;
    const pending = jobs.filter((j) => j.status === "pending").length;

    // Format current date/time for report metadata
    // dayjs is a lightweight date library, similar to moment.js but smaller
    const generatedAt = dayjs().format("DD-MMM-YYYY HH:mm");
    const headingText = `Total Applied: ${totalApplied}, Declined: ${declined}, Interview: ${interview}, Pending: ${pending}      Report Generated: ${generatedAt}`;

    // Sort jobs by newest first (descending order)
    // Using spread operator [...jobs] to avoid mutating the original array
    // getTime() converts dates to numbers for comparison
    const sorted = [...jobs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Build CSV content as a string
    // CSV format: comma-separated values, with quotes around text that might contain commas
    let csvContent = `Job Application History\n"${headingText}"\n\n`;

    // Table header row - defines the columns for the data
    csvContent +=
      "No.,Applied Date,Job Title,Company Name,Job Location,Role,Status\n";

    // Track serial number for row numbering and last month for gap insertion
    let serial = 1;
    let lastMonthKey = "";

    // Iterate through sorted jobs and build CSV rows
    sorted.forEach((job) => {
      // Format date as DD-MMM-YYYY (e.g., "15-Oct-2025")
      const appliedDate = dayjs(job.createdAt).format("DD-MMM-YYYY");
      // Create a month key for detecting month changes (YYYY-MM format)
      const monthKey = dayjs(job.createdAt).format("YYYY-MM");

      // Wrap text fields in quotes to handle commas in job titles/company names
      const jobTitle = `"${job.position}"`;
      const company = `"${job.company}"`;
      const location = `"${job.location}"`;

      // Transform mode values to human-readable format
      const role =
        job.mode === "full-time"
          ? "Full Time"
          : job.mode === "part-time"
          ? "Part Time"
          : "Internship";

      // Capitalize first letter of status (e.g., "pending" -> "Pending")
      const status = job.status.charAt(0).toUpperCase() + job.status.slice(1);

      // Insert blank row when month changes for visual separation
      // This makes it easier to see monthly groupings in the spreadsheet
      if (lastMonthKey && monthKey !== lastMonthKey) {
        csvContent += "\n";
      }
      lastMonthKey = monthKey;

      // Append row with all job data
      csvContent += `${serial},${appliedDate},${jobTitle},${company},${location},${role},${status}\n`;
      serial += 1;
    });

    // Create and trigger file download
    // Blob API: Creates a file-like object in memory
    // MIME type "text/csv" tells the browser this is a CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a temporary anchor element for download
    const link = document.createElement("a");
    // Create a URL pointing to the blob in memory
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    // Set the filename with current month (e.g., "job-applications-2025-10.csv")
    link.setAttribute(
      "download",
      `job-applications-${dayjs().format("YYYY-MM")}.csv`
    );
    // Hide the link (we don't want to show it in the UI)
    link.style.visibility = "hidden";
    // Temporarily add to DOM, click it, then remove it
    // This triggers the browser's download dialog
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Note: URL.revokeObjectURL(url) would clean up memory, but we remove the link immediately
  };

  /**
   * Generates and downloads an Excel (XLSX) file with job application data
   *
   * Excel Format:
   * - Uses XLSX library to create a proper Excel workbook
   * - First row: "Job Application History" (merged across all columns)
   * - Second row: Statistics summary (merged across all columns)
   * - Blank row for separation
   * - Table header row
   * - Data rows with monthly gaps
   *
   * Key difference from CSV: Uses proper Excel format with merged cells
   * for better visual presentation in spreadsheet applications
   *
   * @param jobs - Array of job application records from the database
   */
  const downloadAsExcel = async (jobs: JobType[]) => {
    const totalApplied = jobs.length;
    const declined = jobs.filter((j) => j.status === "declined").length;
    const interview = jobs.filter((j) => j.status === "interview").length;
    const pending = jobs.filter((j) => j.status === "pending").length;

    const generatedAt = dayjs().format("DD-MMM-YYYY HH:mm");
    const headingText = `Total Applied: ${totalApplied}, Declined: ${declined}, Interview: ${interview}, Pending: ${pending}      Report Generated: ${generatedAt}`;

    const sorted = [...jobs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Job Applications");

    worksheet.addRow(["Job Application History"]);
    worksheet.addRow([headingText]);
    worksheet.addRow([]);
    worksheet.addRow([
      "No.",
      "Applied Date",
      "Job Title",
      "Company Name",
      "Job Location",
      "Role",
      "Status",
    ]);

    worksheet.mergeCells("A1:G1");
    worksheet.mergeCells("A2:G2");

    let serial = 1;
    let lastMonthKey = "";
    sorted.forEach((job) => {
      const appliedDate = dayjs(job.createdAt).format("DD-MMM-YYYY");
      const monthKey = dayjs(job.createdAt).format("YYYY-MM");
      const role =
        job.mode === "full-time"
          ? "Full Time"
          : job.mode === "part-time"
          ? "Part Time"
          : "Internship";
      const status = job.status.charAt(0).toUpperCase() + job.status.slice(1);

      if (lastMonthKey && monthKey !== lastMonthKey) {
        worksheet.addRow([]);
      }
      lastMonthKey = monthKey;

      worksheet.addRow([
        serial,
        appliedDate,
        job.position,
        job.company,
        job.location,
        role,
        status,
      ]);
      serial += 1;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-applications-${dayjs().format("YYYY-MM")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Render the dropdown menu component
   *
   * Uses shadcn UI components:
   * - DropdownMenu: Root component that manages open/close state
   * - DropdownMenuTrigger: The button that opens the menu (asChild prop makes it use Button component)
   * - DropdownMenuContent: The dropdown panel that appears
   * - DropdownMenuItem: Individual clickable items in the menu
   *
   * Lucide React icons are used for visual indicators
   */
  return (
    <DropdownMenu>
      {/* Trigger button - opens the dropdown when clicked */}
      <DropdownMenuTrigger asChild>
        {/* asChild prop: Instead of rendering a button, use the Button component as the trigger */}
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download
          <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown content - appears below/above the trigger */}
      <DropdownMenuContent align="end">
        {/* align="end" positions the menu to align with the right edge of trigger */}
        <DropdownMenuItem
          onClick={handleDownloadCSV}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownloadExcel}
          className="flex items-center gap-2"
        >
          <Table className="h-4 w-4" />
          Download as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DownloadDropdown;
