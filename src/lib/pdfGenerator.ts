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

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const createPDFContainer = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${A4_WIDTH}px;
    min-height: ${A4_HEIGHT}px;
    background: white;
    color: black;
    font-family: 'Noto Sans Bengali', 'Inter', sans-serif;
    padding: 40px;
    box-sizing: border-box;
  `;
  document.body.appendChild(container);
  return container;
};

const renderToPDF = async (container: HTMLDivElement, filename: string) => {
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
};

export const generateOverallProgressPDF = async (
  email: string,
  overallProgress: number,
  subjectProgresses: SubjectProgress[]
) => {
  const container = createPDFContainer();
  
  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #000;">
        HSC Science — Overall Progress Report
      </h1>
      <p style="font-size: 12px; color: #666; margin-bottom: 24px;">
        Generated: ${format(new Date(), "PPpp")}
      </p>
      
      <p style="font-size: 14px; margin-bottom: 20px; color: #000;">
        <strong>Student:</strong> ${email}
      </p>
      
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #000;">
          Overall Completion
        </h2>
        <p style="font-size: 14px; color: #000;">
          ${overallProgress}% complete
        </p>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #000;">
          Subject-wise Progress
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${subjectProgresses.map(subject => `
            <li style="font-size: 14px; padding: 6px 0; color: #000; border-bottom: 1px solid #eee;">
              • ${subject.fullName}: <strong>${subject.progress}%</strong>
            </li>
          `).join("")}
        </ul>
      </div>
      
      <div style="position: absolute; bottom: 40px; left: 40px; font-size: 10px; color: #999;">
        HSC Science Study Tracker
      </div>
    </div>
  `;

  await renderToPDF(container, `hsc-overall-progress-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateMonthlyProgressPDF = async (
  email: string,
  monthYear: string,
  completions: ChapterCompletion[]
) => {
  const container = createPDFContainer();
  
  const bySubject = completions.reduce((acc, c) => {
    acc[c.subject] = (acc[c.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCompletions = [...completions].sort((a, b) => {
    if (!a.completed_at || !b.completed_at) return 0;
    return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
  });

  container.innerHTML = `
    <div style="font-family: 'Noto Sans Bengali', 'Inter', sans-serif;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #000;">
        HSC Science — Monthly Progress Report
      </h1>
      <p style="font-size: 12px; color: #666; margin-bottom: 24px;">
        Generated: ${format(new Date(), "PPpp")}
      </p>
      
      <p style="font-size: 14px; margin-bottom: 6px; color: #000;">
        <strong>Month:</strong> ${monthYear}
      </p>
      <p style="font-size: 14px; margin-bottom: 20px; color: #000;">
        <strong>Student:</strong> ${email}
      </p>
      
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #000;">
          Summary
        </h2>
        <p style="font-size: 14px; color: #000;">
          Total Chapters Completed: <strong>${completions.length}</strong>
        </p>
      </div>
      
      ${Object.keys(bySubject).length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #000;">
            Subject-wise Breakdown
          </h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${Object.entries(bySubject).map(([subject, count]) => `
              <li style="font-size: 14px; padding: 4px 0; color: #000;">
                • ${subject}: <strong>${count}</strong> chapter${count > 1 ? "s" : ""}
              </li>
            `).join("")}
          </ul>
        </div>
      ` : ""}
      
      ${sortedCompletions.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #000;">
            Completed Chapters
          </h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${sortedCompletions.map(c => `
              <li style="font-size: 13px; padding: 6px 0; color: #000; border-bottom: 1px solid #eee;">
                • ${c.chapter} <span style="color: #666;">(${c.subject})</span>
                ${c.completed_at ? `<span style="color: #888; font-size: 11px;"> — ${format(new Date(c.completed_at), "MMM d, h:mm a")}</span>` : ""}
              </li>
            `).join("")}
          </ul>
        </div>
      ` : ""}
      
      <div style="position: absolute; bottom: 40px; left: 40px; font-size: 10px; color: #999;">
        HSC Science Study Tracker
      </div>
    </div>
  `;

  await renderToPDF(container, `hsc-monthly-progress-${format(new Date(), "yyyy-MM")}.pdf`);
};
