import React from 'react';
import { Palette, Layers, Star, Plus, CheckSquare, Calendar, ChevronRight } from 'lucide-react';
import { Project, ProjectStatus } from '../types.js';

interface DesignerDashboardProps {
  designerName: string;
  designerId: string;
  projects: Project[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
}

export default function DesignerDashboard({
  designerName,
  designerId,
  projects,
  activeTab,
  setActiveTab,
  onUpdateProject,
}: DesignerDashboardProps) {

  // Filtration logic for Designer Dahsboard stats
  const myAssignedProjects = projects.filter(p => p.designerId === designerId);
  const activeProjectsCount = myAssignedProjects.filter(p => ['Assigned', 'Planning', 'In Progress'].includes(p.status)).length;
  const completedProjectsCount = myAssignedProjects.filter(p => p.status === 'Completed').length;
  const unclaimedConsultations = projects.filter(p => p.status === 'Requested' || !p.designerId);

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Title ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Welcome, Danielle
          </h2>
          <p className="text-xs text-neutral-500 font-mono">
            MÄSTER CREATIVE CORNER • STATUS ACTIVE
          </p>
        </div>

        <button
          onClick={() => setActiveTab('consultation_request')}
          id="btn-designer-open-consultations"
          className="px-4 py-2 text-xs font-semibold bg-neutral-950 text-white rounded-xl shadow-xs hover:bg-neutral-850 cursor-pointer inline-flex items-center gap-1.5 transition"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Launch Consultations Tool</span>
        </button>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <Layers className="w-4 h-4 text-teal-600" />
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">ACTIVE WORK</span>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{activeProjectsCount}</h4>
            <p className="text-xs text-neutral-500">Active Design Projects</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <Palette className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">INBOX</span>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{unclaimedConsultations.length}</h4>
            <p className="text-xs text-neutral-500">Unclaimed Requests</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <Star className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">ARCHIVE</span>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{completedProjectsCount}</h4>
            <p className="text-xs text-neutral-500">Completed Spacial Designs</p>
          </div>
        </div>
      </div>

      {/* Central Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: My Assigned Projects list */}
        <div className="space-y-4">
          <span className="text-xs font-bold font-mono text-neutral-600 uppercase tracking-wider block">My Enrolled Spacial Projects ({myAssignedProjects.length})</span>

          {myAssignedProjects.length === 0 ? (
            <div className="p-10 border border-neutral-250 bg-white rounded-2xl text-center">
              <p className="text-xs text-neutral-500">No projects claimed or assigned to your docket yet.</p>
              <button
                onClick={() => setActiveTab('consultation_request')}
                className="mt-3 text-xs font-bold text-neutral-900 hover:underline bg-transparent"
              >
                Claim from consultation queue &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myAssignedProjects.map((p) => (
                <div key={p.id} className="p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition flex justify-between items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-neutral-400">CASE ID: {p.id.toUpperCase()}</span>
                      <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-lg">{p.status}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 block">{p.planTitle || 'Unit Draft Pending Planning'}</span>
                    <p className="text-[10px] text-neutral-500">Client: {p.customerName}</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('consultation_request')}
                    className="p-1.5 hover:bg-neutral-50 rounded-lg transition"
                    title="Formulate or correct details"
                  >
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Unclaimed Consultations waiting for feedback */}
        <div className="space-y-4">
          <span className="text-xs font-bold font-mono text-neutral-600 uppercase tracking-wider block">Spacial Consultations Queue awaiting decorator assignment ({unclaimedConsultations.length})</span>

          {unclaimedConsultations.length === 0 ? (
            <div className="p-10 border border-dashed border-neutral-200 bg-neutral-50 text-neutral-500 text-center rounded-2xl text-xs font-mono">
              Queue is completely empty! Great work.
            </div>
          ) : (
            <div className="space-y-3">
              {unclaimedConsultations.slice(0, 4).map((p) => (
                <div key={p.id} className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-3xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-neutral-400 font-bold">INQUIRY REF: {p.id.toUpperCase()}</span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{p.preferredStyle}</span>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 italic">
                    &ldquo;{p.requestDetails}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-50 text-[10px]">
                    <span className="text-neutral-500">Inquired by <strong>{p.customerName}</strong></span>
                    <button
                      onClick={() => setActiveTab('consultation_request')}
                      className="text-neutral-950 font-bold hover:underline bg-transparent flex items-center gap-0.5"
                    >
                      <span>Claim and formulate plan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {unclaimedConsultations.length > 4 && (
                <button
                  onClick={() => setActiveTab('consultation_request')}
                  className="w-full text-center py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition"
                >
                  View all {unclaimedConsultations.length} inquiries in queue &rarr;
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
