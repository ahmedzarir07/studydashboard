import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";

interface SubjectProgress {
  name: string;
  fullName: string;
  progress: number;
}

interface ChapterCompletion {
  subject: string;
  chapter: string;
  completed_at: string | null;
}

interface ActivityStatus {
  name: string;
  status: string;
}

interface ChapterDetail {
  name: string;
  activities: ActivityStatus[];
}

interface SubjectDetail {
  id: string;
  name: string;
  displayName: string;
  chapters: ChapterDetail[];
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

function createContainer(height?: number): HTMLDivElement {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = A4_WIDTH + "px";
  el.style.height = (height || A4_HEIGHT) + "px";
  el.style.background = "white";
  el.style.color = "black";
  el.style.fontFamily = "'Noto Sans Bengali', 'Inter', sans-serif";
  el.style.padding = "24px";
  el.style.boxSizing = "border-box";
  el.style.overflow = "hidden";
  document.body.appendChild(el);
  return el;
}

async function capturePageToPDF(
  container: HTMLDivElement,
  pdf: jsPDF,
  isFirstPage: boolean
): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    height: A4_HEIGHT,
    windowHeight: A4_HEIGHT,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  if (!isFirstPage) {
    pdf.addPage();
  }

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
}

async function saveSinglePagePDF(container: HTMLDivElement, filename: string): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    height: A4_HEIGHT,
    windowHeight: A4_HEIGHT,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);

  pdf.save(filename);
  document.body.removeChild(container);
}

