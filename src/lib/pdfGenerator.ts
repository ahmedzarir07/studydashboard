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

// A4 dimensions at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 48;
const CONTENT_WIDTH = A4_WIDTH - (PAGE_MARGIN * 2);
const COLUMN_GAP = 20;
const COLUMN_WIDTH = (CONTENT_WIDTH - COLUMN_GAP) / 2;

// Design tokens
const COLORS = {
  primary: "#1e40af",
  primaryLight: "#3b82f6",
  success: "#15803d",
  successBg: "#dcfce7",
  successBorder: "#bbf7d0",
  warning: "#a16207",
  warningBg: "#fef9c3",
  warningBorder: "#fef08a",
  muted: "#64748b",
  mutedBg: "#f1f5f9",
  mutedBorder: "#e2e8f0",
  text: "#1e293b",
  textSecondary: "#475569",
  border: "#e2e8f0",
  cardBg: "#ffffff",
  pageBg: "#ffffff",
};

const TYPOGRAPHY = {
  h1: "font-size: 28px; font-weight: 700; letter-spacing: -0.5px;",
  h2: "font-size: 20px; font-weight: 600;",
  h3: "font-size: 13px; font-weight: 600; line-height: 1.4;",
  body: "font-size: 13px; font-weight: 400;",
  small: "font-size: 11px; font-weight: 400;",
  tag: "font-size: 9px; font-weight: 500;",
  meta: "font-size: 10px; font-weight: 400;",
};

