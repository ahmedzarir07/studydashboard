import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { MonthlyPlan } from "@/hooks/useMonthlyPlans";

// A4 dimensions at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 40;

function createContainer(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = A4_WIDTH + "px";
  el.style.height = A4_HEIGHT + "px";
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

interface SubjectInfo {
  data: { id: string; name: string };
  label: string;
}

// Styles for consistent design
const styles = {
  pageHeader: `
    border-bottom: 3px solid #1e40af;
    padding-bottom: 16px;
    margin-bottom: 24px;
  `,
  h1: `
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  `,
  h2: `
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 14px 0;
  `,
  meta: `
    font-size: 11px;
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

export async function generateMonthlyPlanPDF(
  email: string,
  monthYear: string,
  plans: MonthlyPlan[],
  completedActivitiesMap: Map<string, string[]>,
  subjects: SubjectInfo[]
): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Calculate stats
  let totalPlanned = 0;
  let totalCompleted = 0;
  const subjectStats: Record<string, { planned: number; completed: number; chapters: number }> = {};

  plans.forEach((plan) => {
    const completedActivities =
      completedActivitiesMap.get(`${plan.subject}-${plan.chapter}`) || [];
    const planned = plan.planned_activities.length;
    const completed = plan.planned_activities.filter((a) =>
      completedActivities.includes(a)
    ).length;

    totalPlanned += planned;
    totalCompleted += completed;

    if (!subjectStats[plan.subject]) {
      subjectStats[plan.subject] = { planned: 0, completed: 0, chapters: 0 };
    }
    subjectStats[plan.subject].planned += planned;
    subjectStats[plan.subject].completed += completed;
    subjectStats[plan.subject].chapters += 1;
  });

  const progressPercent =
    totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  // Count subjects with plans for total pages
  const subjectsWithPlans = subjects.filter(s => 
    plans.some(p => p.subject === s.data.id)
  );
  const totalPages = subjectsWithPlans.length + 1;

  // Page 1: Summary
  const summaryContainer = createContainer();

  const subjectBreakdownHTML = Object.entries(subjectStats)
    .map(([subjectId, stats]) => {
      const subject = subjects.find((s) => s.data.id === subjectId);
      const percent =
        stats.planned > 0
          ? Math.round((stats.completed / stats.planned) * 100)
          : 0;
      
      const barColor = percent >= 75 ? '#22c55e' : percent >= 50 ? '#eab308' : '#3b82f6';
      
      return `
        <div style="
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 10px;
        ">
          <div style="flex: 1;">
            <div style="font-size: 14px; color: #1e293b; font-weight: 500; margin-bottom: 6px;">${subject?.data.name || subjectId}</div>
            <div style="font-size: 11px; color: #64748b;">${stats.chapters} chapter${stats.chapters > 1 ? 's' : ''} • ${stats.completed}/${stats.planned} activities</div>
          </div>
          <div style="text-align: right; min-width: 80px;">
            <div style="font-size: 18px; font-weight: 600; color: ${barColor};">${percent}%</div>
          </div>
        </div>
      `;
    })
    .join("");

  summaryContainer.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
      <div style="${styles.pageHeader}">
        <h1 style="${styles.h1}">HSC Science — Monthly Study Plan</h1>
        <p style="${styles.meta}">Generated: ${format(new Date(), "PPpp")}</p>
      </div>
      
      <div style="display: flex; gap: 32px; margin-bottom: 24px;">
        <div>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">Month</p>
          <p style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">${monthYear}</p>
        </div>
        <div>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">Student</p>
          <p style="font-size: 14px; color: #1e293b; margin: 0;">${email}</p>
        </div>
      </div>

      <div style="${styles.card}; margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <span style="font-size: 15px; font-weight: 600; color: #1e293b;">Overall Progress</span>
          <span style="font-size: 28px; font-weight: 700; color: #1e40af;">${progressPercent}%</span>
        </div>
        <div style="height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 14px;">
          <div style="height: 100%; width: ${progressPercent}%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); border-radius: 6px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 12px; color: #64748b;">Planned: <strong style="color: #1e293b;">${totalPlanned}</strong> activities</span>
          <span style="font-size: 12px; color: #16a34a;">Completed: <strong>${totalCompleted}</strong> activities</span>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="${styles.h2}">Subject-wise Progress</h2>
        ${subjectBreakdownHTML}
      </div>

      <div style="${styles.footer}">
        <span>HSC Science Study Tracker</span>
        <span>Page 1 of ${totalPages}</span>
      </div>
    </div>
  `;

  await capturePageToPDF(summaryContainer, pdf, true);
  document.body.removeChild(summaryContainer);

  // Page 2+: Detailed plans by subject
  let pageNumber = 2;
  for (const subject of subjects) {
    const subjectPlans = plans.filter((p) => p.subject === subject.data.id);
    if (subjectPlans.length === 0) continue;

    const detailContainer = createContainer();

    // Calculate subject stats
    const stats = subjectStats[subject.data.id] || { planned: 0, completed: 0, chapters: 0 };
    const subjectPercent = stats.planned > 0 ? Math.round((stats.completed / stats.planned) * 100) : 0;

    const chaptersHTML = subjectPlans
      .map((plan) => {
        const completedActivities =
          completedActivitiesMap.get(`${plan.subject}-${plan.chapter}`) || [];

        const activitiesHTML = plan.planned_activities
          .map((activity) => {
            const isCompleted = completedActivities.includes(activity);
            return `
              <span style="
                display: inline-flex;
                align-items: center;
                gap: 3px;
                margin: 3px;
                padding: 5px 10px;
                background: ${isCompleted ? "#dcfce7" : "#f1f5f9"};
                border: 1px solid ${isCompleted ? "#bbf7d0" : "#e2e8f0"};
                color: ${isCompleted ? "#15803d" : "#475569"};
                font-size: 11px;
                font-weight: 500;
                border-radius: 4px;
              ">
                ${isCompleted ? "✓ " : ""}${activity}
              </span>
            `;
          })
          .join("");

        const completed = plan.planned_activities.filter((a) =>
          completedActivities.includes(a)
        ).length;
        const total = plan.planned_activities.length;
        const chapterPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
          <div style="
            break-inside: avoid;
            margin-bottom: 14px;
            padding: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #fff;
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 600; color: #1e293b; line-height: 1.4; flex: 1; padding-right: 12px;">${plan.chapter}</span>
              <span style="
                font-size: 11px; 
                font-weight: 600; 
                color: ${chapterPercent >= 75 ? '#16a34a' : chapterPercent >= 50 ? '#ca8a04' : '#64748b'};
                background: ${chapterPercent >= 75 ? '#f0fdf4' : chapterPercent >= 50 ? '#fefce8' : '#f8fafc'};
                padding: 2px 8px;
                border-radius: 4px;
              ">${completed}/${total}</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; margin: -3px; margin-bottom: 8px;">${activitiesHTML}</div>
            ${plan.goals ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
                <p style="font-size: 10px; color: #64748b; margin: 0;"><strong style="color: #475569;">Goal:</strong> ${plan.goals}</p>
              </div>
            ` : ""}
            ${plan.notes ? `
              <div style="${!plan.goals ? 'margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9;' : 'margin-top: 6px;'}">
                <p style="font-size: 10px; color: #64748b; margin: 0;"><strong style="color: #475569;">Notes:</strong> ${plan.notes}</p>
              </div>
            ` : ""}
          </div>
        `;
      })
      .join("");

    detailContainer.innerHTML = `
      <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif; height: 100%; position: relative;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 14px;
          margin-bottom: 20px;
        ">
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${subject.data.name}</h2>
            <p style="font-size: 11px; color: #64748b; margin: 0;">${monthYear} • ${subjectPlans.length} chapter${subjectPlans.length > 1 ? 's' : ''} planned</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 26px; font-weight: 700; color: #1e40af; margin: 0;">${subjectPercent}%</p>
            <p style="font-size: 10px; color: #64748b; margin: 0;">completed</p>
          </div>
        </div>
        
        <div style="column-count: 1;">
          ${chaptersHTML}
        </div>
        
        <div style="${styles.footer}">
          <span>HSC Science Study Tracker</span>
          <span>Page ${pageNumber} of ${totalPages}</span>
        </div>
      </div>
    `;

    await capturePageToPDF(detailContainer, pdf, false);
    document.body.removeChild(detailContainer);
    pageNumber++;
  }

  pdf.save(`hsc-monthly-plan-${format(new Date(), "yyyy-MM")}.pdf`);
}
