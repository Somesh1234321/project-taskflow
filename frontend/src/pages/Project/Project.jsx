import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import projectService from '../../services/project.service';
import taskService from '../../services/task.service';
import TaskModal from '../../components/TaskModal/TaskModal';

// ─────────────── CONSTANTS ──────────────────────────────────────────────────

const COLUMNS = [
  {
    id: 'Todo',
    label: 'To Do',
    icon: '',
    color: 'text-on-surface-variant',
    headerBg: 'bg-surface-container',
    dotColor: 'bg-on-surface-variant',
    borderColor: 'border-outline-variant',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    icon: '',
    color: 'text-secondary',
    headerBg: 'bg-secondary-container/20',
    dotColor: 'bg-secondary',
    borderColor: 'border-secondary/30',
  },
  {
    id: 'Review',
    label: 'Review',
    icon: '',
    color: 'text-tertiary',
    headerBg: 'bg-tertiary-container/20',
    dotColor: 'bg-tertiary',
    borderColor: 'border-tertiary/30',
  },
  {
    id: 'Done',
    label: 'Done',
    icon: '',
    color: 'text-primary',
    headerBg: 'bg-primary-container/20',
    dotColor: 'bg-primary',
    borderColor: 'border-primary/30',
  },
];

const PRIORITY_CONFIG = {
  High: { label: 'High', icon: '', color: 'text-error', bg: 'bg-error/10' },
  Medium: { label: 'Medium', icon: '', color: 'text-secondary', bg: 'bg-secondary/10' },
  Low: { label: 'Low', icon: '', color: 'text-on-surface-variant', bg: 'bg-surface-variant/40' },
};

// ─────────────── TASK CARD ──────────────────────────────────────────────────

