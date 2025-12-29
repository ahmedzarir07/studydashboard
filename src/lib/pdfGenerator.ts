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
        <p style="font-size:14px;color:#000;">${overallProgress}% complete</p>
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