// Simple 1-page overall progress PDF
export async function generateOverallProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[]
): Promise<void> {
  const container = createContainer();
  
  const subjectListHTML = subjectProgresses.map(s => 
    `<li style="font-size:13px;padding:4px 0;color:#000;border-bottom:1px solid #eee;">• ${s.fullName}: <strong>${s.progress}%</strong></li>`
  ).join("");
  
  container.innerHTML = `
    <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
      <h1 style="font-size:22px;font-weight:bold;margin-bottom:6px;color:#000;">HSC Science — Overall Progress Report</h1>
      <p style="font-size:11px;color:#666;margin-bottom:20px;">Generated: ${format(new Date(), "PPpp")}</p>
      <p style="font-size:13px;margin-bottom:16px;color:#000;"><strong>Student:</strong> ${email}</p>
      <div style="margin-bottom:20px;">
        <h2 style="font-size:15px;font-weight:bold;margin-bottom:6px;color:#000;">Overall Completion</h2>
        <p style="font-size:22px;font-weight:bold;color:#000;">${overallProgress}%</p>
      </div>
      <div style="margin-bottom:20px;">
        <h2 style="font-size:15px;font-weight:bold;margin-bottom:10px;color:#000;">Subject-wise Progress</h2>
        <ul style="list-style:none;padding:0;margin:0;">${subjectListHTML}</ul>
      </div>
      <div style="position:absolute;bottom:24px;left:24px;font-size:9px;color:#999;">HSC Science Study Tracker</div>
    </div>
  `;

  await saveSinglePagePDF(container, `hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Detailed multi-page progress PDF - One subject per page, compact layout
export async function generateDetailedProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[],
  subjectDetails: SubjectDetail[],
  recordMap: Map<string, string>
): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  // Page 1: Overall Summary
  const summaryContainer = createContainer();
  const subjectListHTML = subjectProgresses.map(s => 
    `<li style="font-size:12px;padding:3px 0;color:#000;border-bottom:1px solid #eee;">• ${s.fullName}: <strong>${s.progress}%</strong></li>`
  ).join("");
  
  summaryContainer.innerHTML = `
    <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
      <h1 style="font-size:20px;font-weight:bold;margin-bottom:6px;color:#000;">HSC Science — Detailed Progress Report</h1>
      <p style="font-size:10px;color:#666;margin-bottom:16px;">Generated: ${format(new Date(), "PPpp")}</p>
      <p style="font-size:12px;margin-bottom:14px;color:#000;"><strong>Student:</strong> ${email}</p>
      <div style="margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:bold;margin-bottom:4px;color:#000;">Overall Completion</h2>
        <p style="font-size:20px;font-weight:bold;color:#000;">${overallProgress}%</p>
      </div>
      <div style="margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:bold;margin-bottom:8px;color:#000;">Subject-wise Summary</h2>
        <ul style="list-style:none;padding:0;margin:0;">${subjectListHTML}</ul>
      </div>
      <div style="position:absolute;bottom:24px;left:24px;font-size:9px;color:#999;">HSC Science Study Tracker — Page 1</div>
    </div>
  `;

  await capturePageToPDF(summaryContainer, pdf, true);
  document.body.removeChild(summaryContainer);

  // One page per subject - compact 2-column layout
  let pageNumber = 2;
  for (const subject of subjectDetails) {
    const subjectContainer = createContainer();
    
    // Build compact chapter cards
    const chaptersHTML = subject.chapters.map(chapter => {
      const activitiesHTML = chapter.activities
        .filter(a => a.name !== "Total Lec")
        .map(activity => {
          const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`) || "Not Started";
          let statusColor = "#666";
          let statusBg = "#f0f0f0";
          let statusIcon = "○";
          
          if (status === "Done") {
            statusColor = "#16a34a";
            statusBg = "#dcfce7";
            statusIcon = "✓";
          } else if (status === "In Progress") {
            statusColor = "#ca8a04";
            statusBg = "#fef9c3";
            statusIcon = "◐";
          }
          
          return `<span style="display:inline-block;margin:1px 2px;padding:1px 4px;background:${statusBg};color:${statusColor};font-size:8px;border-radius:2px;white-space:nowrap;">${statusIcon} ${activity.name}</span>`;
        }).join("");

      return `
        <div style="break-inside:avoid;margin-bottom:6px;padding:6px;border:1px solid #ddd;border-radius:4px;background:#fafafa;">
          <div style="font-size:9px;font-weight:600;margin-bottom:3px;color:#000;line-height:1.2;">${chapter.name}</div>
          <div style="display:flex;flex-wrap:wrap;gap:1px;">${activitiesHTML}</div>
        </div>
      `;
    }).join("");

    subjectContainer.innerHTML = `
      <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;height:100%;position:relative;">
        <div style="border-bottom:2px solid #3b82f6;padding-bottom:6px;margin-bottom:10px;">
          <h2 style="font-size:14px;font-weight:bold;color:#000;margin:0;">${subject.name}</h2>
          <p style="font-size:9px;color:#666;margin:2px 0 0 0;">Page ${pageNumber} of ${subjectDetails.length + 1}</p>
        </div>
        <div style="column-count:2;column-gap:12px;column-fill:balance;">
          ${chaptersHTML}
        </div>
        <div style="position:absolute;bottom:0;left:0;font-size:8px;color:#999;">HSC Science Study Tracker</div>
      </div>
    `;

    await capturePageToPDF(subjectContainer, pdf, false);
    document.body.removeChild(subjectContainer);
    pageNumber++;
  }

  pdf.save(`hsc-detailed-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Monthly progress PDF
export async function generateMonthlyProgressPDF(
  email: string,
  monthYear: string,
  completions: ChapterCompletion[]
): Promise<void> {
  const container = createContainer();
  
  const bySubject: Record<string, number> = {};
  completions.forEach(c => {
    bySubject[c.subject] = (bySubject[c.subject] || 0) + 1;
  });

  const sorted = [...completions].sort((a, b) => {
    if (!a.completed_at || !b.completed_at) return 0;
    return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
  });

  const subjectBreakdownHTML = Object.entries(bySubject).map(([subject, count]) =>
    `<li style="font-size:14px;padding:4px 0;color:#000;">• ${subject}: <strong>${count}</strong> chapter${count > 1 ? "s" : ""}</li>`
  ).join("");

  const chaptersListHTML = sorted.map(c => {
    const dateStr = c.completed_at ? format(new Date(c.completed_at), "MMM d, h:mm a") : "";
    return `<li style="font-size:13px;padding:6px 0;color:#000;border-bottom:1px solid #eee;">• ${c.chapter} <span style="color:#666;">(${c.subject})</span> <span style="color:#888;font-size:11px;"> — ${dateStr}</span></li>`;
  }).join("");

  container.innerHTML = `
    <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
      <h1 style="font-size:24px;font-weight:bold;margin-bottom:8px;color:#000;">HSC Science — Monthly Progress Report</h1>
      <p style="font-size:12px;color:#666;margin-bottom:24px;">Generated: ${format(new Date(), "PPpp")}</p>
      <p style="font-size:14px;margin-bottom:6px;color:#000;"><strong>Month:</strong> ${monthYear}</p>
      <p style="font-size:14px;margin-bottom:20px;color:#000;"><strong>Student:</strong> ${email}</p>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:bold;margin-bottom:8px;color:#000;">Summary</h2>
        <p style="font-size:14px;color:#000;">Total Chapters Completed: <strong>${completions.length}</strong></p>
      </div>
      ${Object.keys(bySubject).length > 0 ? `
        <div style="margin-bottom:24px;">
          <h2 style="font-size:16px;font-weight:bold;margin-bottom:12px;color:#000;">Subject-wise Breakdown</h2>
          <ul style="list-style:none;padding:0;margin:0;">${subjectBreakdownHTML}</ul>
        </div>
      ` : ""}
      ${sorted.length > 0 ? `
        <div style="margin-bottom:24px;">
          <h2 style="font-size:16px;font-weight:bold;margin-bottom:12px;color:#000;">Completed Chapters</h2>
          <ul style="list-style:none;padding:0;margin:0;">${chaptersListHTML}</ul>
        </div>
      ` : ""}
      <div style="position:absolute;bottom:40px;left:40px;font-size:10px;color:#999;">HSC Science Study Tracker</div>
    </div>
  `;

  await savePDF(container, `hsc-monthly-progress-${format(new Date(), "yyyy-MM")}.pdf`);
}
