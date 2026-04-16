import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Plus, Edit, Trash2, Save } from 'lucide-react'

interface Publication {
  id: number
  title: string
  author: string
  year: number
  department: string
  result: string
  status: 'pending' | 'approved' | 'rejected'
  status_display: string
  created_at: string
  circulation: string
  head: string
  executors: string
  location: string
  event_name: string
  funding_source: string
  volume: string
  note: string
  students_names: string
  students_count: number
  pages_count: number
  entry_month: number
  event_date: string | null
  rejection_reason?: string
}

const DEPARTMENTS = [
  { value: 'КТОиТК', label: 'Кафедра таможенных операций и таможенного контроля' },
  { value: 'КТиТЭ', label: 'Кафедра товароведения и таможенной экспертизы' },
  { value: 'КУиЭТД', label: 'Кафедра управления и экономики таможенного дела' },
  { value: 'КЭТиМЭО', label: 'Кафедра экономической теории и международных экономических отношений' },
  { value: 'КГПД', label: 'Кафедра государственно-правовых дисциплин' },
  { value: 'КГрПД', label: 'Кафедра гражданско-правовых дисциплин' },
  { value: 'КУПД', label: 'Кафедра уголовно-правовых дисциплин' },
  { value: 'КГД', label: 'Кафедра гуманитарных дисциплин' },
  { value: 'КИЯ', label: 'Кафедра иностранных языков' },
  { value: 'КИиИТТ', label: 'Кафедра информатики и информационных таможенных технологий' },
  { value: 'КФП', label: 'Кафедра физической подготовки' },
]

const RESULTS = ['', 'участник', 'призёр', 'победитель']

const MONTHS = [
  { value: 1, label: 'Январь' },
  { value: 2, label: 'Февраль' },
  { value: 3, label: 'Март' },
  { value: 4, label: 'Апрель' },
  { value: 5, label: 'Май' },
  { value: 6, label: 'Июнь' },
  { value: 7, label: 'Июль' },
  { value: 8, label: 'Август' },
  { value: 9, label: 'Сентябрь' },
  { value: 10, label: 'Октябрь' },
  { value: 11, label: 'Ноябрь' },
  { value: 12, label: 'Декабрь' },
]

interface PublicationForm {
  title: string
  author: string
  year: number
  department: string
  result: string
  circulation: string
  head: string
  executors: string
  location: string
  event_name: string
  funding_source: string
  volume: string
  note: string
  students_names: string
  students_count: number
  pages_count: number
  entry_month: number
  event_date: string
}

const defaultValues: PublicationForm = {
  title: '',
  author: '',
  year: new Date().getFullYear(),
  department: '',
  result: '',
  circulation: '',
  head: '',
  executors: '',
  location: '',
  event_name: '',
  funding_source: '',
  volume: '',
  note: '',
  students_names: '',
  students_count: 0,
  pages_count: 0,
  entry_month: new Date().getMonth() + 1,
  event_date: '',
}

