import { useState } from 'react';
import dayjs from 'dayjs';
import ScheduleDialog from './ScheduleDialog';
import { useSchedules } from './useSchedules';
import './App.css';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function App() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useSchedules();
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [dialogSchedule, setDialogSchedule] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const calendarStart = visibleMonth.startOf('month').startOf('week');
  const calendarDays = Array.from({ length: 42 }, (_, index) => calendarStart.add(index, 'day'));
  const selectedSchedules = schedules
    .filter((schedule) => schedule.date === selectedDate)
    .sort((first, second) => {
      if (first.allDay !== second.allDay) return first.allDay ? -1 : 1;
      return first.startTime.localeCompare(second.startTime);
    });

  function moveMonth(amount) {
    const nextMonth = visibleMonth.add(amount, 'month').startOf('month');
    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth.format('YYYY-MM-DD'));
  }

  function selectDate(date) {
    setSelectedDate(date.format('YYYY-MM-DD'));
    if (!date.isSame(visibleMonth, 'month')) {
      setVisibleMonth(date.startOf('month'));
    }
  }

  function openCreateDialog(date = selectedDate) {
    setDialogSchedule({ date });
    setIsDialogOpen(true);
  }

  function openEditDialog(schedule) {
    setDialogSchedule(schedule);
    setIsDialogOpen(true);
  }

  function saveSchedule(values) {
    if (dialogSchedule.id) {
      updateSchedule(dialogSchedule.id, values);
    } else {
      addSchedule(values);
    }

    const savedDate = dayjs(values.date);
    setSelectedDate(values.date);
    setVisibleMonth(savedDate.startOf('month'));
    setIsDialogOpen(false);
  }

  function removeSchedule(schedule) {
    if (window.confirm(`'${schedule.title}' 일정을 삭제할까요?`)) {
      deleteSchedule(schedule.id);
    }
  }

  return (
    <main className="planner-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="일정 보드 홈">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>daybook</span>
        </a>
        <span className="storage-status"><span /> 이 기기에 저장 중</span>
      </header>

      <section className="planner-heading">
        <div>
          <p className="eyebrow">MY CALENDAR</p>
          <h1>나의 일정</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => openCreateDialog()}>
          <span aria-hidden="true">+</span> 일정 추가
        </button>
      </section>

      <section className="planner-layout" aria-label="월간 일정 관리">
        <div className="calendar-panel">
          <div className="calendar-toolbar">
            <div className="month-controls">
              <h2>{visibleMonth.format('YYYY년 M월')}</h2>
              <div className="arrow-controls">
                <button type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>←</button>
                <button type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>→</button>
              </div>
            </div>
            <button
              className="today-button"
              type="button"
              onClick={() => {
                const today = dayjs();
                setVisibleMonth(today.startOf('month'));
                setSelectedDate(today.format('YYYY-MM-DD'));
              }}
            >
              오늘
            </button>
          </div>

          <div className="calendar-scroll">
            <div className="calendar-grid" role="grid" aria-label={visibleMonth.format('YYYY년 M월')}>
              {weekdays.map((weekday, index) => (
                <div
                  className={`weekday-heading ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}
                  role="columnheader"
                  key={weekday}
                >
                  {weekday}
                </div>
              ))}

              {calendarDays.map((date) => {
                const dateString = date.format('YYYY-MM-DD');
                const daySchedules = schedules
                  .filter((schedule) => schedule.date === dateString)
                  .sort((first, second) => {
                    if (first.allDay !== second.allDay) return first.allDay ? -1 : 1;
                    return first.startTime.localeCompare(second.startTime);
                  });
                const isSelected = dateString === selectedDate;

                return (
                  <div
                    className={`calendar-cell ${date.month() !== visibleMonth.month() ? 'outside-month' : ''} ${isSelected ? 'selected-day' : ''}`}
                    role="gridcell"
                    aria-selected={isSelected}
                    key={dateString}
                  >
                    <button
                      className={`date-number ${date.isSame(dayjs(), 'day') ? 'is-today' : ''}`}
                      type="button"
                      aria-label={date.format('YYYY년 M월 D일')}
                      onClick={() => selectDate(date)}
                    >
                      {date.date()}
                    </button>
                    <div className="day-events">
                      {daySchedules.slice(0, 3).map((schedule) => (
                        <button
                          className="schedule-chip"
                          key={schedule.id}
                          type="button"
                          style={{ '--schedule-color': schedule.color }}
                          title={schedule.title}
                          onClick={() => openEditDialog(schedule)}
                        >
                          <span className="chip-time">{schedule.allDay ? '' : `${schedule.startTime} `}</span>
                          <span className="chip-title">{schedule.title}</span>
                        </button>
                      ))}
                      {daySchedules.length > 3 && (
                        <span className="more-events">+{daySchedules.length - 3}개 더</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="calendar-hint">날짜를 선택하면 해당 일정이 표시됩니다.</p>
        </div>

        <aside className="agenda-panel" aria-label="선택한 날짜의 일정">
          <div className="agenda-heading">
            <div>
              <p className="eyebrow">DAY AGENDA</p>
              <h2>{dayjs(selectedDate).format('M월 D일')} <span>{weekdays[dayjs(selectedDate).day()]}요일</span></h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="선택한 날짜에 일정 추가"
              title="일정 추가"
              onClick={() => openCreateDialog()}
            >
              +
            </button>
          </div>

          {selectedSchedules.length > 0 ? (
            <ul className="agenda-list">
              {selectedSchedules.map((schedule) => (
                <li className="agenda-item" key={schedule.id}>
                  <span className="agenda-color" style={{ backgroundColor: schedule.color }} />
                  <div className="agenda-item-content">
                    <span className="agenda-time">
                      {schedule.allDay ? '종일' : `${schedule.startTime} - ${schedule.endTime}`}
                    </span>
                    <h3>{schedule.title}</h3>
                    {schedule.memo && <p>{schedule.memo}</p>}
                    <div className="agenda-actions">
                      <button type="button" onClick={() => openEditDialog(schedule)}>수정</button>
                      <button type="button" onClick={() => removeSchedule(schedule)}>삭제</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-agenda">
              <span className="empty-mark" aria-hidden="true">○</span>
              <p>등록된 일정이 없습니다.</p>
              <button type="button" onClick={() => openCreateDialog()}>일정 추가하기</button>
            </div>
          )}
        </aside>
      </section>

      {isDialogOpen && (
        <ScheduleDialog
          initialDate={selectedDate}
          schedule={dialogSchedule.id ? dialogSchedule : null}
          onClose={() => setIsDialogOpen(false)}
          onSave={saveSchedule}
        />
      )}
    </main>
  );
}

export default App;