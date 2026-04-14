// ============================================================
// app.js — Button Handler & Download Orchestrator
// T-FLAWS Assessment Management Tool
// ============================================================

import { courseContent } from "./course-content.js";
import { referenceEntries, bibliographyOrder } from "./references.js";
import { generateDocument } from "./doc-generator.js";

// ============================================================
// DOM REFERENCES
// ============================================================

const downloadBtn = document.getElementById("download-btn");
const loadingMsg = document.getElementById("loading-msg");
const errorMsg = document.getElementById("error-msg");
const errorDetail = document.getElementById("error-detail");

// ============================================================
// DOWNLOAD HANDLER
// ============================================================

downloadBtn.addEventListener("click", handleDownload);

async function handleDownload() {
  // Reset UI
  hideError();
  showLoading();
  downloadBtn.disabled = true;

  try {
    const references = { referenceEntries, bibliographyOrder };
    const blob = await generateDocument(courseContent, references);
    triggerDownload(blob, "T-FLAWS_Assessment_Management_Tool.docx");
  } catch (err) {
    console.error("Document generation error:", err);
    showError(err.message || "An unexpected error occurred. Please check the browser console for details.");
  } finally {
    hideLoading();
    downloadBtn.disabled = false;
  }
}

// ============================================================
// DOWNLOAD TRIGGER
// ============================================================

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Release the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ============================================================
// UI STATE HELPERS
// ============================================================

function showLoading() {
  loadingMsg.classList.add("visible");
}

function hideLoading() {
  loadingMsg.classList.remove("visible");
}

function showError(message) {
  errorDetail.textContent = message;
  errorMsg.classList.add("visible");
}

function hideError() {
  errorMsg.classList.remove("visible");
  errorDetail.textContent = "";
}
