"use client";
import { useState, useEffect } from "react";
import { useAppState, Block } from "@/lib/store";
import { 
  Wifi, WifiOff, RefreshCw, MapIcon, Clock, 
  Camera, CheckCircle, Navigation, ChevronLeft, AlertCircle
} from "lucide-react";
import { GovernmentButton } from "@/components/design-system";
import Link from "next/link";

type ConnectionState = "ONLINE" | "OFFLINE" | "SYNCING";

export default function FieldModePage() {
  const { state } = useAppState();
  
  // Local state for Field Mode
  const [connection, setConnection] = useState<ConnectionState>("ONLINE");
  const [pendingSync, setPendingSync] = useState(0);
  const [lastSync, setLastSync] = useState("08:42");
  const [activeTab, setActiveTab] = useState<"BLOCKS" | "TASK">("BLOCKS");
  const [taskStatus, setTaskStatus] = useState("Not Started");
  const [note, setNote] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);

  // Use the latest 7-day blocks as requested "Cache the latest 7-day approved block plan"
  const todayBlocks = state.blocks.filter(b => b.status === "APPROVED" || b.status === "ACTIVE").slice(0, 3);
  const assignedBlock = todayBlocks.length > 0 ? todayBlocks[0] : null;

  // Sync logic
  const handleSync = () => {
    if (connection === "OFFLINE") return;
    setConnection("SYNCING");
    setTimeout(() => {
      setConnection("ONLINE");
      setPendingSync(0);
      const now = new Date();
      setLastSync(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
      alert("Sync Complete. Updates sent to Control Tower.");
    }, 1500);
  };

  const queueUpdate = () => {
    if (connection === "OFFLINE") {
      setPendingSync(p => p + 1);
      alert("Saved locally. Will sync when online.");
    } else {
      handleSync();
    }
  };

  const handleUpdateStatus = () => {
    setTaskStatus(taskStatus === "Not Started" ? "In Progress" : taskStatus === "In Progress" ? "Completed" : "Not Started");
    queueUpdate();
  };

  const handleAddNote = () => {
    const res = prompt("Enter defect note:");
    if (res) {
      setNote(res);
      queueUpdate();
    }
  };

  const handleCapturePhoto = () => {
    alert("Camera API accessed. Photo captured and stored locally.");
    setPhotoTaken(true);
    queueUpdate();
  };

  const toggleConnection = () => {
    setConnection(c => c === "ONLINE" ? "OFFLINE" : "ONLINE");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center text-slate-800">
      {/* Mobile Device Container Simulation */}
      <div className="w-full max-w-[400px] bg-slate-50 min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Header App Bar */}
        <div className="bg-red-800 text-white p-3 flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-red-100 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="font-bold tracking-widest text-sm">FIELD MODE</div>
          </div>
          <button onClick={toggleConnection} className="flex items-center gap-1 bg-red-900 px-2 py-1 rounded text-[10px] font-bold">
            {connection === "ONLINE" ? <Wifi className="h-3 w-3 text-emerald-400" /> : 
             connection === "SYNCING" ? <RefreshCw className="h-3 w-3 animate-spin text-blue-400" /> : 
             <WifiOff className="h-3 w-3 text-slate-400" />}
            {connection}
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className={`p-2 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center ${
          connection === "OFFLINE" ? "bg-slate-800 text-slate-300" : 
          connection === "SYNCING" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
        }`}>
          <div>
            <div>Last Sync: {lastSync}</div>
            {pendingSync > 0 && <div className="text-amber-500 mt-0.5">Pending Updates: {pendingSync}</div>}
          </div>
          {pendingSync > 0 && connection === "ONLINE" && (
            <button onClick={handleSync} className="bg-emerald-600 text-white px-2 py-1 rounded flex items-center gap-1 shadow-sm hover:bg-emerald-700">
              <RefreshCw className="h-3 w-3" /> SYNC NOW
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 bg-white border-b border-slate-200 text-xs font-bold uppercase tracking-widest">
          <button 
            className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === "BLOCKS" ? "border-red-800 text-red-800" : "border-transparent text-slate-500"}`}
            onClick={() => setActiveTab("BLOCKS")}
          >
            Today's Blocks
          </button>
          <button 
            className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === "TASK" ? "border-red-800 text-red-800" : "border-transparent text-slate-500"}`}
            onClick={() => setActiveTab("TASK")}
          >
            Assigned Task
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
          
          {activeTab === "BLOCKS" && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Locally Cached (7 Days)</div>
              {todayBlocks.length === 0 ? (
                <div className="text-center p-8 text-slate-500 text-sm">No blocks approved for today.</div>
              ) : (
                todayBlocks.map(block => (
                  <div key={block.id} className="bg-white p-3 rounded-sm border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                      <div className="font-bold text-slate-800 text-sm">{block.id}</div>
                      <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${block.status === 'ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {block.status}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-600"><MapIcon className="h-3 w-3" /> {block.corridor}</div>
                      <div className="flex items-center gap-1 text-slate-600"><Clock className="h-3 w-3" /> {block.startTime}–{block.endTime}</div>
                      <div className="col-span-2 text-slate-500 font-semibold mt-1">Tasks: {block.tasks.length} Assigned</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "TASK" && assignedBlock && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Assignment</div>
                <h2 className="text-lg font-black text-slate-900">Engineering Track Renewal</h2>
                <div className="text-xs text-slate-600 mt-1 mb-4 flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-red-700" /> KM Post 142.5 - {assignedBlock.corridor}
                </div>
                
                <div className="bg-slate-50 p-3 rounded border border-slate-100 mb-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Status</div>
                  <div className="flex justify-between items-center">
                    <div className={`font-bold text-sm ${taskStatus === 'Completed' ? 'text-emerald-600' : taskStatus === 'In Progress' ? 'text-amber-600' : 'text-slate-600'}`}>
                      {taskStatus}
                    </div>
                    <GovernmentButton size="sm" variant="outline" onClick={handleUpdateStatus}>
                      UPDATE
                    </GovernmentButton>
                  </div>
                </div>

                <div className="space-y-2">
                  <GovernmentButton size="sm" variant="outline" className="w-full justify-start text-slate-700" onClick={handleAddNote}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {note ? "EDIT DEFECT NOTE" : "ADD DEFECT NOTE"}
                  </GovernmentButton>
                  {note && <div className="text-xs italic text-slate-600 bg-amber-50 p-2 rounded border border-amber-100">"{note}"</div>}
                  
                  <GovernmentButton size="sm" variant="outline" className="w-full justify-start text-slate-700" onClick={handleCapturePhoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    {photoTaken ? "RETAKE PHOTO" : "CAPTURE PHOTO"}
                  </GovernmentButton>
                  {photoTaken && (
                    <div className="flex items-center text-xs font-bold text-emerald-600 mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" /> Photo attached locally
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "TASK" && !assignedBlock && (
            <div className="text-center p-8 text-slate-500 text-sm">No tasks assigned for today.</div>
          )}

        </div>

      </div>
    </div>
  );
}
