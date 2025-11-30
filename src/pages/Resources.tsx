import React, { useState } from 'react';

export default function Resources() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
    console.log('card_expanded', { id: cardId, expanded: !expandedCards[cardId] });
  };

  const handleStartJourney = () => {
    console.log('start_journey_clicked');
    document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent, cardId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard(cardId);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '24px 16px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          borderRadius: '16px',
          padding: '32px 24px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>🎯</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px 0', lineHeight: '1.2' }}>
            Average Student → Topper Roadmap
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.95, margin: '0 0 24px 0' }}>
            ৫-ধাপের ইন্টারঅ্যাকটিভ সিস্টেম
          </p>
          <button
            onClick={handleStartJourney}
            style={{
              background: '#1e293b',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
            onFocus={(e) => e.currentTarget.style.outline = '2px solid #fff'}
            onBlur={(e) => e.currentTarget.style.outline = 'none'}
          >
            জার্নি শুরু করুন
          </button>
        </div>

        {/* Main Concept Card */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 16px 0', color: '#10b981' }}>
            💡 ট্যালেন্ট নয়—স্ট্র্যাটেজিই আসল শক্তি
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', margin: 0, color: '#cbd5e1' }}>
            বেশির ভাগ স্টুডেন্ট মনোযোগ ধরে রাখতে পারে না, দ্রুত ভুলে যায়, এবং কোন প্ল্যান থাকে না। এই ৫টি ধাপ ৩–৪ মাসে আপনার পারফরম্যান্স চোখে দেখার মতো উন্নত করবে।
          </p>
        </div>

        {/* Steps Grid */}
        <div id="steps" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Step 1 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#f59e0b' }}>
              📚 Step 1 — লং স্টাডি আওয়ার + ডিস্ট্রাকশন কন্ট্রোল
            </h3>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <li>ডিস্ট্রাকশন লিস্ট তৈরি করুন</li>
              <li>একটি Big Goal Card টেবিলে রাখুন</li>
            </ul>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('step1')}
              onKeyDown={(e) => handleKeyPress(e, 'step1')}
              style={{
                cursor: 'pointer',
                padding: '12px',
                background: '#334155',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {expandedCards['step1'] ? '▼ Hide Tip' : '▶ Show Tip'}
            </div>
            {expandedCards['step1'] && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                background: '#0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#94a3b8',
                borderLeft: '3px solid #f59e0b'
              }}>
                💡 ২৫ মিনিট → ৪০ → ৬০ মিনিট ফোকাস বাড়ান
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#8b5cf6' }}>
              📅 Step 2 — মাসিক কনটেন্ট ক্যালেন্ডার (Planning)
            </h3>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <li>প্রতিটি চ্যাপ্টারের ঘন্টা হিসাব করুন</li>
              <li>১০% Spare Hours যোগ করুন</li>
              <li>৩০ দিনের ক্যালেন্ডার তৈরি করুন</li>
            </ul>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('step2')}
              onKeyDown={(e) => handleKeyPress(e, 'step2')}
              style={{
                cursor: 'pointer',
                padding: '12px',
                background: '#334155',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {expandedCards['step2'] ? '▼ Hide Tip' : '▶ Show Tip'}
            </div>
            {expandedCards['step2'] && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                background: '#0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#94a3b8',
                borderLeft: '3px solid #8b5cf6'
              }}>
                💡 আজ রাতেই নিজের ৩০ দিনের স্টাডি ক্যালেন্ডার বানান
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#ec4899' }}>
              🎯 Step 3 — টপারদের স্মার্ট হ্যাবিট কপি করুন
            </h3>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <li>নোট নেয়ার স্টাইল দেখুন</li>
              <li>কালার-কোডেড নোট ব্যবহার করুন</li>
              <li>কোন চ্যাপ্টার বাদ যায় বুঝুন</li>
            </ul>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('step3')}
              onKeyDown={(e) => handleKeyPress(e, 'step3')}
              style={{
                cursor: 'pointer',
                padding: '12px',
                background: '#334155',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {expandedCards['step3'] ? '▼ Hide Tip' : '▶ Show Tip'}
            </div>
            {expandedCards['step3'] && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                background: '#0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#94a3b8',
                borderLeft: '3px solid #ec4899'
              }}>
                💡 আজ একজন টপার ফ্রেন্ডের নোট দেখে একটি অভ্যাস গ্রহণ করুন
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#06b6d4' }}>
              ✍️ Step 4 — Answer Writing Strategy উন্নত করুন
            </h3>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <li>হেডিং, টেবিল, ডায়াগ্রাম ব্যবহার করুন</li>
              <li>উত্তর গুছানোভাবে লিখুন</li>
            </ul>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('step4')}
              onKeyDown={(e) => handleKeyPress(e, 'step4')}
              style={{
                cursor: 'pointer',
                padding: '12px',
                background: '#334155',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {expandedCards['step4'] ? '▼ Hide Tip' : '▶ Show Tip'}
            </div>
            {expandedCards['step4'] && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                background: '#0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#94a3b8',
                borderLeft: '3px solid #06b6d4'
              }}>
                💡 পরবর্তী পরীক্ষায় শুধু প্রেজেন্টেশন বদলান
              </div>
            )}
          </div>

          {/* Step 5 */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#10b981' }}>
              👥 Step 5 — নিজের স্টাডি কমিউনিটি বানান
            </h3>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <li>৩–৫ জনের স্টাডি সার্কেল বানান</li>
              <li>সাপ্তাহিক রিভিউ করুন</li>
            </ul>
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('step5')}
              onKeyDown={(e) => handleKeyPress(e, 'step5')}
              style={{
                cursor: 'pointer',
                padding: '12px',
                background: '#334155',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {expandedCards['step5'] ? '▼ Hide Tip' : '▶ Show Tip'}
            </div>
            {expandedCards['step5'] && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                background: '#0f172a',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#94a3b8',
                borderLeft: '3px solid #10b981'
              }}>
                💡 আজই একজন ভালো ছাত্রকে মেসেজ করুন
              </div>
            )}
          </div>

          {/* Results Card */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #22c55e'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#22c55e' }}>
              ✅ Expected Results (৩–৪ মাস)
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
              <li>ফোকাস বাড়ে</li>
              <li>ভুলে যাওয়া কমে</li>
              <li>রুটিন কনসিস্টেন্ট হয়</li>
              <li>মার্কস +১০ থেকে +২৫ বাড়ে</li>
              <li>কনফিডেন্স বাড়ে</li>
            </ul>
          </div>
        </div>

        {/* Motivation Card */}
        <div style={{
          background: 'linear-gradient(135deg, #be123c 0%, #dc2626 100%)',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 16px 0', fontStyle: 'italic' }}>
            "Consistency beats talent. Every single time."
          </p>
          <button
            onClick={handleStartJourney}
            style={{
              background: '#fff',
              color: '#be123c',
              padding: '14px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onFocus={(e) => e.currentTarget.style.outline = '2px solid #fff'}
            onBlur={(e) => e.currentTarget.style.outline = 'none'}
          >
            ৩০ দিনের প্ল্যান শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
}
