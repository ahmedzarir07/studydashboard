import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Resources() {
  const initialOptions = [
    { id: 'class', label_en: 'Class', label_bn: 'ক্লাস', selected: false },
    { id: 'total_class', label_en: 'মোট ক্লাস', label_bn: 'মোট ক্লাস', selected: false },
    { id: 'class_ka', label_en: 'ক', label_bn: 'ক', selected: false },
    { id: 'class_kha', label_en: 'খ', label_bn: 'খ', selected: false },
    { id: 'class_note', label_en: 'Class Note', label_bn: 'ক্লাস নোট', selected: false },
    { id: 'mcq_practice', label_en: 'MCQ Practice', label_bn: 'MCQ Practice', selected: false },
    { id: 'typewise_cq', label_en: 'Typewise CQ', label_bn: 'Typewise CQ', selected: false },
    { id: 'cq_summary', label_en: 'CQ Summery', label_bn: 'CQ Summery', selected: false },
    { id: 'mcq_summary', label_en: 'MCQ Summery', label_bn: 'MCQ Summery', selected: false },
    { id: 'all_revision', label_en: 'ALL Revision', label_bn: 'ALL Revision', selected: false }
  ];

  const [options, setOptions] = useState(initialOptions);
  const [darkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const printableRef = useRef<HTMLDivElement>(null);

  function toggleOption(id: string) {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, selected: !o.selected } : o));
  }

  function selectAllResources() {
    setOptions(prev => prev.map(o => ({ ...o, selected: true })));
  }

  function deselectAll() {
    setOptions(prev => prev.map(o => ({ ...o, selected: false })));
  }

  const selectedCount = options.filter(o => o.selected).length;
  const totalClasses = 42;

  function exportPDF() {
    if (!printableRef.current) return;

    const printContents = printableRef.current.innerHTML;
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      alert('Popup blocked. Allow popups for this site to export PDF.');
      return;
    }
    const doc = popup.document.open();
    doc.write(`<!doctype html><html><head><title>Export PDF</title>`);
    doc.write(`<style>body{font-family:system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:20px; background:${darkMode ? '#0f172a' : '#fff'}; color:${darkMode ? '#e6eef8' : '#111'};} .card{border-radius:8px; padding:12px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.12);} h1{font-size:20px}</style>`);
    doc.write('</head><body>');
    doc.write(printContents);
    doc.write('</body></html>');
    doc.close();
    popup.focus();
    setTimeout(() => {
      popup.print();
    }, 500);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-100">HSC Study Tracker</h1>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">হোম</Button>
              </Link>
              <Link to="/tracker">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">ট্র্যাকার</Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-100">রিসোর্স</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">HSC রিসোর্স</h2>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 rounded-md bg-slate-700 text-sm font-medium">ডার্ক মোড</span>
            <Button onClick={exportPDF} className="bg-indigo-600 hover:bg-indigo-500">PDF এক্সপোর্ট</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-6">রিসোর্স সিলেক্ট করুন</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {options.map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={opt.selected} 
                      onChange={() => toggleOption(opt.id)}
                      className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                    <div>
                      <div className="text-base font-medium">{opt.label_bn}</div>
                      <div className="text-sm text-slate-400">{opt.label_en}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 items-center">
                <Button onClick={selectAllResources} className="bg-green-600 hover:bg-green-700">সব সিলেক্ট করুন</Button>
                <Button onClick={deselectAll} variant="destructive">সব বাতিল করুন</Button>
                <div className="ml-auto text-sm bg-slate-700/50 px-4 py-2 rounded-lg">
                  সিলেক্ট করা: <strong className="text-lg ml-1">{selectedCount}</strong>
                </div>
              </div>
            </Card>
          </section>

          <aside className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <nav className="flex gap-2 mb-6">
                <Button 
                  onClick={() => setActiveTab('overview')} 
                  variant={activeTab === 'overview' ? 'default' : 'ghost'}
                  className={activeTab === 'overview' ? 'bg-indigo-600' : ''}
                >
                  ওভারভিউ
                </Button>
                <Button 
                  onClick={() => setActiveTab('allresources')} 
                  variant={activeTab === 'allresources' ? 'default' : 'ghost'}
                  className={activeTab === 'allresources' ? 'bg-indigo-600' : ''}
                >
                  সব রিসোর্স
                </Button>
              </nav>

              {activeTab === 'overview' && (
                <div>
                  <div className="mb-6">
                    <div className="text-sm text-slate-400 mb-1">মোট ক্লাস</div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{totalClasses}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400 mb-3">সিলেক্ট করা রিসোর্স</div>
                    {options.filter(o => o.selected).length === 0 ? (
                      <div className="text-sm text-slate-500 italic">কোনো আইটেম সিলেক্ট করা হয়নি</div>
                    ) : (
                      <ul className="space-y-2">
                        {options.filter(o => o.selected).map(o => (
                          <li key={o.id} className="text-sm bg-slate-700/30 px-3 py-2 rounded-lg flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                            <span className="font-medium">{o.label_bn}</span>
                            <span className="text-slate-400 text-xs">— {o.label_en}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'allresources' && (
                <div>
                  <div className="text-sm text-slate-400 mb-3">সব রিসোর্স</div>
                  <div className="space-y-3">
                    {options.map(o => (
                      <Card key={o.id} className="bg-slate-700/20 border-slate-600/30 p-3">
                        <div className="font-medium mb-1">
                          {o.label_bn} <span className="text-xs text-slate-400">({o.label_en})</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          স্ট্যাটাস: <span className={o.selected ? 'text-green-400' : 'text-slate-500'}>{o.selected ? 'সিলেক্ট করা' : 'সিলেক্ট নয়'}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </aside>
        </div>

        <div ref={printableRef} className="hidden">
          <h1>HSC রিসোর্স এক্সপোর্ট</h1>
          <p>মোট ক্লাস: {totalClasses}</p>
          <p>সিলেক্ট করা রিসোর্স: {selectedCount}</p>
          <ul>
            {options.filter(o => o.selected).map(o => (
              <li key={o.id}>{o.label_bn} — {o.label_en}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
