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

// A4 dimensions at 96 DPI - increased for better quality
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;
const CONTENT_WIDTH = A4_WIDTH - (PAGE_MARGIN * 2);

function createContainer(height?: number): HTMLDivElement {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = A4_WIDTH + "px";
  el.style.height = (height || A4_HEIGHT) + "px";
  el.style.background = "white";
  el.style.color = "black";
  el.style.fontFamily = "'Noto Sans Bengali', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  el.style.padding = PAGE_MARGIN + "px";
  el.style.boxSizing = "border-box";
  el.style.overflow = "hidden";
  el.style.lineHeight = "1.5";
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

// Styles for consistent design
const styles = {
  pageHeader: `
    border-bottom: 3px solid #1e40af;
    padding-bottom: 16px;
    margin-bottom: 28px;
  `,
  h1: `
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  `,
  h2: `
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 16px 0;
  `,
  h3: `
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin: 0 0 12px 0;
  `,
  meta: `
    font-size: 12px;
    color: #64748b;
    margin: 0;
  `,
  card: `
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  `,
  progressBar: `
    height: 12px;
    background: #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  `,
  footer: `
    position: absolute;
    bottom: ${PAGE_MARGIN}px;
    left: ${PAGE_MARGIN}px;
    right: ${PAGE_MARGIN}px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
  `,
};

// Simple 1-page overall progress PDF
export async function generateOverallProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[]
): Promise<void> {
  const container = createContainer();
  
  const subjectListHTML = subjectProgresses.map(s => `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: ${s.progress >= 75 ? '#f0fdf4' : s.progress >= 50 ? '#fefce8' : '#fff'};
      border: 1px solid ${s.progress >= 75 ? '#bbf7d0' : s.progress >= 50 ? '#fef08a' : '#e2e8f0'};
      border-radius: 8px;
      margin-bottom: 10px;
    ">
      <span style="font-size: 14px; color: #1e293b; font-weight: 500;">${s.fullName}</span>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 120px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
          <div style="width: ${s.progress}%; height: 100%; background: ${s.progress >= 75 ? '#22c55e' : s.progress >= 50 ? '#eab308' : '#3b82f6'}; border-radius: 4px;"></div>
        </div>
        <span style="font-size: 14px; font-weight: 600; color: ${s.progress >= 75 ? '#16a34a' : s.progress >= 50 ? '#ca8a04' : '#2563eb'}; min-width: 45px; text-align: right;">${s.progress}%</span>
      </div>
    </div>
  `).join("");
  
  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      <div style="${styles.pageHeader}">
        <h1 style="${styles.h1}">HSC Science — Overall Progress Report</h1>
        <p style="${styles.meta}">Generated: ${format(new Date(), "PPpp")}</p>
      </div>
      
      <div style="margin-bottom: 28px;">
        <p style="font-size: 14px; color: #475569; margin: 0;">
          <strong style="color: #1e293b;">Student:</strong> ${email}
        </p>
      </div>
      
      <div style="${styles.card}; text-align: center; margin-bottom: 32px;">
        <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0;">Overall Completion</p>
        <p style="font-size: 48px; font-weight: 700; color: #1e40af; margin: 0 0 12px 0;">${overallProgress}%</p>
        <div style="${styles.progressBar}; max-width: 400px; margin: 0 auto;">
          <div style="height: 100%; width: ${overallProgress}%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); border-radius: 6px;"></div>
        </div>
      </div>
      
      <div style="margin-bottom: 28px;">
        <h2 style="${styles.h2}">Subject-wise Progress</h2>
        ${subjectListHTML}
      </div>
      
      <div style="${styles.footer}">
        <span>HSC Science Study Tracker</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  `;

  await saveSinglePagePDF(container, `hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Detailed multi-page progress PDF - One subject per page, clean layout
export async function generateDetailedProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[],
  subjectDetails: SubjectDetail[],
  recordMap: Map<string, string>
): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const totalPages = subjectDetails.length + 1;
  
  // Page 1: Overall Summary
  const summaryContainer = createContainer();
  
  const subjectListHTML = subjectProgresses.map(s => `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 8px;
    ">
      <span style="font-size: 13px; color: #1e293b; font-weight: 500;">${s.fullName}</span>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 100px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
          <div style="width: ${s.progress}%; height: 100%; background: ${s.progress >= 75 ? '#22c55e' : s.progress >= 50 ? '#eab308' : '#3b82f6'}; border-radius: 3px;"></div>
        </div>
        <span style="font-size: 13px; font-weight: 600; color: #334155; min-width: 40px; text-align: right;">${s.progress}%</span>
      </div>
    </div>
  `).join("");
  
  summaryContainer.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      <div style="${styles.pageHeader}">
        <h1 style="${styles.h1}">HSC Science — Detailed Progress Report</h1>
        <p style="${styles.meta}">Generated: ${format(new Date(), "PPpp")}</p>
      </div>
      
      <div style="display: flex; gap: 32px; margin-bottom: 24px;">
        <div>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">Student</p>
          <p style="font-size: 14px; color: #1e293b; font-weight: 500; margin: 0;">${email}</p>
        </div>
        <div>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">Overall Progress</p>
          <p style="font-size: 24px; color: #1e40af; font-weight: 700; margin: 0;">${overallProgress}%</p>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h2 style="${styles.h2}">Subject-wise Summary</h2>
        ${subjectListHTML}
      </div>
      
      <div style="${styles.footer}">
        <span>HSC Science Study Tracker</span>
        <span>Page 1 of ${totalPages}</span>
      </div>
    </div>
  `;

  await capturePageToPDF(summaryContainer, pdf, true);
  document.body.removeChild(summaryContainer);

  // One page per subject - clean grid layout
  let pageNumber = 2;
  for (const subject of subjectDetails) {
    const subjectContainer = createContainer();
    const subjectProgress = subjectProgresses.find(s => s.name === subject.id);
    
    // Build clean chapter cards with proper grid
    const chaptersHTML = subject.chapters.map(chapter => {
      const activitiesHTML = chapter.activities
        .filter(a => a.name !== "Total Lec")
        .map(activity => {
          const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`) || "Not Started";
          let statusColor = "#64748b";
          let statusBg = "#f1f5f9";
          let statusBorder = "#e2e8f0";
          let statusIcon = "○";
          
          if (status === "Done") {
            statusColor = "#15803d";
            statusBg = "#dcfce7";
            statusBorder = "#bbf7d0";
            statusIcon = "✓";
          } else if (status === "In Progress") {
            statusColor = "#a16207";
            statusBg = "#fef9c3";
            statusBorder = "#fef08a";
            statusIcon = "◐";
          }
          
          return `
            <span style="
              display: inline-flex;
              align-items: center;
              gap: 3px;
              margin: 3px;
              padding: 4px 8px;
              background: ${statusBg};
              border: 1px solid ${statusBorder};
              color: ${statusColor};
              font-size: 9px;
              font-weight: 500;
              border-radius: 4px;
              white-space: nowrap;
            ">${statusIcon} ${activity.name}</span>
          `;
        }).join("");

      return `
        <div style="
          break-inside: avoid;
          margin-bottom: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
        ">
          <div style="
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1e293b;
            line-height: 1.4;
            padding-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
          ">${chapter.name}</div>
          <div style="display: flex; flex-wrap: wrap; margin: -3px;">${activitiesHTML}</div>
        </div>
      `;
    }).join("");

    subjectContainer.innerHTML = `
      <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 12px;
          margin-bottom: 20px;
        ">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${subject.name}</h2>
            <p style="font-size: 11px; color: #64748b; margin: 0;">${subject.chapters.length} chapters</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 24px; font-weight: 700; color: #1e40af; margin: 0;">${subjectProgress?.progress || 0}%</p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">completed</p>
          </div>
        </div>
        
        <div style="column-count: 2; column-gap: 20px;">
          ${chaptersHTML}
        </div>
        
        <div style="${styles.footer}">
          <span>HSC Science Study Tracker</span>
          <span>Page ${pageNumber} of ${totalPages}</span>
        </div>
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

  const subjectBreakdownHTML = Object.entries(bySubject).map(([subject, count]) => `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 8px;
    ">
      <span style="font-size: 14px; color: #1e293b; font-weight: 500;">${subject}</span>
      <span style="font-size: 14px; font-weight: 600; color: #1e40af;">${count} chapter${count > 1 ? "s" : ""}</span>
    </div>
  `).join("");

  const chaptersListHTML = sorted.slice(0, 15).map(c => {
    const dateStr = c.completed_at ? format(new Date(c.completed_at), "MMM d, h:mm a") : "";
    return `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 10px 0;
        border-bottom: 1px solid #f1f5f9;
      ">
        <div style="flex: 1;">
          <span style="font-size: 13px; color: #1e293b; font-weight: 500;">${c.chapter}</span>
          <span style="font-size: 12px; color: #64748b; margin-left: 8px;">(${c.subject})</span>
        </div>
        <span style="font-size: 11px; color: #94a3b8; white-space: nowrap; margin-left: 12px;">${dateStr}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      <div style="${styles.pageHeader}">
        <h1 style="${styles.h1}">HSC Science — Monthly Progress Report</h1>
        <p style="${styles.meta}">Generated: ${format(new Date(), "PPpp")}</p>
      </div>
      
      <div style="display: flex; gap: 32px; margin-bottom: 28px;">
        <div>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">Month</p>
          <p style="font-size: 16px; color: #1e293b; font-weight: 600; margin: 0;">${monthYear}</p>
        </div>
        <div>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">Student</p>
          <p style="font-size: 14px; color: #1e293b; margin: 0;">${email}</p>
        </div>
      </div>
      
      <div style="${styles.card}; text-align: center; margin-bottom: 28px;">
        <p style="font-size: 14px; color: #64748b; margin: 0 0 6px 0;">Total Chapters Completed</p>
        <p style="font-size: 42px; font-weight: 700; color: #16a34a; margin: 0;">${completions.length}</p>
      </div>
      
      ${Object.keys(bySubject).length > 0 ? `
        <div style="margin-bottom: 28px;">
          <h2 style="${styles.h2}">Subject-wise Breakdown</h2>
          ${subjectBreakdownHTML}
        </div>
      ` : ""}
      
      ${sorted.length > 0 ? `
        <div style="margin-bottom: 28px;">
          <h2 style="${styles.h2}">Completed Chapters ${sorted.length > 15 ? `(showing first 15)` : ''}</h2>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px;">
            ${chaptersListHTML}
          </div>
        </div>
      ` : ""}
      
      <div style="${styles.footer}">
        <span>HSC Science Study Tracker</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  `;

  await saveSinglePagePDF(container, `hsc-monthly-progress-${format(new Date(), "yyyy-MM")}.pdf`);
}