function createContainer(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${A4_WIDTH}px;
    height: ${A4_HEIGHT}px;
    background: ${COLORS.pageBg};
    color: ${COLORS.text};
    font-family: 'Noto Sans Bengali', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    padding: ${PAGE_MARGIN}px;
    box-sizing: border-box;
    overflow: hidden;
    line-height: 1.5;
  `;
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
    backgroundColor: COLORS.pageBg,
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
    backgroundColor: COLORS.pageBg,
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

// Shared components
function renderPageHeader(title: string, subtitle?: string): string {
  return `
    <div style="
      border-bottom: 3px solid ${COLORS.primary};
      padding-bottom: 16px;
      margin-bottom: 28px;
    ">
      <h1 style="${TYPOGRAPHY.h1} color: ${COLORS.text}; margin: 0 0 6px 0;">${title}</h1>
      <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0;">${subtitle || `Generated: ${format(new Date(), "PPpp")}`}</p>
    </div>
  `;
}

function renderPageFooter(pageNum: number, totalPages: number): string {
  return `
    <div style="
      position: absolute;
      bottom: ${PAGE_MARGIN}px;
      left: ${PAGE_MARGIN}px;
      right: ${PAGE_MARGIN}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: ${COLORS.muted};
      border-top: 1px solid ${COLORS.border};
      padding-top: 12px;
    ">
      <span>HSC Science Study Tracker</span>
      <span>Page ${pageNum} of ${totalPages}</span>
    </div>
  `;
}

function renderProgressBar(percent: number, width: string = "100%", height: string = "10px"): string {
  const barColor = percent >= 75 ? COLORS.success : percent >= 50 ? COLORS.warning : COLORS.primaryLight;
  return `
    <div style="
      width: ${width};
      height: ${height};
      background: ${COLORS.mutedBg};
      border-radius: 6px;
      overflow: hidden;
    ">
      <div style="
        width: ${percent}%;
        height: 100%;
        background: ${barColor};
        border-radius: 6px;
        transition: width 0.3s ease;
      "></div>
    </div>
  `;
}

function getStatusStyles(status: string): { color: string; bg: string; border: string; icon: string } {
  if (status === "Done") {
    return { color: COLORS.success, bg: COLORS.successBg, border: COLORS.successBorder, icon: "✓" };
  } else if (status === "In Progress") {
    return { color: COLORS.warning, bg: COLORS.warningBg, border: COLORS.warningBorder, icon: "◐" };
  }
  return { color: COLORS.muted, bg: COLORS.mutedBg, border: COLORS.mutedBorder, icon: "○" };
}

// Simple 1-page overall progress PDF
export async function generateOverallProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[]
): Promise<void> {
  const container = createContainer();
  
  const subjectListHTML = subjectProgresses.map(s => {
    const barColor = s.progress >= 75 ? COLORS.success : s.progress >= 50 ? COLORS.warning : COLORS.primaryLight;
    return `
      <div style="
        display: flex;
        align-items: center;
        padding: 14px 18px;
        background: ${COLORS.cardBg};
        border: 1px solid ${COLORS.border};
        border-radius: 8px;
        margin-bottom: 10px;
      ">
        <span style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 500; flex: 1; min-width: 0;">${s.fullName}</span>
        <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
          ${renderProgressBar(s.progress, "100px", "8px")}
          <span style="${TYPOGRAPHY.body} font-weight: 600; color: ${barColor}; min-width: 42px; text-align: right;">${s.progress}%</span>
        </div>
      </div>
    `;
  }).join("");
  
  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      ${renderPageHeader("HSC Science — Overall Progress Report")}
      
      <div style="margin-bottom: 28px;">
        <p style="${TYPOGRAPHY.body} color: ${COLORS.textSecondary}; margin: 0;">
          <strong style="color: ${COLORS.text};">Student:</strong> ${email}
        </p>
      </div>
      
      <div style="
        background: ${COLORS.mutedBg};
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-bottom: 32px;
      ">
        <p style="${TYPOGRAPHY.small} color: ${COLORS.muted}; margin: 0 0 8px 0;">Overall Completion</p>
        <p style="font-size: 52px; font-weight: 700; color: ${COLORS.primary}; margin: 0 0 16px 0;">${overallProgress}%</p>
        ${renderProgressBar(overallProgress, "320px", "14px")}
      </div>
      
      <div style="margin-bottom: 28px;">
        <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 16px 0;">Subject-wise Progress</h2>
        ${subjectListHTML}
      </div>
      
      ${renderPageFooter(1, 1)}
    </div>
  `;

  await saveSinglePagePDF(container, `hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Detailed multi-page progress PDF - Strict 2-column grid
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
  
  const subjectListHTML = subjectProgresses.map(s => {
    const barColor = s.progress >= 75 ? COLORS.success : s.progress >= 50 ? COLORS.warning : COLORS.primaryLight;
    return `
      <div style="
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: ${COLORS.cardBg};
        border: 1px solid ${COLORS.border};
        border-radius: 6px;
        margin-bottom: 8px;
      ">
        <span style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 500; flex: 1;">${s.fullName}</span>
        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
          ${renderProgressBar(s.progress, "80px", "6px")}
          <span style="${TYPOGRAPHY.small} font-weight: 600; color: ${barColor}; min-width: 36px; text-align: right;">${s.progress}%</span>
        </div>
      </div>
    `;
  }).join("");
  
  summaryContainer.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      ${renderPageHeader("HSC Science — Detailed Progress Report")}
      
      <div style="display: flex; gap: 40px; margin-bottom: 28px;">
        <div>
          <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0 0 4px 0;">Student</p>
          <p style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 500; margin: 0;">${email}</p>
        </div>
        <div>
          <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0 0 4px 0;">Overall Progress</p>
          <p style="font-size: 28px; color: ${COLORS.primary}; font-weight: 700; margin: 0;">${overallProgress}%</p>
        </div>
      </div>
      
      <div style="margin-bottom: 28px;">
        <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 14px 0;">Subject-wise Summary</h2>
        ${subjectListHTML}
      </div>
      
      ${renderPageFooter(1, totalPages)}
    </div>
  `;

  await capturePageToPDF(summaryContainer, pdf, true);
  document.body.removeChild(summaryContainer);

  // Subject pages - Strict 2-column grid
  let pageNumber = 2;
  for (const subject of subjectDetails) {
    const subjectContainer = createContainer();
    const subjectProgress = subjectProgresses.find(s => s.name === subject.id);
    const progressPercent = subjectProgress?.progress || 0;
    
    // Split chapters into 2 columns
    const chapters = subject.chapters;
    const midPoint = Math.ceil(chapters.length / 2);
    const leftChapters = chapters.slice(0, midPoint);
    const rightChapters = chapters.slice(midPoint);
    
    const renderChapterCard = (chapter: ChapterDetail): string => {
      const activities = chapter.activities.filter(a => a.name !== "Total Lec");
      
      // Limit to max 8 tags (roughly 2 rows)
      const displayActivities = activities.slice(0, 8);
      const hasMore = activities.length > 8;
      
      const activitiesHTML = displayActivities.map(activity => {
        const status = recordMap.get(`${subject.id}-${chapter.name}-${activity.name}`) || "Not Started";
        const styles = getStatusStyles(status);
        
        return `
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 2px;
            margin: 2px;
            padding: 3px 6px;
            background: ${styles.bg};
            border: 1px solid ${styles.border};
            color: ${styles.color};
            ${TYPOGRAPHY.tag}
            border-radius: 3px;
            white-space: nowrap;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${styles.icon} ${activity.name}</span>
        `;
      }).join("");

      return `
        <div style="
          background: ${COLORS.cardBg};
          border: 1px solid ${COLORS.border};
          border-radius: 6px;
          padding: 10px 12px;
          margin-bottom: 10px;
          min-height: 70px;
          box-sizing: border-box;
        ">
          <div style="
            ${TYPOGRAPHY.h3}
            color: ${COLORS.text};
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid ${COLORS.mutedBg};
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">${chapter.name}</div>
          <div style="
            display: flex;
            flex-wrap: wrap;
            margin: -2px;
            max-height: 52px;
            overflow: hidden;
          ">
            ${activitiesHTML}
            ${hasMore ? `<span style="${TYPOGRAPHY.tag} color: ${COLORS.muted}; padding: 3px 6px;">+${activities.length - 8} more</span>` : ''}
          </div>
        </div>
      `;
    };

    const leftColumnHTML = leftChapters.map(renderChapterCard).join("");
    const rightColumnHTML = rightChapters.map(renderChapterCard).join("");

    subjectContainer.innerHTML = `
      <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid ${COLORS.primary};
          padding-bottom: 14px;
          margin-bottom: 20px;
        ">
          <div style="flex: 1;">
            <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 4px 0;">${subject.name}</h2>
            <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0;">${subject.chapters.length} chapters</p>
          </div>
          <div style="text-align: right; min-width: 90px;">
            <p style="font-size: 28px; font-weight: 700; color: ${COLORS.primary}; margin: 0; line-height: 1;">${progressPercent}%</p>
            <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 4px 0 0 0;">completed</p>
          </div>
        </div>
        
        <div style="
          display: flex;
          gap: ${COLUMN_GAP}px;
        ">
          <div style="width: ${COLUMN_WIDTH}px; flex-shrink: 0;">
            ${leftColumnHTML}
          </div>
          <div style="width: ${COLUMN_WIDTH}px; flex-shrink: 0;">
            ${rightColumnHTML}
          </div>
        </div>
        
        ${renderPageFooter(pageNumber, totalPages)}
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
      padding: 14px 18px;
      background: ${COLORS.cardBg};
      border: 1px solid ${COLORS.border};
      border-radius: 8px;
      margin-bottom: 10px;
    ">
      <span style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 500;">${subject}</span>
      <span style="${TYPOGRAPHY.body} font-weight: 600; color: ${COLORS.primary};">${count} chapter${count > 1 ? "s" : ""}</span>
    </div>
  `).join("");

  const chaptersListHTML = sorted.slice(0, 12).map(c => {
    const dateStr = c.completed_at ? format(new Date(c.completed_at), "MMM d, h:mm a") : "";
    return `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 10px 0;
        border-bottom: 1px solid ${COLORS.mutedBg};
      ">
        <div style="flex: 1; min-width: 0;">
          <span style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 500;">${c.chapter}</span>
          <span style="${TYPOGRAPHY.small} color: ${COLORS.muted}; margin-left: 8px;">(${c.subject})</span>
        </div>
        <span style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; white-space: nowrap; margin-left: 12px; flex-shrink: 0;">${dateStr}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      ${renderPageHeader("HSC Science — Monthly Progress Report")}
      
      <div style="display: flex; gap: 40px; margin-bottom: 28px;">
        <div>
          <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0 0 4px 0;">Month</p>
          <p style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 600; font-size: 16px; margin: 0;">${monthYear}</p>
        </div>
        <div>
          <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0 0 4px 0;">Student</p>
          <p style="${TYPOGRAPHY.body} color: ${COLORS.text}; margin: 0;">${email}</p>
        </div>
      </div>
      
      <div style="
        background: ${COLORS.mutedBg};
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-bottom: 28px;
      ">
        <p style="${TYPOGRAPHY.small} color: ${COLORS.muted}; margin: 0 0 6px 0;">Total Chapters Completed</p>
        <p style="font-size: 48px; font-weight: 700; color: ${COLORS.success}; margin: 0;">${completions.length}</p>
      </div>
      
      ${Object.keys(bySubject).length > 0 ? `
        <div style="margin-bottom: 28px;">
          <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 14px 0;">Subject-wise Breakdown</h2>
          ${subjectBreakdownHTML}
        </div>
      ` : ""}
      
      ${sorted.length > 0 ? `
        <div style="margin-bottom: 28px;">
          <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 14px 0;">Completed Chapters ${sorted.length > 12 ? `(showing 12 of ${sorted.length})` : ''}</h2>
          <div style="background: ${COLORS.cardBg}; border: 1px solid ${COLORS.border}; border-radius: 8px; padding: 6px 16px;">
            ${chaptersListHTML}
          </div>
        </div>
      ` : ""}
      
      ${renderPageFooter(1, 1)}
    </div>
  `;

  await saveSinglePagePDF(container, `hsc-monthly-progress-${format(new Date(), "yyyy-MM")}.pdf`);
}
