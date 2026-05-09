import { useEffect, useState } from 'react';
import StatsRow from '../components/StatsRow';
import type { DashboardStats } from '../components/StatsRow';
import PowerChart from '../components/PowerChart';
import type { TopSetData, Exercise } from '../components/PowerChart';
import RecentSessionsFeed from '../components/RecentSessionsFeed';
import type { RecentSession } from '../components/RecentSessionsFeed';
import ProgressionTimeline from '../components/ProgressionTimeline';
import { getTopSetsByExercise, getDashboardStats, getRecentSessions, getExerciseList } from '../api/dashboardApi';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | ''>('');
  const [topSets, setTopSets] = useState<TopSetData[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE'>('OVERVIEW');

  useEffect(() => {
    // Fetch stats
    getDashboardStats().then(setStats).catch(console.error);
    
    // Fetch recent sessions
    getRecentSessions(5).then(setRecentSessions).catch(console.error);

    // Fetch exercises for the dropdown
    getExerciseList().then(data => {
      setExercises(data);
      if (data.length > 0) {
        setSelectedExerciseId(data[0].id);
      }
    }).catch(console.error);


  }, []);

  useEffect(() => {
    if (selectedExerciseId) {
      getTopSetsByExercise(selectedExerciseId as number, 30).then(setTopSets).catch(console.error);
    }
  }, [selectedExerciseId]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Power Dashboard
        </h1>
        
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(18, 20, 28, 0.5)', padding: '4px', borderRadius: '8px', backdropFilter: 'blur(8px)' }}>
          <button 
            className={`iron-button ${activeTab === 'OVERVIEW' ? '' : 'secondary'}`}
            style={{ margin: 0, padding: '8px 16px', fontSize: '14px', background: activeTab === 'OVERVIEW' ? 'var(--color-accent-ember)' : 'transparent', color: activeTab === 'OVERVIEW' ? '#000' : '#888', border: 'none' }}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            Overview
          </button>
          <button 
            className={`iron-button ${activeTab === 'TIMELINE' ? '' : 'secondary'}`}
            style={{ margin: 0, padding: '8px 16px', fontSize: '14px', background: activeTab === 'TIMELINE' ? 'var(--color-accent-ember)' : 'transparent', color: activeTab === 'TIMELINE' ? '#000' : '#888', border: 'none' }}
            onClick={() => setActiveTab('TIMELINE')}
          >
            Progression Timeline
          </button>
        </div>
      </div>
      
      {activeTab === 'OVERVIEW' ? (
        <>
          {stats && <StatsRow stats={stats} />}

          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '32px' }}>
            
            <div style={{ flex: '1 1 600px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0', fontSize: '18px' }}>
                Power Chart
              </h3>
              <PowerChart 
                topSets={topSets} 
                exercises={exercises} 
                selectedExerciseId={selectedExerciseId}
                onExerciseChange={setSelectedExerciseId}
              />
            </div>

            <div style={{ flex: '1 1 300px' }}>
              <RecentSessionsFeed sessions={recentSessions} />
            </div>

          </div>
        </>
      ) : (
        <ProgressionTimeline 
          exercises={exercises} 
          selectedExerciseId={selectedExerciseId} 
          onExerciseChange={setSelectedExerciseId} 
        />
      )}
    </div>
  );
}
