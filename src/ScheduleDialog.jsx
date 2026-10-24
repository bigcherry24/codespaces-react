import { useEffect, useState } from 'react';

const colorOptions = [
  { name: '바다', value: '#167d82' },
  { name: '산호', value: '#d45d4c' },
  { name: '겨자', value: '#c18a18' },
  { name: '잎사귀', value: '#558257' },
  { name: '하늘', value: '#5575a8' },
];

function createInitialForm(schedule, initialDate) {
  if (schedule) {
    return { ...schedule };
  }

  return {
    title: '',
    date: initialDate,
    allDay: false,
    startTime: '09:00',
    endTime: '10:00',
    memo: '',
    color: colorOptions[0].value,
  };
}

function ScheduleDialog({ initialDate, schedule, onClose, onSave }) {
  const [form, setForm] = useState(() => createInitialForm(schedule, initialDate));
  const [error, setError] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    const title = form.title.trim();

    if (!title) {
      setError('일정 제목을 입력해 주세요.');
      return;
    }

    if (!form.date) {
      setError('날짜를 선택해 주세요.');
      return;
    }

    if (!form.allDay && form.endTime <= form.startTime) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    onSave({
      ...form,
      title,
      startTime: form.allDay ? '' : form.startTime,
      endTime: form.allDay ? '' : form.endTime,
      memo: form.memo.trim(),
    });
  }

  return (
    <div
      className="dialog-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="schedule-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header className="dialog-header">
          <div>
            <p className="eyebrow">SCHEDULE DETAILS</p>
            <h2 id="dialog-title">{schedule ? '일정 수정' : '새 일정'}</h2>
          </div>
          <button className="icon-button close-button" type="button" aria-label="닫기" onClick={onClose}>×</button>
        </header>

        <form onSubmit={submitForm}>
          <label className="form-field">
            <span>일정 제목</span>
            <input
              autoFocus
              maxLength={80}
              name="title"
              onChange={updateField}
              placeholder="예: 팀 주간 회의"
              value={form.title}
            />
          </label>

          <label className="form-field">
            <span>날짜</span>
            <input name="date" onChange={updateField} type="date" value={form.date} />
          </label>

          <label className="all-day-field">
            <input checked={form.allDay} name="allDay" onChange={updateField} type="checkbox" />
            <span>하루 종일</span>
          </label>

          {!form.allDay && (
            <div className="time-fields">
              <label className="form-field">
                <span>시작</span>
                <input name="startTime" onChange={updateField} type="time" value={form.startTime} />
              </label>
              <label className="form-field">
                <span>종료</span>
                <input name="endTime" onChange={updateField} type="time" value={form.endTime} />
              </label>
            </div>
          )}

          <label className="form-field">
            <span>메모 <small>선택</small></span>
            <textarea maxLength={500} name="memo" onChange={updateField} placeholder="일정에 대한 메모" rows="3" value={form.memo} />
          </label>

          <fieldset className="color-field">
            <legend>일정 색상</legend>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  aria-label={`${color.name} 색상`}
                  aria-pressed={form.color === color.value}
                  className={`color-swatch ${form.color === color.value ? 'is-active' : ''}`}
                  key={color.value}
                  onClick={() => setForm((currentForm) => ({ ...currentForm, color: color.value }))}
                  style={{ '--swatch-color': color.value }}
                  type="button"
                />
              ))}
            </div>
          </fieldset>

          {error && <p className="form-error" role="alert">{error}</p>}

          <footer className="dialog-actions">
            <button className="secondary-button" type="button" onClick={onClose}>취소</button>
            <button className="primary-button" type="submit">{schedule ? '변경 저장' : '일정 등록'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ScheduleDialog;