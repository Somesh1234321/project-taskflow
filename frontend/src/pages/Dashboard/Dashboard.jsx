import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/project.service';
import taskService from '../../services/task.service';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useOutletContext();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({
    activeTasks: 0,
    velocity: 48, // default or static points
    blockers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projRes, taskRes] = await Promise.all([
          projectService.getAllProjects(),
          taskService.getAllTasks()
        ]);

        let fetchedProjects = [];
        let fetchedTasks = [];

        if (projRes && projRes.success) {
          fetchedProjects = projRes.projects;
          setProjects(fetchedProjects);
        }
        if (taskRes && taskRes.success) {
          fetchedTasks = taskRes.tasks;
          setTasks(fetchedTasks);
        }

        // Calculate Stats
        const active = fetchedTasks.filter(t => t.status !== 'Done').length;
        const blockersCount = fetchedTasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;

        setStats({
          activeTasks: active,
          velocity: 48, // preserve aesthetic
          blockers: blockersCount
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter projects by search
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to calculate project progress
  const getProjectProgress = (projId) => {
    const projTasks = tasks.filter(t => t.project?._id === projId || t.project === projId);
    if (projTasks.length === 0) return 0;
    const doneTasks = projTasks.filter(t => t.status === 'Done');
    return Math.round((doneTasks.length / projTasks.length) * 100);
  };

  // Get current date formatted
  const getFormattedDate = () => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-gutter py-4 sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={toggleMobileSidebar}
          className="md:hidden text-on-surface-variant mr-4 p-1 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search (Left) */}
        <div className="flex-1 max-w-md relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-sm">🔎</span>
          <input 
            className="w-full bg-[#0e1a10] border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-label-md text-label-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50" 
            placeholder="Search projects, tasks, or members..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-auto">
          <button className="hidden sm:block font-label-md text-label-md text-primary border border-primary hover:bg-primary/10 transition-all px-4 py-1.5 rounded-lg">
            Invite
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-all" onClick={() => navigate('/settings')}>
            <span className="material-symbols-outlined">Account</span>
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 p-gutter lg:p-margin-desktop">
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-code-sm text-code-sm text-primary mb-1 uppercase tracking-wider">Overview</p>
            <h2 className="font-headline-xl text-headline-xl text-on-surface">Good morning, {user?.name || 'Developer'}</h2>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-sm text-primary">🗓️</span>
            <span>{getFormattedDate()}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
          </div>
        ) : (
          /* Bento Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            
            {/* Stats Row */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-2">
              {/* Card 1 */}
              <div className="bg-surface-container-mid backdrop-blur-xl border border-outline-variant/50 p-6 rounded-xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-label-md text-label-md text-on-surface-variant">Active Tasks</span>
                  <span className="material-symbols-outlined text-primary">task</span>
                </div>
                <div className="font-headline-xl text-headline-xl text-on-surface mb-1">{stats.activeTasks}</div>
                <div className="flex items-center gap-1 font-code-sm text-code-sm text-primary">
                  <span className="material-symbols-outlined text-[14px]"></span>
                  <span>Tasks needing completion</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-mid backdrop-blur-xl border border-outline-variant/50 p-6 rounded-xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-label-md text-label-md text-on-surface-variant">Velocity</span>
                  <span className="material-symbols-outlined text-secondary">speed</span>
                </div>
                <div className="font-headline-xl text-headline-xl text-on-surface mb-1">
                  {stats.velocity}<span className="text-headline-lg text-on-surface-variant ml-1">pts</span>
                </div>
                <div className="flex items-center gap-1 font-code-sm text-code-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]"></span>
                  <span>On track</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-mid backdrop-blur-xl border border-outline-variant/50 p-6 rounded-xl flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-label-md text-label-md text-on-surface-variant">Blockers</span>
                  <span className="material-symbols-outlined text-error">warning</span>
                </div>
                <div className="font-headline-xl text-headline-xl text-on-surface mb-1">{stats.blockers}</div>
                <div className="flex items-center gap-1 font-code-sm text-code-sm text-error">
                  <span className="material-symbols-outlined text-[14px]"></span>
                  <span>High priority issues</span>
                </div>
              </div>
            </div>

            {/* Active Projects (Spans 8 cols) */}
            <div className="md:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-lg text-headline-lg text-on-surface text-[20px]">Active Projects</h3>
                <span className="text-xs text-on-surface-variant">{filteredProjects.length} projects found</span>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">folder_open</span>
                  <p className="text-on-surface-variant font-body-md">No active projects matching criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                  {filteredProjects.map((proj) => {
                    const progress = getProjectProgress(proj._id);
                    return (
                      <Link 
                        key={proj._id}
                        to={`/project/${proj._id}`}
                        className="bg-surface-container-low border border-outline-variant rounded-xl p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-primary/45 transition-all block group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-lg bg-[#0e1a10] border border-outline-variant flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">∏</span>
                          </div>
                          <span className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-code-sm text-code-sm text-[10px] uppercase tracking-wide">
                            {proj.status}
                          </span>
                        </div>
                        <h4 className="font-headline-lg text-headline-lg text-on-surface text-[18px] mb-2 group-hover:text-primary transition-colors truncate">
                          {proj.title}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-6 line-clamp-2 h-10">
                          {proj.description}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2 flex justify-between font-code-sm text-code-sm">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="text-primary font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary-container h-full rounded-full relative transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {proj.members?.slice(0, 3).map((m, idx) => (
                              <img 
                                key={m._id || idx}
                                className="w-8 h-8 rounded-full border-2 border-surface-container-low object-cover" 
                                alt={m.name} 
                                title={m.name}
                                src={m.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBbyHnnmbE0ca15gvqPYlaNXydJSr1suMfyoCjcmfla1dALI2zryJ7_Aev3S5l9yWhE4GqcLKjgaidGB_I64FqV2ZvyJdxYXho7YA0cqQsujwxiiLBaqvQD43JW37srinjUtPSG38HMeMNRqHX92C8fgobc8sxMiOAqQ9quuQt89h9_IcZ1QfRzaJMvmvIUzIUK71tfcc3sDXnNGEhv_TPZwV8xrkfZ1Gds56vFRRNIzjOEqvmE0N5QBuZg5IBgw804VxkSew_qbY_G"} 
                              />
                            ))}
                            {proj.members?.length > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-xs font-label-md text-on-surface-variant">
                                +{proj.members.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="font-label-md text-label-md text-on-surface-variant text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span> Active
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Team Activity Feed (Spans 4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <h3 className="font-headline-lg text-headline-lg text-on-surface text-[20px]">Team Activity</h3>
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex-1 flex flex-col justify-between">
                <div className="relative pl-6 border-l border-outline-variant/50 space-y-8">
                  {/* Activity Item 1 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] border-2 border-surface-container-low"></div>
                    <p className="font-body-md text-body-md text-on-surface text-sm">
                      <span className="font-bold text-on-background">Sarah J.</span> merged PR <a className="text-primary hover:underline font-code-sm text-code-sm" href="#">#1042</a>
                    </p>
                    <p className="font-label-md text-label-md text-on-surface-variant text-xs mt-1">20 mins ago • API Gateway</p>
                  </div>
                  {/* Activity Item 2 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-surface-variant rounded-full border-2 border-surface-container-low"></div>
                    <p className="font-body-md text-body-md text-on-surface text-sm">
                      <span className="font-bold text-on-background">David K.</span> moved <span className="text-secondary font-code-sm text-code-sm px-1 bg-surface-variant rounded">AUTH-99</span> to Done
                    </p>
                    <p className="font-label-md text-label-md text-on-surface-variant text-xs mt-1">1 hour ago • Authentication</p>
                  </div>
                  {/* Activity Item 3 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-error rounded-full shadow-[0_0_8px_rgba(255,180,171,0.5)] border-2 border-surface-container-low"></div>
                    <p className="font-body-md text-body-md text-on-surface text-sm">
                      <span className="font-bold text-on-background">System</span> flagged failing test in <a className="text-on-surface-variant hover:text-on-surface underline" href="#">payments-service</a>
                    </p>
                    <p className="font-label-md text-label-md text-on-surface-variant text-xs mt-1">3 hours ago • CI/CD Pipeline</p>
                  </div>
                  {/* Activity Item 4 */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-2.5 h-2.5 bg-surface-variant rounded-full border-2 border-surface-container-low"></div>
                    <p className="font-body-md text-body-md text-on-surface text-sm">
                      <span className="font-bold text-on-background">Elena R.</span> created a new board
                    </p>
                    <p className="font-label-md text-label-md text-on-surface-variant text-xs mt-1">Yesterday • Q4 Planning</p>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 border border-outline-variant hover:border-primary/50 hover:bg-surface-variant/30 text-on-surface-variant hover:text-on-surface rounded-lg transition-all font-label-md text-label-md text-sm">
                  Load More
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
