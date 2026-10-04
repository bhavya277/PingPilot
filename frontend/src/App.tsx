import React, { useState, useEffect, useCallback } from "react";
import type {
  DiagnosticResult,
  DiagnosticHistorySummary,
  SystemInfo,
  ProgressStep
} from "./types/diagnostics";
import {
  fetchSystemInfo,
  fetchHistory,
  streamDiagnosticSession,
  rerunAiAnalysis
} from "./api/client";

import { Sidebar, type NavTab } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { DiagnoseWorkspace } from "./components/DiagnoseWorkspace";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";
import { LocalAiModal } from "./components/LocalAiModal";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [history, setHistory] = useState<DiagnosticHistorySummary[]>([]);

  // Diagnostic form state
  const [selectedGame, setSelectedGame] = useState<string>("Valorant");
  const [customHost, setCustomHost] = useState<string>("");
  const [runSpeedTest, setRunSpeedTest] = useState<boolean>(true);
  const [runTraceroute, setRunTraceroute] = useState<boolean>(true);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<ProgressStep | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAiRerunning, setIsAiRerunning] = useState<boolean>(false);

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoScenario, setDemoScenario] = useState<string>("wifi_jitter");

  // Modals & UI state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Load system info and recent history on mount
  const refreshSystem = useCallback(() => {
    fetchSystemInfo()
      .then((info) => setSystemInfo(info))
      .catch((err) => console.warn("Backend unreachable or offline:", err));
  }, []);

  const refreshHistory = useCallback(() => {
    fetchHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.warn("History unreachable:", err));
  }, []);

  useEffect(() => {
    refreshSystem();
    refreshHistory();
  }, [refreshSystem, refreshHistory]);

  const handleRunDiagnosis = () => {
    setIsRunning(true);
    setErrorMsg(null);
    setActiveTab("diagnose");
    setCurrentStep({
      step: "detecting_interface",
      message: "Starting diagnostic sequence...",
      percent: 5
    });

    streamDiagnosticSession(
      {
        game: selectedGame,
        custom_host: selectedGame === "Other / Custom" ? customHost : undefined,
        run_speed_test: runSpeedTest,
        run_traceroute: runTraceroute,
        is_demo: isDemoMode,
        demo_scenario: demoScenario
      },
      (step) => {
        setCurrentStep(step);
      },
      (finalResult) => {
        setResult(finalResult);
        setIsRunning(false);
        setCurrentStep(null);
        refreshHistory();
      },
      (error) => {
        setErrorMsg(error);
        setIsRunning(false);
        setCurrentStep(null);
      }
    );
  };

  const handleRerunAi = async () => {
    if (!result) return;
    setIsAiRerunning(true);
    try {
      const newAi = await rerunAiAnalysis(result);
      setResult({
        ...result,
        ai_analysis: newAi
      });
    } catch (err) {
      console.error("AI rerun failed:", err);
    } finally {
      setIsAiRerunning(false);
    }
  };

  const handleInspectSession = (selectedResult: DiagnosticResult) => {
    setResult(selectedResult);
    setActiveTab("diagnose");
  };

  return (
    <div className="flex h-screen bg-[#0B0D10] text-[#F3F4F6] font-sans antialiased overflow-hidden selection:bg-slate-700 selection:text-white">
      {/* 1. Left Narrow Sidebar (Desktop) */}
      <div className="hidden md:flex h-full">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          systemInfo={systemInfo}
          isDemoMode={isDemoMode}
          onToggleDemo={() => setIsDemoMode(!isDemoMode)}
          onOpenAiModal={() => setIsAiModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-[#111418] border-r border-[rgba(255,255,255,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              systemInfo={systemInfo}
              isDemoMode={isDemoMode}
              onToggleDemo={() => setIsDemoMode(!isDemoMode)}
              onOpenAiModal={() => {
                setIsMobileMenuOpen(false);
                setIsAiModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav
          activeTab={activeTab}
          systemInfo={systemInfo}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenSettings={() => setActiveTab("settings")}
          onQuickDiagnose={handleRunDiagnosis}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" && (
            <OverviewDashboard
              latestResult={result}
              history={history}
              onNavigateToDiagnose={() => setActiveTab("diagnose")}
              onInspectResult={handleInspectSession}
            />
          )}

          {activeTab === "diagnose" && (
            <DiagnoseWorkspace
              selectedGame={selectedGame}
              onSelectGame={setSelectedGame}
              customHost={customHost}
              onChangeCustomHost={setCustomHost}
              runSpeedTest={runSpeedTest}
              onChangeRunSpeedTest={setRunSpeedTest}
              runTraceroute={runTraceroute}
              onChangeRunTraceroute={setRunTraceroute}
              isRunning={isRunning}
              currentStep={currentStep}
              result={result}
              errorMsg={errorMsg}
              isDemoMode={isDemoMode}
              demoScenario={demoScenario}
              onChangeDemoScenario={setDemoScenario}
              onRunDiagnosis={handleRunDiagnosis}
              onRerunAi={handleRerunAi}
              isAiRerunning={isAiRerunning}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              onInspectSession={handleInspectSession}
              onNavigateToDiagnose={() => setActiveTab("diagnose")}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              systemInfo={systemInfo}
              onRefreshSystemInfo={refreshSystem}
            />
          )}
        </main>
      </div>

      {/* Local AI Details Modal */}
      <LocalAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        systemInfo={systemInfo}
      />
    </div>
  );
};

export default App;