const TaskCard = ({ task, onOpenTask, onDragStart }) => {
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
  const descText = (task.description || '').split('<!-- COMMENTS_JSON -->')[0].trim();
  const hasDesc = descText.length > 0;

  // Parse comment count
  let commentCount = 0;
  const parts = (task.description || '').split('<!-- COMMENTS_JSON -->');
  if (parts[1]) {
    try {
      commentCount = JSON.parse(parts[1]).length;
    } catch (_) {}
  }

  const initials = task.assignedTo?.name
    ? task.assignedTo.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onClick={() => onOpenTask(task)}
      className="group task-card glass-panel rounded-lg p-4 cursor-pointer border border-outline-variant/50 hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:opacity-80 select-none"
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${p.color} ${p.bg}`}>
          <span className="material-symbols-outlined text-[13px]">{p.icon}</span>
          {p.label}
        </span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40 group-hover:text-on-surface-variant/70 transition-colors"></span>
      </div>

      {/* Task title */}
      <h3 className="font-semibold text-on-surface text-sm leading-snug mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description preview */}
      {hasDesc && (
        <p className="text-xs text-on-surface-variant/70 leading-relaxed line-clamp-2 mb-3">
          {descText}
        </p>
      )}

      {/* Footer metadata */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/40">
        {/* Assignee avatar */}
        {initials ? (
          <div className="w-6 h-6 rounded-full bg-primary-container border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
            {initials}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40"></span>
          </div>
        )}

        <div className="flex items-center gap-2 text-on-surface-variant/50">
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <span className="material-symbols-outlined text-[13px]">chat_bubble_outline</span>
              {commentCount}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────── KANBAN COLUMN ───────────────────────────────────────────────

const KanbanColumn = ({ column, tasks, onOpenTask, onAddTask, onDragStart, onDragOver, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e, column.id);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    setIsDragOver(false);
    onDrop(e, column.id);
  };

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] xl:w-[300px] flex-shrink-0">
      {/* Column Header */}
      <div className={`flex items-center justify-between mb-3 px-3 py-2.5 rounded-lg ${column.headerBg} border ${column.borderColor}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[18px] ${column.color}`}>{column.icon}</span>
          <span className={`font-semibold text-sm ${column.color}`}>{column.label}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold min-w-[20px] text-center">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-md text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors"
          title={`Add task to ${column.label}`}
        >
          <span className="material-symbols-outlined text-[18px]">+</span>
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col gap-3 min-h-[200px] p-1 rounded-lg transition-all duration-200 ${
          isDragOver ? 'bg-primary/5 border-2 border-dashed border-primary/40' : 'border-2 border-transparent'
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onOpenTask={onOpenTask}
            onDragStart={onDragStart}
          />
        ))}

        {/* Empty state */}
        {tasks.length === 0 && !isDragOver && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-40">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">{column.icon}</span>
            <p className="text-xs text-on-surface-variant text-center leading-relaxed">
              No tasks here.<br />Drop one or add a new task.
            </p>
          </div>
        )}

        {isDragOver && (
          <div className="flex items-center justify-center py-6 border-2 border-dashed border-primary/40 rounded-lg">
            <p className="text-xs text-primary font-medium">Drop task here</p>
          </div>
        )}
      </div>

      {/* Add Task button at bottom */}
      <button
        onClick={() => onAddTask(column.id)}
        className="mt-3 w-full py-2.5 rounded-lg border border-dashed border-outline-variant/60 text-on-surface-variant/60 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 text-xs font-medium flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[15px]">+</span>
        Add Task
      </button>
    </div>
  );
};

// ─────────────── PROJECT PAGE ────────────────────────────────────────────────

const Project = () => {
  const { projectId } = useParams();
  const { toggleMobileSidebar } = useOutletContext();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreation, setIsCreation] = useState(false);
  const [createStatus, setCreateStatus] = useState('Todo');

  // Search / filter
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // Drag state
  const dragTaskId = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [projRes, tasksRes] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getAllTasks(),
      ]);

      if (projRes?.success) setProject(projRes.project);
      if (tasksRes?.success) {
        // Filter tasks by project
        const filtered = (tasksRes.tasks || []).filter(
          (t) => (t.project?._id || t.project) === projectId
        );
        setTasks(filtered);
      }
    } catch (err) {
      setError('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filter tasks ──
  const filteredTasks = tasks.filter((t) => {
    const matchSearch = search.trim() === '' || t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const getColumnTasks = (columnId) =>
    filteredTasks.filter((t) => t.status === columnId);

  // ── Task modal handlers ──
  const openAddTask = (columnId) => {
    setIsCreation(true);
    setSelectedTask(null);
    setCreateStatus(columnId);
    setModalOpen(true);
  };

  const openEditTask = (task) => {
    setIsCreation(false);
    setSelectedTask(task);
    setModalOpen(true);
  };

  // ── Drag and drop ──
  const handleDragStart = (e, taskId) => {
    dragTaskId.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = dragTaskId.current;
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      // Revert on failure
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: task.status } : t)));
    }

    dragTaskId.current = null;
  };

  // ── Members list from project ──
  const projectMembers = project?.members || [];

  // ── Stats ──
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const completionPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ─────────────── RENDER ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm">Loading project board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="glass-panel rounded-xl p-8 text-center max-w-sm">
          <span className="material-symbols-outlined text-4xl text-error mb-3 block">error_outline</span>
          <p className="text-on-surface-variant text-sm mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant/50 bg-surface-container/30 flex-shrink-0">
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Project title + breadcrumb */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-0.5">
            <span className="material-symbols-outlined text-[14px]">folder_open</span>
            <span>Projects</span>
            <span>/</span>
            <span className="text-primary font-medium truncate">{project?.title || 'Loading...'}</span>
          </div>
          <h1 className="font-bold text-on-surface text-lg leading-tight truncate">
            {project?.title || 'Project Board'}
          </h1>
        </div>

        {/* Stats pill */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/50">
            <div className="w-20 h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs text-primary font-semibold">{completionPct}%</span>
            <span className="text-xs text-on-surface-variant">{doneTasks}/{totalTasks}</span>
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchData}
          title="Refresh board"
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors border border-outline-variant/50"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
        </button>
      </header>

      {/* ── Toolbar: search + filters ── */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-outline-variant/30 flex-shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="material-symbols-outlined text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container border border-outline-variant/60 rounded-lg text-on-surface focus:border-primary focus:outline-none transition-colors placeholder:text-on-surface-variant/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-on-surface-variant">Priority:</span>
          {['All', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterPriority === p
                  ? 'bg-primary text-black'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant border border-outline-variant/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <button
            onClick={() => openAddTask('Todo')}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">+</span>
            New Task
          </button>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-5 p-6 h-full min-w-max">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={getColumnTasks(col.id)}
              onOpenTask={openEditTask}
              onAddTask={openAddTask}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* ── Task Modal ── */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        projectId={projectId}
        projectMembers={projectMembers}
        onTaskUpdated={fetchData}
        isCreation={isCreation}
        initialStatus={createStatus}
      />
    </div>
  );
};

export default Project;
