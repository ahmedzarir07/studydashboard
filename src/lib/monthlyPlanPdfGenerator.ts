import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { MonthlyPlan } from "@/hooks/useMonthlyPlans";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

function createContainer(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";
  el.style.width = A4_WIDTH + "px";
  el.style.height = A4_HEIGHT + "px";
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

interface SubjectInfo {
  data: { id: string; name: string };
  label: string;
}

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

  // Page 1: Summary
  const summaryContainer = createContainer();

  const subjectBreakdownHTML = Object.entries(subjectStats)
    .map(([subjectId, stats]) => {
      const subject = subjects.find((s) => s.data.id === subjectId);
      const percent =
        stats.planned > 0
          ? Math.round((stats.completed / stats.planned) * 100)
          : 0;
      return `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
          <span style="font-size:13px;color:#000;">${subject?.data.name || subjectId}</span>
          <span style="font-size:13px;color:#000;font-weight:600;">${percent}% (${stats.chapters} chapters)</span>
        </div>
      `;
    })
    .join("");

  summaryContainer.innerHTML = `
    <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;">
      <h1 style="font-size:22px;font-weight:bold;margin-bottom:6px;color:#000;">HSC Science — Monthly Study Plan</h1>
      <p style="font-size:11px;color:#666;margin-bottom:20px;">Generated: ${format(new Date(), "PPpp")}</p>
      
      <div style="display:flex;gap:24px;margin-bottom:24px;">
        <div>
          <p style="font-size:11px;color:#666;margin-bottom:4px;">Month</p>
          <p style="font-size:16px;font-weight:600;color:#000;">${monthYear}</p>
        </div>
        <div>
          <p style="font-size:11px;color:#666;margin-bottom:4px;">Student</p>
          <p style="font-size:14px;color:#000;">${email}</p>
        </div>
      </div>

      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:14px;font-weight:600;color:#000;">Overall Progress</span>
          <span style="font-size:14px;font-weight:bold;color:#3b82f6;">${progressPercent}%</span>
        </div>
        <div style="height:10px;background:#e5e7eb;border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${progressPercent}%;background:linear-gradient(90deg,#3b82f6,#60a5fa);border-radius:5px;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:12px;">
          <span style="font-size:12px;color:#666;">Planned: ${totalPlanned} activities</span>
          <span style="font-size:12px;color:#16a34a;">Completed: ${totalCompleted} activities</span>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <h2 style="font-size:15px;font-weight:bold;margin-bottom:12px;color:#000;">Subject-wise Progress</h2>
        ${subjectBreakdownHTML}
      </div>

      <div style="position:absolute;bottom:24px;left:24px;font-size:9px;color:#999;">HSC Science Study Tracker — Page 1</div>
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

    const chaptersHTML = subjectPlans
      .map((plan) => {
        const completedActivities =
          completedActivitiesMap.get(`${plan.subject}-${plan.chapter}`) || [];

        const activitiesHTML = plan.planned_activities
          .map((activity) => {
            const isCompleted = completedActivities.includes(activity);
            return `
              <span style="display:inline-block;margin:2px;padding:3px 8px;background:${isCompleted ? "#dcfce7" : "#f3f4f6"};color:${isCompleted ? "#16a34a" : "#374151"};font-size:10px;border-radius:4px;">
                ${isCompleted ? "✓ " : ""}${activity}
              </span>
            `;
          })
          .join("");

        const completed = plan.planned_activities.filter((a) =>
          completedActivities.includes(a)
        ).length;
        const total = plan.planned_activities.length;

        return `
          <div style="break-inside:avoid;margin-bottom:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:11px;font-weight:600;color:#000;line-height:1.3;">${plan.chapter}</span>
              <span style="font-size:10px;color:#666;">${completed}/${total}</span>
            </div>
            <div style="margin-bottom:8px;">${activitiesHTML}</div>
            ${plan.goals ? `<p style="font-size:10px;color:#666;margin-top:6px;"><strong>Goal:</strong> ${plan.goals}</p>` : ""}
            ${plan.notes ? `<p style="font-size:10px;color:#666;margin-top:4px;"><strong>Notes:</strong> ${plan.notes}</p>` : ""}
          </div>
        `;
      })
      .join("");

    detailContainer.innerHTML = `
      <div style="font-family:'Noto Sans Bengali','Inter',sans-serif;height:100%;position:relative;">
        <div style="border-bottom:2px solid #3b82f6;padding-bottom:8px;margin-bottom:16px;">
          <h2 style="font-size:16px;font-weight:bold;color:#000;margin:0;">${subject.data.name}</h2>
          <p style="font-size:10px;color:#666;margin:4px 0 0 0;">${monthYear} — ${subjectPlans.length} chapters planned</p>
        </div>
        <div style="column-count:1;">
          ${chaptersHTML}
        </div>
        <div style="position:absolute;bottom:0;left:0;font-size:8px;color:#999;">HSC Science Study Tracker — Page ${pageNumber}</div>
      </div>
    `;

    await capturePageToPDF(detailContainer, pdf, false);
    document.body.removeChild(detailContainer);
    pageNumber++;
  }

  pdf.save(`hsc-monthly-plan-${format(new Date(), "yyyy-MM")}.pdf`);
}
