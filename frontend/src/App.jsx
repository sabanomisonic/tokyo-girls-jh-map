import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSyncAlt, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import Map from './components/Map';
import './App.css';

// Use the current hostname (e.g., localhost or 192.168.x.x) to connect to the backend
const API_URL = import.meta.env.PROD ? '/api' : `http://${window.location.hostname}:3001/api`;

function App() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateLogs, setUpdateLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [error, setError] = useState(null);

  // Selection state for map flying
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Mobile tab state
  const [activeTab, setActiveTab] = useState('list');

  // Filters
  const [minDeviation, setMinDeviation] = useState(40);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/schools`);
      setSchools(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setError('データの読み込みに失敗しました。サーバーが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setShowLogs(true);
      setUpdateLogs(['情報収集スクリプトを実行中...']);

      const res = await axios.post(`${API_URL}/update`);

      if (res.data.success) {
        setSchools(res.data.data);
        setUpdateLogs((prev) => [...prev, ...res.data.logs, '✅ 更新完了']);
      }
    } catch (err) {
      console.error('Failed to update data:', err);
      setUpdateLogs((prev) => [...prev, '❌ 更新中にエラーが発生しました']);
    } finally {
      setUpdating(false);
      // Hide logs after 5 seconds if completion was successful
      setTimeout(() => setShowLogs(false), 5000);
    }
  };

  const handleSchoolClick = (school) => {
    setSelectedSchool(school);
    setActiveTab('map');
  };

  const filteredSchools = schools.filter(s => s.sapixDeviation >= minDeviation);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">
          <FaMapMarkerAlt className="logo-icon" />
          <h1>東京女子中学校マップ</h1>
        </div>
        <div className="header-actions">
          <button
            className={`btn-update ${updating ? 'updating' : ''}`}
            onClick={handleUpdate}
            disabled={updating}
          >
            <FaSyncAlt className={updating ? 'spin' : ''} />
            {updating ? '最新情報を取得中...' : '最新情報を取得'}
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <FaMapMarkerAlt /> マップ
        </button>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FaFilter /> 対象校一覧
        </button>
      </div>

      <main className="app-main">
        {error && <div className="error-banner">{error}</div>}

        <div className={`content-layout ${activeTab === 'list' ? 'show-list' : 'show-map'}`}>
          <aside className="sidebar">
            <div className="sidebar-card filter-card">
              <h3><FaFilter /> フィルター</h3>
              <div className="filter-group">
                <label>
                  SAPIX偏差値: {minDeviation} 以上
                </label>
                <input
                  type="range"
                  min="40"
                  max="70"
                  value={minDeviation}
                  onChange={(e) => setMinDeviation(Number(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            <div className="sidebar-card list-card">
              <h3>対象校一覧 ({filteredSchools.length}校)</h3>
              <ul className="school-list">
                {filteredSchools.map(school => (
                  <li
                    key={school.id}
                    className={`school-list-item ${selectedSchool?.id === school.id ? 'selected' : ''}`}
                    onClick={() => handleSchoolClick(school)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="school-name">{school.name}</span>
                    <span className="school-badge">{school.sapixDeviation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {showLogs && (
              <div className="sidebar-card logs-card">
                <h3>更新ログ</h3>
                <div className="logs-container">
                  {updateLogs.map((log, i) => (
                    <div key={i} className="log-item">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="map-area">
            {loading ? (
              <div className="loading-spinner">マップを読み込み中...</div>
            ) : (
              <Map
                schools={filteredSchools}
                selectedSchool={selectedSchool}
                onMarkerClick={handleSchoolClick}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
