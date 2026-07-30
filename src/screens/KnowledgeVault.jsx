import { useState } from 'react';
import { ChevronDown, ChevronRight, Sigma, Orbit, Zap as ZapIcon, Atom, Flame, Cpu, Sparkles, Grid, Radiation, Lightbulb, AlertTriangle, BookOpen, ScrollText } from 'lucide-react';
import { CSIR_SUBJECTS } from '../data/csirSyllabus';
import { CONCEPT_CAPSULES } from '../data/conceptCapsules';
import { FORMULA_VAULT } from '../data/formulaVault';
import { CHAPTERS } from '../data/chapters';
import { storageService } from '../services/storageService';
import DerivationStepper from '../components/DerivationStepper';
import FormulaCard from '../components/FormulaCard';
import RichText from '../components/RichText';

const ICON_MAP = {
  Sigma, Orbit, Zap: ZapIcon, Atom, Flame, Cpu, Sparkles, Grid, Radiation: Radiation
};

export default function KnowledgeVault({ navigate, selectedSubtopic }) {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [activeSubtopic, setActiveSubtopic] = useState(selectedSubtopic);
  const [activeTab, setActiveTab] = useState('capsule');

  const capsules = CONCEPT_CAPSULES.filter(c => c.subtopicId === activeSubtopic?.id);
  const chapters = CHAPTERS.filter(c => c.subtopicId === activeSubtopic?.id);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const formulas = FORMULA_VAULT.filter(f => f.subjectId === activeSubjectId);

  function handleSelectSubtopic(subtopic, subject) {
    setActiveSubtopic(subtopic);
    setActiveSubjectId(subject.id);
    setExpandedSubject(subject.id);
    setActiveTab('capsule');
    storageService.setLastViewed({ screen: 'vault', subtopic: subtopic, label: subtopic.name });
  }

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-[#00F0FF]" />
        <h1 className="text-xl font-bold text-white">Knowledge Vault</h1>
        <span className="text-xs text-gray-500">- 9 CSIR NET Core & Advanced Subjects</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Subject Hierarchy */}
        <div className="lg:col-span-1 space-y-2">
          {CSIR_SUBJECTS.map(subject => {
            const Icon = ICON_MAP[subject.icon] || BookOpen;
            const isExpanded = expandedSubject === subject.id;
            return (
              <div key={subject.id} className="glass-panel rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg" style={{ background: `${subject.color}15`, color: subject.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-200">{subject.name}</p>
                      <p className="text-[10px] text-gray-500">{subject.weightage}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>

                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1">
                    {subject.subtopics.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectSubtopic(sub, subject)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                          activeSubtopic?.id === sub.id
                            ? 'bg-cyan-500/10 text-[#00F0FF] font-semibold'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content: Subtopic Details */}
        <div className="lg:col-span-2">
          {!activeSubtopic ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Select a Subtopic</h3>
              <p className="text-sm text-gray-600">
                Expand a subject and select any subtopic to view concept capsules, interactive derivations, formula sheets, and common pitfalls.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subtopic header */}
              <div className="glass-panel rounded-2xl p-5">
                <h2 className="text-lg font-bold text-white">{activeSubtopic.name}</h2>
                <div className="flex gap-2 mt-3">
                  {[
                    { id: 'capsule', label: 'Concept Capsule', icon: Lightbulb },
                    { id: 'chapter', label: 'Full Chapter', icon: ScrollText },
                    { id: 'derivation', label: 'Derivations', icon: BookOpen },
                    { id: 'formula', label: 'Formula Sheet', icon: Grid },
                    { id: 'pitfalls', label: 'Pitfalls', icon: AlertTriangle },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          active ? 'bg-cyan-500/10 text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capsule Tab */}
              {activeTab === 'capsule' && (
                <div className="space-y-3">
                  {capsules.length === 0 ? (
                    <div className="glass-panel rounded-xl p-8 text-center text-sm text-gray-600">
                      No concept capsule available for this subtopic yet. Upload textbook PDFs via Google Sheets to expand content.
                    </div>
                  ) : capsules.map(cap => {
                    const progress = storageService.getProgress();
                    const isRead = progress.completedCapsules.includes(cap.id);
                    return (
                      <div key={cap.id} className="glass-panel rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-white">{cap.title}</h3>
                          <button
                            onClick={() => { storageService.recordCapsuleRead(cap.id); }}
                            className={`text-xs px-2 py-1 rounded transition ${
                              isRead ? 'bg-green-500/10 text-[#00FF88]' : 'bg-white/5 text-gray-400 hover:text-cyan-300'
                            }`}
                          >
                            {isRead ? 'Read' : 'Mark Read'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">3 min read - {cap.readTime}</p>
                        <p className="text-sm text-gray-400 mb-3">{cap.summary}</p>
                        <div>
                          <p className="text-xs font-semibold text-[#00F0FF] mb-2">Key Takeaways:</p>
                          <div className="space-y-2">
                            {cap.keyTakeaways.map((kt, i) => (
                              <div key={i} className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-300">
                                <RichText>{kt}</RichText>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full Chapter Tab */}
              {activeTab === 'chapter' && (
                <div className="space-y-3">
                  {chapters.length === 0 ? (
                    <div className="glass-panel rounded-xl p-8 text-center text-sm text-gray-600">
                      No full chapter notes available for this subtopic yet. Upload textbook PDFs via the Ingestion engine to auto-generate detailed chapters.
                    </div>
                  ) : chapters.map(ch => (
                    <div key={ch.id} className="glass-panel rounded-2xl overflow-hidden">
                      {/* Chapter header */}
                      <div className="bg-gradient-to-r from-cyan-900/20 to-violet-900/20 px-5 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <ScrollText className="w-5 h-5 text-[#00F0FF]" />
                          <h3 className="text-lg font-bold text-white">{ch.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500">{ch.readTime} read · {ch.sections.length} sections</p>
                      </div>

                      {/* Chapter sections */}
                      <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                        {ch.sections.map((sec, i) => (
                          <div key={i} className="border-l-2 border-cyan-400/20 pl-4">
                            <h4 className="text-sm font-bold text-[#00F0FF] mb-2">{sec.heading}</h4>
                            <div className="text-sm text-gray-300 leading-relaxed">
                              <RichText block>{sec.content}</RichText>
                            </div>
                          </div>
                        ))}

                        {/* Key formulas summary */}
                        {ch.keyFormulas && ch.keyFormulas.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <h4 className="text-sm font-bold text-[#00FF88] mb-3">Key Formulas in This Chapter</h4>
                            <div className="space-y-2">
                              {ch.keyFormulas.map((f, i) => (
                                <div key={i} className="bg-black/30 rounded-lg p-3">
                                  <RichText block>{f}</RichText>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Derivation Tab */}
              {activeTab === 'derivation' && (
                <div className="space-y-3">
                  {capsules.filter(c => c.derivationStepper).length === 0 ? (
                    <div className="glass-panel rounded-xl p-8 text-center text-sm text-gray-600">
                      No interactive derivations available yet for this topic.
                    </div>
                  ) : capsules.filter(c => c.derivationStepper).map(cap => (
                    <div key={cap.id}>
                      <DerivationStepper stepperData={cap.derivationStepper} />
                    </div>
                  ))}
                </div>
              )}

              {/* Formula Sheet Tab */}
              {activeTab === 'formula' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formulas.length === 0 ? (
                    <div className="col-span-2 glass-panel rounded-xl p-8 text-center text-sm text-gray-600">
                      No formula cards available for this subject yet.
                    </div>
                  ) : formulas.map(f => <FormulaCard key={f.id} formula={f} />)}
                </div>
              )}

              {/* Pitfalls Tab */}
              {activeTab === 'pitfalls' && (
                <div className="space-y-2">
                  {capsules.length === 0 || !capsules.some(c => c.commonPitfalls) ? (
                    <div className="glass-panel rounded-xl p-8 text-center text-sm text-gray-600">
                      No pitfall warnings available yet for this subtopic.
                    </div>
                  ) : capsules.flatMap(c => (c.commonPitfalls || []).map((p, i) => (
                    <div key={`${c.id}-${i}`} className="glass-panel rounded-lg p-4 border-l-2 border-amber-400/40">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                          <RichText>{p}</RichText>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
