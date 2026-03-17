import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('applied')
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const name = localStorage.getItem('name')
  const token = localStorage.getItem('token')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs', { headers })
      setJobs(res.data)
    } catch { logout() }
  }

  const addJob = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/jobs', { company, position, status, notes }, { headers })
      setCompany(''); setPosition(''); setNotes(''); setStatus('applied'); setShowForm(false)
      fetchJobs()
    } catch (err) { alert('Failed to add job') }
  }

  const updateStatus = async (id, newStatus) => {
    const job = jobs.find(j => j.id === id)
    try {
      await axios.put(`https://job-tracker-api-bla7.onrender.com/${id}`, { ...job, status: newStatus }, { headers })
      fetchJobs()
    } catch { alert('Failed to update') }
  }

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return
    try {
      await axios.delete(`https://job-tracker-api-bla7.onrender.com/${id}`, { headers })
      fetchJobs()
    } catch { alert('Failed to delete') }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const statusColor = { applied: '#185FA5', interview: '#854F0B', offer: '#3B6D11', rejected: '#A32D2D' }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Job Tracker</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Hi, {name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.statsRow}>
          {['applied','interview','offer','rejected'].map(s => (
            <div key={s} style={styles.statCard}>
              <div style={{...styles.statNum, color: statusColor[s]}}>{jobs.filter(j => j.status === s).length}</div>
              <div style={styles.statLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</div>
            </div>
          ))}
        </div>

        <div style={styles.topBar}>
          <h2 style={styles.sectionTitle}>Applications ({jobs.length})</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Add Job'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={addJob} style={styles.form}>
            <input style={styles.input} placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required />
            <input style={styles.input} placeholder="Position" value={position} onChange={e => setPosition(e.target.value)} required />
            <select style={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <input style={styles.input} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
            <button type="submit" style={styles.submitBtn}>Save Job</button>
          </form>
        )}

        {jobs.length === 0 ? (
          <div style={styles.empty}>No applications yet. Add your first one!</div>
        ) : (
          jobs.map(job => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobLeft}>
                <div style={styles.jobCompany}>{job.company}</div>
                <div style={styles.jobPosition}>{job.position}</div>
                {job.notes ? <div style={styles.jobNotes}>{job.notes}</div> : null}
              </div>
              <div style={styles.jobRight}>
                <select
                  value={job.status}
                  onChange={e => updateStatus(job.id, e.target.value)}
                  style={{...styles.statusBadge, color: statusColor[job.status], borderColor: statusColor[job.status]}}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => deleteJob(job.id)} style={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' },
  header: { background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  logo: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#185FA5' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  welcome: { fontSize: '14px', color: '#666' },
  logoutBtn: { padding: '0.4rem 1rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  content: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: 'white', padding: '1rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statNum: { fontSize: '28px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#666', marginTop: '4px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: '600' },
  addBtn: { padding: '0.5rem 1.2rem', background: '#185FA5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  form: { background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '0.6rem', marginBottom: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  submitBtn: { padding: '0.6rem 1.5rem', background: '#185FA5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  empty: { textAlign: 'center', padding: '3rem', color: '#999', background: 'white', borderRadius: '10px' },
  jobCard: { background: 'white', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  jobLeft: { flex: 1 },
  jobCompany: { fontWeight: '600', fontSize: '15px', color: '#1a1a2e' },
  jobPosition: { fontSize: '13px', color: '#555', marginTop: '2px' },
  jobNotes: { fontSize: '12px', color: '#999', marginTop: '4px' },
  jobRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  statusBadge: { padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: 'transparent', cursor: 'pointer' },
  deleteBtn: { padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#999' }
}

export default Dashboard