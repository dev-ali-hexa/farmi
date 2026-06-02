import React, { useState } from 'react';
import { PenTool, Calendar, Palette, FileText, CheckCircle, Clock, Link2, IndianRupee, Image as ImageIcon, Send, ArrowRight, UserCheck } from 'lucide-react';
import { Project, ProjectStatus } from '../types.js';

interface ConsultationsProps {
  projects: Project[];
  user: any;
  onNewRequest: (requestDetails: string, preferredStyle: string) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
}

// Aesthetic choices
const AESTHETIC_STYLES = [
  'Modern Classic',
  'Scandinavian',
  'Nordic Minimalist',
  'Industrial Loft',
  'Mid-Century Modern',
  'Japanese Zen (Japandi)',
  'Bohemian Rustic',
];

export default function Consultations({
  projects,
  user,
  onNewRequest,
  onUpdateProject,
}: ConsultationsProps) {
  // Customer request state
  const [requestDetails, setRequestDetails] = useState('');
  const [preferredStyle, setPreferredStyle] = useState(AESTHETIC_STYLES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Designer plan making state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [designUrlInput, setDesignUrlInput] = useState('');
  const [designUrls, setDesignUrls] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('Requested');

  const handleStartReview = (project: Project) => {
    setEditingProjectId(project.id);
    setPlanTitle(project.planTitle || '');
    setPlanDescription(project.planDescription || '');
    setEstimatedCost(project.estimatedCost?.toString() || '');
    setNotes(project.notes || '');
    setDesignUrls(project.designUrls || []);
    setProjectStatus(project.status);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDetails.trim()) return;

    setSubmitting(true);
    try {
      await onNewRequest(requestDetails, preferredStyle);
      setRequestSuccess(true);
      setRequestDetails('');
      setTimeout(() => setRequestSuccess(false), 5000);
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectId) return;

    const updates: Partial<Project> = {
      status: projectStatus,
      planTitle,
      planDescription,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      notes,
      designUrls,
    };

    try {
      await onUpdateProject(editingProjectId, updates);
      setEditingProjectId(null);
    } catch (err) {
      console.error('Update plan failed:', err);
    }
  };

  const handleAddDesignUrl = () => {
    if (!designUrlInput.trim()) return;
    setDesignUrls([...designUrls, designUrlInput.trim()]);
    setDesignUrlInput('');
  };

  const handleRemoveDesignUrl = (index: number) => {
    setDesignUrls(designUrls.filter((_, i) => i !== index));
  };

  // Helper for status styling
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Requested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Planning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const isStaff = user && (user.role === 'admin' || user.role === 'designer');

  return (
    <div className="space-y-10 animate-[fadeIn_0.3s_ease-out]">
      {/* Title block */}
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
          Interior Consultation & Creative Design Plans
        </h2>
        <p className="text-sm text-neutral-500">
          {isStaff
            ? 'Access layout blueprints, formulate tailored project plans and update customer consultations.'
            : 'Request structured virtual layouts, inspect moodboards and track spatial creation phases 1-on-1.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: For customers, consultation request form. For designers, quick guide */}
        <div className="lg:col-span-1 space-y-6">
          {!isStaff ? (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-100 p-2.5 rounded-xl text-neutral-800">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-neutral-900 leading-tight">
                    Inquire Consultation
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono tracking-wider mt-0.5 uppercase">
                    1-ON-1 DESIGN SERVICE
                  </p>
                </div>
              </div>

              {requestSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Consultation filed! MÄSTER designers will update with moodboards shortly.</span>
                </div>
              )}

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Preferred Aesthetic Style
                  </label>
                  <select
                    value={preferredStyle}
                    onChange={(e) => setPreferredStyle(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  >
                    {AESTHETIC_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    What space and details are you planning?
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="E.g., I would love to remodel my 14x16ft living room. Looking to include cozy reading corners, low-profile oak furniture, and optimize ambient lighting..."
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <span>{submitting ? 'Submitting Details...' : 'Submit Request'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-2xl p-6 text-white space-y-4 shadow-md">
              <h3 className="font-display font-medium text-base tracking-tight">Studio Designer Protocols</h3>
              <ul className="space-y-3.5 text-xs text-neutral-300">
                <li className="flex gap-2.5">
                  <span className="font-mono text-neutral-500 font-bold shrink-0">01.</span>
                  <span><strong>Claim Consultation:</strong> Take ownership of requested projects by editing and updating the plan.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-neutral-500 font-bold shrink-0">02.</span>
                  <span><strong>Formulate Blueprint:</strong> Provide structured layout ideas, estimated project budgets, and designer notes.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-neutral-500 font-bold shrink-0">03.</span>
                  <span><strong>Reference Inspiration:</strong> Attach high-quality images of mock spaces and designs for client moodboards.</span>
                </li>
              </ul>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-neutral-400 leading-relaxed font-mono">
                Assigned projects will register with your designer credentials upon saving the plan.
              </div>
            </div>
          )}
        </div>

        {/* Right pane: list of consultations, if editing show the planner form */}
        <div className="lg:col-span-2 space-y-6">
          {editingProjectId ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-xs">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <h3 className="font-display font-bold text-sm text-neutral-900">
                  Formulate Design Plan & Update Status
                </h3>
                <button
                  onClick={() => setEditingProjectId(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-4">
                {/* Status slider */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Update Workflow Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                    {(['Requested', 'Assigned', 'Planning', 'In Progress', 'Completed'] as ProjectStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setProjectStatus(status)}
                        className={`py-2 text-[10px] font-semibold border rounded-xl capitalize transition cursor-pointer ${
                          projectStatus === status
                            ? 'bg-neutral-950 border-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Project Plan Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Japandi Soft Warm Haven"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Estimated Budget (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2 w-4 h-4 text-neutral-400" />
                      <input
                        type="number"
                        placeholder="E.g., 4200"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        className="w-full text-xs pl-8 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Creative Blueprint / Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain the layout, choice of textures, color tone pairings..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Designer Private / Client Notes
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Client wants to keep current carpet. Added coordinates to living room corners..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>

                {/* Reference Images / Links */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Design Reference Photo Links
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste high-res Unsplash interior image URL"
                      value={designUrlInput}
                      onChange={(e) => setDesignUrlInput(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddDesignUrl}
                      className="px-3.5 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-xl transition cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  {designUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {designUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                          <img src={url} alt="inspiration" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveDesignUrl(index)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProjectId(null)}
                    className="px-4 py-2 text-xs font-semibold border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition cursor-pointer"
                  >
                    Discard Edits
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition shadow-xs cursor-pointer"
                  >
                    Save & Assign Project
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-neutral-100">
                <span className="text-xs font-semibold text-neutral-500 font-mono">
                  {projects.length} design files enrolled
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center">
                  <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-neutral-800">No active consultations yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Submit your floor inquiries on the left panel to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-4 shadow-2xs hover:border-neutral-300 transition-all duration-200"
                      id={`project-item-${proj.id}`}
                    >
                      {/* Top ribbon */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-neutral-400">
                              REF: {proj.id.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-neutral-800">
                              | style Preference: <strong className="text-neutral-900 font-normal">{proj.preferredStyle}</strong>
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">
                            Submitted by <strong className="text-neutral-800 font-medium">{proj.customerName}</strong> ({proj.email}) on {new Date(proj.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 font-mono text-[9px] font-bold rounded-full border uppercase ${getStatusBadge(proj.status)}`}>
                          {proj.status}
                        </span>
                      </div>

                      {/* Request details */}
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-xs text-neutral-600 leading-relaxed">
                        <strong className="block text-neutral-800 mb-1 text-[10px] uppercase tracking-wider font-mono">Inquiry Requirements:</strong>
                        {proj.requestDetails}
                      </div>

                      {/* Designer Plan details, if available */}
                      {proj.planTitle ? (
                        <div className="border border-neutral-100 rounded-xl p-4 space-y-3.5 bg-neutral-50/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Project Blueprint Plan</span>
                              <h4 className="font-display font-bold text-sm text-neutral-900 mt-0.5">
                                {proj.planTitle}
                              </h4>
                            </div>
                            {proj.estimatedCost && (
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Est. Budget</span>
                                <p className="font-mono text-sm font-bold text-neutral-950 mt-0.5">
                                ₹{proj.estimatedCost}
                                </p>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {proj.planDescription}
                          </p>

                          {proj.notes && (
                            <p className="text-[11px] text-neutral-500 bg-white border border-neutral-100 p-2.5 rounded-lg italic">
                              <strong>Designer note:</strong> {proj.notes}
                            </p>
                          )}

                          {proj.designUrls && proj.designUrls.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block">Design Moodboards & Layouts</span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {proj.designUrls.map((url, idx) => (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="relative aspect-video rounded-lg overflow-hidden border border-neutral-250 bg-neutral-100 hover:opacity-90 block"
                                  >
                                    <img src={url} alt="blueprint" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent flex items-end p-1.5 text-white text-[9px] font-medium font-mono">
                                      Layout Ref #{idx + 1}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {proj.designerName && (
                            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                              <UserCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                              <span>MÄSTER Consultant: <strong>{proj.designerName}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl text-center">
                          <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1.5 animate-spin" />
                          <p className="text-xs text-amber-900 font-medium font-display">Waiting on layout plans</p>
                          <p className="text-[10px] text-amber-700/80 mt-0.5">An assigned MÄSTER interior designer is currently planning out modern spatial draft lines.</p>
                        </div>
                      )}

                      {/* Designer and Admin Action triggers */}
                      {isStaff && (
                        <div className="flex justify-end pt-2 border-t border-neutral-50">
                          <button
                            type="button"
                            onClick={() => handleStartReview(proj)}
                            id={`btn-dev-plan-${proj.id}`}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>{proj.planTitle ? 'Modify Design Plan / Status' : 'Formulate Project Plan'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