const MethodistCabinet: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PublicationForm>(defaultValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadPublications()
  }, [])

  const loadPublications = async () => {
    try {
      const response = await api.get('/publications/my_publications/')
      setPublications(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading publications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Обязательное поле'
    if (!formData.author.trim()) newErrors.author = 'Обязательное поле'
    if (!formData.department) newErrors.department = 'Обязательное поле'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setSaving(true)
    try {
      const submitData = {
        ...formData,
        event_date: formData.event_date || null,
        status: 'pending', // Отправляем на модерацию
      }
      
      if (editingId) {
        // При редактировании запись снова уходит на модерацию
        await api.patch(`/publications/${editingId}/`, submitData)
      } else {
        // Новая запись создаётся со статусом pending
        await api.post('/publications/', submitData)
      }
      
      await loadPublications()
      setShowForm(false)
      setEditingId(null)
      setFormData(defaultValues)
      setErrors({})
    } catch (error: any) {
      console.error('Error saving publication:', error)
      alert(error.response?.data?.message || 'Ошибка при сохранении записи')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (pub: Publication) => {
    setEditingId(pub.id)
    setShowForm(true)
    setFormData({
      title: pub.title,
      author: pub.author,
      year: pub.year,
      department: pub.department,
      result: pub.result,
      circulation: pub.circulation || '',
      head: pub.head || '',
      executors: pub.executors || '',
      location: pub.location || '',
      event_name: pub.event_name || '',
      funding_source: pub.funding_source || '',
      volume: pub.volume || '',
      note: pub.note || '',
      students_names: pub.students_names || '',
      students_count: pub.students_count || 0,
      pages_count: pub.pages_count || 0,
      entry_month: pub.entry_month || new Date().getMonth() + 1,
      event_date: pub.event_date || '',
    })
    setErrors({})
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return
    
    try {
      await api.delete(`/publications/${id}/`)
      await loadPublications()
    } catch (error) {
      console.error('Error deleting publication:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(defaultValues)
    setErrors({})
  }

  const handleInputChange = (field: keyof PublicationForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const filteredPublications = publications.filter(pub => 
    statusFilter === 'all' ? true : pub.status === statusFilter
  )

  const getStatusCounts = () => ({
    all: publications.length,
    pending: publications.filter(p => p.status === 'pending').length,
    approved: publications.filter(p => p.status === 'approved').length,
    rejected: publications.filter(p => p.status === 'rejected').length,
  })

  return (
    <div className="cabinet">
      <div className="cabinet-header">
        <h1>Кабинет методиста</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? 'Отмена' : 'Добавить запись'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Редактирование записи' : 'Новая запись'}</h2>
          <form onSubmit={handleSubmit} className="publication-form">
            <div className="form-section">
              <h3>Основная информация</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Название публикации/мероприятия *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'error' : ''}
                  />
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Автор(ы) *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className={errors.author ? 'error' : ''}
                  />
                  {errors.author && <span className="error-text">{errors.author}</span>}
                </div>
              </div>

              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Год *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div className="form-group">
                  <label>Кафедра *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={errors.department ? 'error' : ''}
                  >
                    <option value="">Выберите кафедру</option>
                    {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>
                <div className="form-group">
                  <label>Результат</label>
                  <select value={formData.result} onChange={(e) => handleInputChange('result', e.target.value)}>
                    {RESULTS.map(r => <option key={r} value={r}>{r || 'Не указан'}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Месяц внесения</label>
                  <select value={formData.entry_month} onChange={(e) => handleInputChange('entry_month', parseInt(e.target.value))}>
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Дата проведения</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleInputChange('event_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Дополнительная информация</h3>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Руководитель</label>
                  <input type="text" value={formData.head} onChange={(e) => handleInputChange('head', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Исполнители</label>
                  <input type="text" value={formData.executors} onChange={(e) => handleInputChange('executors', e.target.value)} />
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Место проведения</label>
                  <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Название мероприятия</label>
                  <input type="text" value={formData.event_name} onChange={(e) => handleInputChange('event_name', e.target.value)} />
                </div>
              </div>

              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Тираж</label>
                  <input type="text" value={formData.circulation} onChange={(e) => handleInputChange('circulation', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Объём</label>
                  <input type="text" value={formData.volume} onChange={(e) => handleInputChange('volume', e.target.value)} placeholder="напр. 5 п.л." />
                </div>
                <div className="form-group">
                  <label>Источник финансирования</label>
                  <input type="text" value={formData.funding_source} onChange={(e) => handleInputChange('funding_source', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Студенты</h3>
              <div className="form-row three-cols">
                <div className="form-group">
                  <label>Количество студентов</label>
                  <input
                    type="number"
                    value={formData.students_count}
                    onChange={(e) => handleInputChange('students_count', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label>Количество страниц</label>
                  <input
                    type="number"
                    value={formData.pages_count}
                    onChange={(e) => handleInputChange('pages_count', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>ФИО студентов</label>
                  <textarea
                    value={formData.students_names}
                    onChange={(e) => handleInputChange('students_names', e.target.value)}
                    rows={2}
                    placeholder="Укажите ФИО студентов, принимавших участие"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Примечания</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Примечание</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Отмена
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                <Save size={18} />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="publications-list">
        <h2>Мои записи ({filteredPublications.length})</h2>
        
        {/* Вкладки фильтрации по статусу */}
        <div className="status-tabs">
          <button 
            className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Все ({getStatusCounts().all})
          </button>
          <button 
            className={`status-tab pending ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            На модерации ({getStatusCounts().pending})
          </button>
          <button 
            className={`status-tab approved ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Одобрено ({getStatusCounts().approved})
          </button>
          <button 
            className={`status-tab rejected ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Отклонено ({getStatusCounts().rejected})
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div className="cards-grid">
            {filteredPublications.map(pub => (
              <div key={pub.id} className={`pub-card ${pub.status}`}>
                <div className="pub-header">
                  <span className={`status-badge ${pub.status}`}>{pub.status_display}</span>
                  <div className="pub-actions">
                    {/* Кнопки редактирования и удаления доступны только для pending и rejected записей */}
                    {(pub.status === 'pending' || pub.status === 'rejected') && (
                      <>
                        <button onClick={() => handleEdit(pub)} title="Редактировать">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(pub.id)} title="Удалить" className="delete">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {pub.status === 'rejected' && pub.rejection_reason && (
                      <span className="rejection-reason" title={pub.rejection_reason}>
                        ⚠️ Отклонено
                      </span>
                    )}
                  </div>
                </div>
                <h3>{pub.title}</h3>
                <p className="author">{pub.author}</p>
                <div className="pub-meta">
                  <span>{pub.year}</span>
                  <span>{pub.department}</span>
                  {pub.result && <span className="result">{pub.result}</span>}
                </div>
                <p className="date">Создано: {new Date(pub.created_at).toLocaleDateString()}</p>
                
                {/* Отображение причины отклонения */}
                {pub.status === 'rejected' && pub.rejection_reason && (
                  <div className="rejection-info">
                    <strong>Причина отклонения:</strong> {pub.rejection_reason}
                  </div>
                )}
              </div>
            ))}
            {publications.length === 0 && (
              <p className="empty-message">У вас пока нет записей</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MethodistCabinet