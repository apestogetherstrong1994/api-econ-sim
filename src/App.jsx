import { useState, useMemo } from 'react';
import { WORKLOAD_PRESETS, DEFAULT_ROUTING_SPLIT } from './data/workloads';
import {
  calculateAllProviderCosts,
  runSensitivityAnalysis,
  computeScenarioMatrix,
  computeFrontierData,
  generateInsights,
} from './engine/calculations';

import Section00Header from './components/Section00Header';
import Section01Summary from './components/Section01Summary';
import Section02Configurator from './components/Section02Configurator';
import Section03CostChart from './components/Section03CostChart';
import Section04Breakdown from './components/Section04Breakdown';
import Section05Sensitivity from './components/Section05Sensitivity';
import Section06Frontier from './components/Section06Frontier';
import Section07Routing from './components/Section07Routing';
import Section08Insights from './components/Section08Insights';
import Section09Sources from './components/Section09Sources';

function App() {
  // Primary state
  const [activePreset, setActivePreset] = useState(WORKLOAD_PRESETS[0].id);
  const [workload, setWorkload] = useState({ ...WORKLOAD_PRESETS[0] });
  const [chartMode, setChartMode] = useState('grouped');
  const [benchmarkKey, setBenchmarkKey] = useState('composite');
  const [routingSplit, setRoutingSplit] = useState({ ...DEFAULT_ROUTING_SPLIT });

  // Preset selection handler
  const handlePresetChange = (preset) => {
    setActivePreset(preset.id);
    setWorkload({ ...preset });
    if (preset.routingSplit) {
      setRoutingSplit({ ...preset.routingSplit });
    }
  };

  // Custom workload change handler
  const handleWorkloadChange = (newWorkload) => {
    setActivePreset(newWorkload.id || 'custom');
    setWorkload(newWorkload);
  };

  // All derived calculations via useMemo
  const providerCosts = useMemo(
    () => calculateAllProviderCosts(workload),
    [workload]
  );

  const sensitivityData = useMemo(
    () => runSensitivityAnalysis(workload),
    [workload]
  );

  const scenarioMatrix = useMemo(
    () => computeScenarioMatrix(workload),
    [workload]
  );

  const frontierData = useMemo(
    () => computeFrontierData(workload, benchmarkKey),
    [workload, benchmarkKey]
  );

  const insights = useMemo(
    () => generateInsights(providerCosts, workload),
    [providerCosts, workload]
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 font-sans">
      <Section00Header />
      <Section01Summary costs={providerCosts} />
      <Section02Configurator
        activePreset={activePreset}
        workload={workload}
        onPresetChange={handlePresetChange}
        onWorkloadChange={handleWorkloadChange}
      />
      <Section03CostChart
        costs={providerCosts}
        chartMode={chartMode}
        onChartModeChange={setChartMode}
      />
      <Section04Breakdown costs={providerCosts} />
      <Section05Sensitivity
        sensitivityData={sensitivityData}
        scenarioMatrix={scenarioMatrix}
      />
      <Section06Frontier
        frontierData={frontierData}
        benchmarkKey={benchmarkKey}
        onBenchmarkChange={setBenchmarkKey}
      />
      <Section07Routing
        workload={workload}
        routingSplit={routingSplit}
        onRoutingSplitChange={setRoutingSplit}
      />
      <Section08Insights insights={insights} />
      <Section09Sources />
    </div>
  );
}

export default App;
