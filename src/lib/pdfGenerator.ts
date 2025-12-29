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

function createContainer(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = A4_WIDTH + "px";
  el.style.minHeight = "1123px";
  el.style.background = "white";
  el.style.color = "black";
  el.style.fontFamily = "'Noto Sans Bengali', 'Inter', sans-serif";
  el.style.padding = "40px";
  el.style.boxSizing = "border-box";
  document.body.appendChild(el);
  return el;
}

async function captureAndAddToPDF(
  container: HTMLDivElement,
  pdf: jsPDF,
  isFirstPage: boolean
): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  if (!isFirstPage) {
    pdf.addPage();
  }

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }
}

async function savePDF(container: HTMLDivElement, filename: string): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

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
    `<li style="font-size:14px;padding:6px 0;color:#000;border-bottom:1px solid #eee;">• ${s.fullName}: <strong>${s.progress}%</strong></li>`
  ).join("");
  
  container.innerHTML = `
    <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
      <h1 style="font-size:24px;font-weight:bold;margin-bottom:8px;color:#000;">HSC Science — Overall Progress Report</h1>
      <p style="font-size:12px;color:#666;margin-bottom:24px;">Generated: ${format(new Date(), "PPpp")}</p>
      <p style="font-size:14px;margin-bottom:20px;color:#000;"><strong>Student:</strong> ${email}</p>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:bold;margin-bottom:8px;color:#000;">Overall Completion</h2>
        <p style="font-size:24px;font-weight:bold;color:#000;">${overallProgress}%</p>
      </div>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:bold;margin-bottom:12px;color:#000;">Subject-wise Progress</h2>
        <ul style="list-style:none;padding:0;margin:0;">${subjectListHTML}</ul>
      </div>
      <div style="position:absolute;bottom:40px;left:40px;font-size:10px;color:#999;">HSC Science Study Tracker</div>
    </div>
  `;

  await savePDF(container, `hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Detailed multi-page progress PDF
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
    `<li style="font-size:14px;padding:6px 0;color:#000;border-bottom:1px solid #eee;">• ${s.fullName}: <strong>${s.progress}%</strong></li>`
  ).join("");
  
  summaryContainer.innerHTML = `
    <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
      <h1 style="font-size:24px;font-weight:bold;margin-bottom:8px;color:#000;">HSC Science — Detailed Progress Report</h1>
      <p style="font-size:12px;color:#666;margin-bottom:24px;">Generated: ${format(new Date(), "PPpp")}</p>
      <p style="font-size:14px;margin-bottom:20px;color:#000;"><strong>Student:</strong> ${email}</p>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:bold;margin-bottom:8px;color:#000;">Overall Completion</h2>
        <p style="font-size:24px;font-weight:bold;color:#000;">${overallProgress}%</p>
      </div>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:bold;margin-bottom:12px;color:#000;">Subject-wise Summary</h2>
        <ul style="list-style:none;padding:0;margin:0;">${subjectListHTML}</ul>
      </div>
      <div style="position:absolute;bottom:40px;left:40px;font-size:10px;color:#999;">HSC Science Study Tracker — Page 1</div>
    </div>
  `;

  await captureAndAddToPDF(summaryContainer, pdf, true);
  document.body.removeChild(summaryContainer);

  // Pages for each subject
  let pageNumber = 2;
  for (const subject of subjectDetails) {
    const subjectContainer = createContainer();
    
    const chaptersHTML = subject.chapters.map(chapter => {
      const activitiesHTML = chapter.activities
        .filter(a => a.name !== "Total Lec")
        .map(activity => {
          const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`) || "Not Started";
          let statusColor = "#888";
          let statusBg = "#f5f5f5";
          let statusText = "Not Started";
          
          if (status === "Done") {
            statusColor = "#16a34a";
            statusBg = "#dcfce7";
            statusText = "Done";
          } else if (status === "In Progress") {
            statusColor = "#ca8a04";
            statusBg = "#fef9c3";
            statusText = "In Progress";
          }
          
          return `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;background:${statusBg};color:${statusColor};font-size:10px;border-radius:4px;">${activity.name}: ${statusText}</span>`;
        }).join("");

      return `
        <div style="margin-bottom:16px;padding:12px;border:1px solid #e5e5e5;border-radius:8px;">
          <h4 style="font-size:13px;font-weight:600;margin-bottom:8px;color:#000;">${chapter.name}</h4>
          <div style="display:flex;flex-wrap:wrap;">${activitiesHTML}</div>
        </div>
      `;
    }).join("");

    subjectContainer.innerHTML = `
      <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
        <h2 style="font-size:20px;font-weight:bold;margin-bottom:16px;color:#000;border-bottom:2px solid #3b82f6;padding-bottom:8px;">${subject.name}</h2>
        <div>${chaptersHTML}</div>
        <div style="position:absolute;bottom:40px;left:40px;font-size:10px;color:#999;">HSC Science Study Tracker — Page ${pageNumber}</div>
      </div>
    `;

    await captureAndAddToPDF(subjectContainer, pdf, false);
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
