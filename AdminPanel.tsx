import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Check, X, Users, FileText, Activity } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  role_display: string
  is_active: boolean
  publications_count: number
}

interface DeleteRequest {
  id: number
  publication: number
  publication_title: string
  requester: number
  requester_username: string
  reason: string
  status: string
  status_display: string
  created_at: string
}

interface PublicationForModeration {
  id: number
  title: string
  author: string
  year: number
  department: string
  result: string
  status: 'pending' | 'approved' | 'rejected'
  status_display: string
  owner_username: string
  created_at: string
  rejection_reason?: string
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'logs' | 'moderation'>('moderation')
  const [moderationFilter, setModerationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [users, setUsers] = useState<User[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  const [moderationPublications, setModerationPublications] = useState<PublicationForModeration[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const response = await api.get('/users/users/')
        setUsers(response.data.results || response.data)
      } else if (activeTab === 'requests') {
        const response = await api.get('/delete-requests/')
        setDeleteRequests(response.data.results || response.data)
      } else if (activeTab === 'logs') {
        const response = await api.get('/logs/')
        setLogs(response.data.results || response.data)
      } else if (activeTab === 'moderation') {
        const response = await api.get('/publications/moderation/')
        setModerationPublications(response.data.results || response.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (id: number, role: string) => {
    setUpdating(id)
    try {
      await api.patch(`/users/users/${id}/set_role_/`, { role })
      await loadData()
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setUpdating(null)
    }
  }

  const toggleUserActive = async (id: number, is_active: boolean) => {
    setUpdating(id)
    try {
      await api.patch(`/users/users/${id}/`, { is_active })
      await loadData()
    } catch (error) {
      console.error('Error toggling user:', error)
    } finally {
      setUpdating(null)
    }
  }

  const reviewDeleteRequest = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await api.patch(`/delete-requests/${id}/`, { status })
      await loadData()
    } catch (error) {
      console.error('Error reviewing request:', error)
    } finally {
      setUpdating(null)
    }
  }

  const approvePublication = async (id: number) => {
    setUpdating(id)
    try {
      await api.patch(`/publications/${id}/moderate/`, { status: 'approved' })
      await loadData()
    } catch (error) {
      console.error('Error approving publication:', error)
    } finally {
      setUpdating(null)
    }
  }

  const rejectPublication = async (id: number) => {
    if (!rejectionReason.trim()) {
      alert('Укажите причину отклонения')
      return
    }
    setUpdating(id)
    try {
      await api.patch(`/publications/${id}/moderate/`, { 
        status: 'rejected', 
        rejection_reason: rejectionReason 
      })
      setRejectionReason('')
      setRejectingId(null)
      await loadData()
    } catch (error) {
      console.error('Error rejecting publication:', error)
    } finally {
      setUpdating(null)
    }
  }

  const pendingCount = deleteRequests.filter(r => r.status === 'pending').length

  const filteredModerationPublications = moderationPublications.filter(pub => 
    moderationFilter === 'all' ? true : pub.status === moderationFilter
  )

  const getModerationCounts = () => ({
    all: moderationPublications.length,
    pending: moderationPublications.filter(p => p.status === 'pending').length,
    approved: moderationPublications.filter(p => p.status === 'approved').length,
    rejected: moderationPublications.filter(p => p.status === 'rejected').length,
  })

  return (
    <div className="admin-panel">
      <h1>Админ-панель</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          Пользователи
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FileText size={18} />
          Запросы на удаление
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderation')}
        >
          <Check size={18} />
          Модерация записей
          {moderationPublications.filter(p => p.status === 'pending').length > 0 && (
            <span className="badge">{moderationPublications.filter(p => p.status === 'pending').length}</span>
          )}
        </button>
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={18} />
          Журнал активности
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>Пользователи системы</h2>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Логин</th>
                    <th>ФИО</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Записей</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select 
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={updating === user.id}
                        >
                          <option value="ADMIN">Администратор</option>
                          <option value="METHODIST">Методист</option>
                        </select>
                      </td>
                      <td>{user.publications_count}</td>
                      <td>
                        <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Активен' : 'Деактивирован'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-toggle"
                          onClick={() => toggleUserActive(user.id, !user.is_active)}
                          disabled={updating === user.id}
                        >
                          {user.is_active ? 'Деактивировать' : 'Активировать'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="tab-content">
          <h2>Запросы на удаление</h2>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="requests-list">
              {deleteRequests.map(req => (
                <div key={req.id} className={`request-card ${req.status}`}>
                  <div className="request-header">
                    <span className={`status-badge ${req.status}`}>{req.status_display}</span>
                    <span className="date">{new Date(req.created_at).toLocaleString()}</span>
                  </div>
                  <h3>{req.publication_title}</h3>
                  <p className="requester">Заявитель: {req.requester_username}</p>
                  <p className="reason"><strong>Причина:</strong> {req.reason}</p>
                  
                  {req.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => reviewDeleteRequest(req.id, 'approved')}
                        disabled={updating === req.id}
                      >
                        <Check size={16} />
                        Одобрить
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => reviewDeleteRequest(req.id, 'rejected')}
                        disabled={updating === req.id}
                      >
                        <X size={16} />
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {deleteRequests.length === 0 && (
                <p className="empty">Нет запросов на удаление</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="tab-content">
          <h2>Модерация записей методистов</h2>
          
          {/* Вкладки фильтрации по статусу */}
          <div className="status-tabs">
            <button 
              className={`status-tab ${moderationFilter === 'all' ? 'active' : ''}`}
              onClick={() => setModerationFilter('all')}
            >
              Все ({getModerationCounts().all})
            </button>
            <button 
              className={`status-tab pending ${moderationFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setModerationFilter('pending')}
            >
              На модерации ({getModerationCounts().pending})
            </button>
            <button 
              className={`status-tab approved ${moderationFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setModerationFilter('approved')}
            >
              Одобрено ({getModerationCounts().approved})
            </button>
            <button 
              className={`status-tab rejected ${moderationFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setModerationFilter('rejected')}
            >
              Отклонено ({getModerationCounts().rejected})
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="moderation-list">
              {filteredModerationPublications.map(pub => (
                <div key={pub.id} className={`moderation-card ${pub.status}`}>
                  <div className="moderation-header">
                    <span className={`status-badge ${pub.status}`}>{pub.status_display}</span>
                    <span className="date">{new Date(pub.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3>{pub.title}</h3>
                  <p className="author">Автор: {pub.author}</p>
                  <div className="moderation-meta">
                    <span>Год: {pub.year}</span>
                    <span>Кафедра: {pub.department}</span>
                    <span>Методист: {pub.owner_username}</span>
                  </div>
                  
                  {pub.status === 'pending' && (
                    <div className="moderation-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => approvePublication(pub.id)}
                        disabled={updating === pub.id}
                      >
                        <Check size={16} />
                        Одобрить
                      </button>
                      {rejectingId === pub.id ? (
                        <div className="reject-form">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Причина отклонения"
                            autoFocus
                          />
                          <button 
                            className="btn-confirm"
                            onClick={() => rejectPublication(pub.id)}
                            disabled={updating === pub.id}
                          >
                            Подтвердить
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                          >
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn-reject"
                          onClick={() => setRejectingId(pub.id)}
                          disabled={updating === pub.id}
                        >
                          <X size={16} />
                          Отклонить
                        </button>
                      )}
                    </div>
                  )}
                  
                  {pub.status === 'rejected' && pub.rejection_reason && (
                    <div className="rejection-info">
                      <strong>Причина отклонения:</strong> {pub.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
              {moderationPublications.length === 0 && (
                <p className="empty">Нет записей на модерации</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="tab-content">
          <h2>Журнал активности</h2>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <div className="logs-table">
              {logs.map(log => (
                <div key={log.id} className="log-row">
                  <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="log-action">{log.action_display}</span>
                  <span className="log-user">{log.user_username || 'Система'}</span>
                  <span className="log-details">{log.publication_title || '-'}</span>
                  <span className="log-ip">{log.ip_address || '-'}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="empty">Нет записей в журнале</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel