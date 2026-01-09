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

// Simple 1-page overall progress PDF - compact 2-column layout to fit all 13 subjects
export async function generateOverallProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[]
): Promise<void> {
  const container = createContainer();
  
  // Split subjects into 2 columns for compact layout
  const midPoint = Math.ceil(subjectProgresses.length / 2);
  const leftSubjects = subjectProgresses.slice(0, midPoint);
  const rightSubjects = subjectProgresses.slice(midPoint);
  
  const renderSubjectItem = (s: SubjectProgress) => {
    const barColor = s.progress >= 75 ? COLORS.success : s.progress >= 50 ? COLORS.warning : COLORS.primaryLight;
    return `
      <div style="
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: ${COLORS.cardBg};
        border: 1px solid ${COLORS.border};
        border-radius: 6px;
        margin-bottom: 6px;
      ">
        <span style="${TYPOGRAPHY.small} color: ${COLORS.text}; font-weight: 500; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.fullName}</span>
        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
          ${renderProgressBar(s.progress, "60px", "6px")}
          <span style="${TYPOGRAPHY.small} font-weight: 600; color: ${barColor}; min-width: 32px; text-align: right;">${s.progress}%</span>
        </div>
      </div>
    `;
  };
  
  const leftColumnHTML = leftSubjects.map(renderSubjectItem).join("");
  const rightColumnHTML = rightSubjects.map(renderSubjectItem).join("");
  
  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      ${renderPageHeader("HSC Science — Overall Progress Report")}
      
      <div style="margin-bottom: 20px;">
        <p style="${TYPOGRAPHY.body} color: ${COLORS.textSecondary}; margin: 0;">
          <strong style="color: ${COLORS.text};">Student:</strong> ${email}
        </p>
      </div>
      
      <div style="
        background: ${COLORS.mutedBg};
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin-bottom: 24px;
      ">
        <p style="${TYPOGRAPHY.small} color: ${COLORS.muted}; margin: 0 0 6px 0;">Overall Completion</p>
        <p style="font-size: 44px; font-weight: 700; color: ${COLORS.primary}; margin: 0 0 12px 0;">${overallProgress}%</p>
        ${renderProgressBar(overallProgress, "280px", "12px")}
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 12px 0;">Subject-wise Progress (${subjectProgresses.length} Subjects)</h2>
        <div style="display: flex; gap: ${COLUMN_GAP}px;">
          <div style="flex: 1;">
            ${leftColumnHTML}
          </div>
          <div style="flex: 1;">
            ${rightColumnHTML}
          </div>
        </div>
      </div>
      
      ${renderPageFooter(1, 1)}
    </div>
  `;

  await saveSinglePagePDF(container, `hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

// Detailed multi-page progress PDF - Dynamic page flow to show ALL content
export async function generateDetailedProgressPDF(
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[],
  subjectDetails: SubjectDetail[],
  recordMap: Map<string, string>
): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  // Calculate available content height (A4 height minus margins and footer)
  const CONTENT_HEIGHT = A4_HEIGHT - PAGE_MARGIN - PAGE_MARGIN - 50; // 50px for footer
  const HEADER_HEIGHT = 80; // Subject header height
  const CARD_HEIGHT = 85; // Estimated card height
  const CARD_GAP = 10;
  
  // First, calculate total pages needed
  let estimatedPages = 1; // Summary page
  subjectDetails.forEach(subject => {
    const chaptersPerPage = Math.floor((CONTENT_HEIGHT - HEADER_HEIGHT) / (CARD_HEIGHT + CARD_GAP));
    const pagesForSubject = Math.ceil(subject.chapters.length / (chaptersPerPage * 2)); // 2 columns
    estimatedPages += Math.max(1, pagesForSubject);
  });
  
  let currentPage = 1;
  
  // Page 1: Overall Summary with 2-column subject list
  const summaryContainer = createContainer();
  
  const midPoint = Math.ceil(subjectProgresses.length / 2);
  const leftSubjects = subjectProgresses.slice(0, midPoint);
  const rightSubjects = subjectProgresses.slice(midPoint);
  
  const renderSubjectSummaryItem = (s: SubjectProgress) => {
    const barColor = s.progress >= 75 ? COLORS.success : s.progress >= 50 ? COLORS.warning : COLORS.primaryLight;
    return `
      <div style="
        display: flex;
        align-items: center;
        padding: 10px 14px;
        background: ${COLORS.cardBg};
        border: 1px solid ${COLORS.border};
        border-radius: 6px;
        margin-bottom: 6px;
      ">
        <span style="${TYPOGRAPHY.small} color: ${COLORS.text}; font-weight: 500; flex: 1; min-width: 0;">${s.fullName}</span>
        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          ${renderProgressBar(s.progress, "70px", "5px")}
          <span style="${TYPOGRAPHY.small} font-weight: 600; color: ${barColor}; min-width: 32px; text-align: right;">${s.progress}%</span>
        </div>
      </div>
    `;
  };
  
  summaryContainer.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      ${renderPageHeader("HSC Science — Detailed Progress Report")}
      
      <div style="display: flex; gap: 40px; margin-bottom: 24px;">
        <div>
          <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0 0 4px 0;">Student</p>
          <p style="${TYPOGRAPHY.body} color: ${COLORS.text}; font-weight: 500; margin: 0;">${email}</p>
        </div>
        <div>
          <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0 0 4px 0;">Overall Progress</p>
          <p style="font-size: 28px; color: ${COLORS.primary}; font-weight: 700; margin: 0;">${overallProgress}%</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 12px 0;">Subject-wise Summary (${subjectProgresses.length} Subjects)</h2>
        <div style="display: flex; gap: ${COLUMN_GAP}px;">
          <div style="flex: 1;">
            ${leftSubjects.map(renderSubjectSummaryItem).join("")}
          </div>
          <div style="flex: 1;">
            ${rightSubjects.map(renderSubjectSummaryItem).join("")}
          </div>
        </div>
      </div>
      
      ${renderPageFooter(1, estimatedPages)}
    </div>
  `;

  await capturePageToPDF(summaryContainer, pdf, true);
  document.body.removeChild(summaryContainer);
  currentPage++;

  // Subject pages - Dynamic flow with page breaks
  for (const subject of subjectDetails) {
    const subjectProgress = subjectProgresses.find(s => s.name === subject.displayName);
    const progressPercent = subjectProgress?.progress || 0;
    
    // Calculate how many chapters fit per page (in 2-column layout)
    const chaptersPerColumn = 5; // Conservative estimate for chapters per column
    const chaptersPerPage = chaptersPerColumn * 2;
    
    // Split chapters into pages
    const totalChapters = subject.chapters;
    const pageGroups: ChapterDetail[][] = [];
    
    for (let i = 0; i < totalChapters.length; i += chaptersPerPage) {
      pageGroups.push(totalChapters.slice(i, i + chaptersPerPage));
    }
    
    // Render each page for this subject
    for (let pageIdx = 0; pageIdx < pageGroups.length; pageIdx++) {
      const chaptersForPage = pageGroups[pageIdx];
      const isFirstPage = pageIdx === 0;
      const pageLabel = pageGroups.length > 1 ? ` (Page ${pageIdx + 1}/${pageGroups.length})` : '';
      
      const subjectContainer = createContainer();
      
      // Split this page's chapters into 2 columns
      const midPoint = Math.ceil(chaptersForPage.length / 2);
      const leftChapters = chaptersForPage.slice(0, midPoint);
      const rightChapters = chaptersForPage.slice(midPoint);
      
      const renderChapterCard = (chapter: ChapterDetail): string => {
        const activities = chapter.activities.filter(a => a.name !== "Total Lec");
        
        // Show ALL activities - no limit
        const activitiesHTML = activities.map(activity => {
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
            ">${styles.icon} ${activity.name}</span>
          `;
        }).join("");

        return `
          <div style="
            background: ${COLORS.cardBg};
            border: 1px solid ${COLORS.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 8px;
            box-sizing: border-box;
          ">
            <div style="
              ${TYPOGRAPHY.h3}
              color: ${COLORS.text};
              margin-bottom: 6px;
              padding-bottom: 5px;
              border-bottom: 1px solid ${COLORS.mutedBg};
            ">${chapter.name}</div>
            <div style="
              display: flex;
              flex-wrap: wrap;
              margin: -2px;
            ">
              ${activitiesHTML}
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
            padding-bottom: 12px;
            margin-bottom: 16px;
          ">
            <div style="flex: 1;">
              <h2 style="${TYPOGRAPHY.h2} color: ${COLORS.text}; margin: 0 0 4px 0;">${subject.name}${pageLabel}</h2>
              <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 0;">
                ${isFirstPage ? `${subject.chapters.length} chapters total` : `Chapters ${pageIdx * chaptersPerPage + 1}-${Math.min((pageIdx + 1) * chaptersPerPage, subject.chapters.length)}`}
              </p>
            </div>
            ${isFirstPage ? `
              <div style="text-align: right; min-width: 80px;">
                <p style="font-size: 24px; font-weight: 700; color: ${COLORS.primary}; margin: 0; line-height: 1;">${progressPercent}%</p>
                <p style="${TYPOGRAPHY.meta} color: ${COLORS.muted}; margin: 4px 0 0 0;">completed</p>
              </div>
            ` : ''}
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
          
          ${renderPageFooter(currentPage, estimatedPages)}
        </div>
      `;

      await capturePageToPDF(subjectContainer, pdf, false);
      document.body.removeChild(subjectContainer);
      currentPage++;
    }
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
