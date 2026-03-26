import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, BookOpen, Code as CodeIcon, PlayCircle, Video, CheckCircle } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from '../components/layout/BrandLogo';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const palette = {
  bg: '#0b1811',
  border: '#22c55e',
  text: '#a7f3d0',
  title: '#ffffff',
  nodeText: '#e2e8f0',
  mutedText: '#94a3b8',
  nodeBg: 'rgba(15, 23, 42, 0.8)',
  shadowRgb: '0,0,0',
  accent: '#16a34a',
};

const lightPalette = {
  bg: '#f0fdf4',
  border: '#22c55e',
  text: '#22c55e',
  title: '#15803d',
  nodeText: '#166534',
  mutedText: '#16a34a',
  nodeBg: 'rgba(34, 197, 94, 0.1)',
  shadowRgb: '22,163,74',
  accent: '#16a34a',
};

/* ── lecture type icons ── */
const typeIcon = {
  video: Video,
  interactive: PlayCircle,
  project: CodeIcon,
};

/* ── Custom node: Milestone ── */
function MilestoneNode({ data }) {
  const c = data.colors;
  return (
    <div
      className="rounded-2xl text-center"
      style={{
        background: `linear-gradient(135deg, ${c.bg}, ${c.bg}cc)`,
        border: `2px solid ${c.border}`,
        padding: '20px 32px',
        minWidth: 260,
        boxShadow: `0 0 30px ${c.border}22, 0 4px 20px rgba(${c.shadowRgb},0.3)`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ color: c.text, fontSize: 11, marginBottom: 6, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase' }}>
        {data.milestoneLabel}
      </div>
      <div style={{ color: c.title, fontWeight: 800, fontSize: 17 }}>{data.label}</div>
      <div style={{ color: c.text, fontSize: 12, marginTop: 6, opacity: 0.8 }}>
        {data.lecturesLabel}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

/* ── Custom node: Lecture ── */
function LectureNode({ data }) {
  const c = data.colors;
  const Icon = typeIcon[data.type] || BookOpen;
  const isCurrent = data.isCurrent;
  const isDone = data.isDone;

  const doneColor = '#22c55e';
  const borderColor = isDone ? doneColor : (isCurrent ? c.border : `${c.border}44`);
  const bgColor = isDone ? `${doneColor}14` : (isCurrent ? `${c.border}18` : c.nodeBg);
  const shadow = isDone
    ? `0 0 20px ${doneColor}33, 0 0 40px ${doneColor}18`
    : isCurrent
    ? `0 0 24px ${c.border}44, 0 0 48px ${c.border}22`
    : 'none';

  return (
    <div
      onClick={data.onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          data.onClick?.();
        }
      }}
      className="rounded-xl transition-all duration-200"
      style={{
        background: bgColor,
        backdropFilter: 'blur(8px)',
        border: isDone ? `2px solid ${doneColor}` : (isCurrent ? `2px solid ${c.border}` : `1px solid ${c.border}44`),
        padding: '14px 18px',
        minWidth: 220,
        cursor: 'pointer',
        boxShadow: shadow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDone ? doneColor : c.border;
        e.currentTarget.style.boxShadow = `0 0 20px ${isDone ? doneColor : c.border}33`;
        e.currentTarget.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.boxShadow = shadow;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: isDone ? `${doneColor}22` : `${c.border}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isDone ? <CheckCircle size={14} color={doneColor} /> : <Icon size={14} color={c.text} />}
        </div>
        <span style={{ color: isDone ? '#bbf7d0' : c.nodeText, fontSize: 13, fontWeight: 600 }}>{data.label}</span>
        {isDone && !isCurrent && (
          <span style={{
            fontSize: 9,
            padding: '2px 8px',
            borderRadius: 10,
            background: doneColor,
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginLeft: 'auto',
          }}>
            {data.doneLabel}
          </span>
        )}
        {isCurrent && (
          <span style={{
            fontSize: 9,
            padding: '2px 8px',
            borderRadius: 10,
            background: c.border,
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginLeft: 'auto',
          }}>
            {data.currentLabel}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <span style={{ color: isDone ? '#86efac' : c.mutedText, fontSize: 11 }}>{data.duration}</span>
        <span
          style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 10,
            background: isDone ? `${doneColor}22` : `${c.border}22`,
            color: isDone ? '#86efac' : c.text,
            border: `1px solid ${isDone ? `${doneColor}44` : `${c.border}44`}`,
            fontWeight: 600,
          }}
        >
          {data.type}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
const nodeTypes = {
  milestone: MilestoneNode,
  lecture: LectureNode,
};

function buildGraph(roadmap, colors, onLectureClick, currentLecture, labels) {
  const nodes = [];
  const edges = [];

  const centerX = 920;
  const lectureGapY = 150;
  const sideGapX = 520;
  const milestoneStartY = 180;
  const milestoneBasePaddingY = 280;
  let currentY = milestoneStartY;
  let prevLectureSpan = 0;

  const arrowMarker = {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: colors.border,
  };

  let prevMilestoneId = null;

  roadmap.milestones.forEach((milestone, mIdx) => {
    const milestoneId = `m-${milestone.id}`;
    const sideLectureCount = Math.max(Math.ceil(milestone.lectures.length / 2), 1);
    const currentLectureSpan = ((sideLectureCount - 1) * lectureGapY) / 2;

    if (mIdx === 0) {
      currentY = milestoneStartY;
    } else {
      // Prevent overlap: place next milestone below previous lecture column span.
      currentY = currentY + prevLectureSpan + currentLectureSpan + milestoneBasePaddingY;
    }

    nodes.push({
      id: milestoneId,
      type: 'milestone',
      position: { x: centerX, y: currentY },
      data: {
        label: milestone.title,
        index: mIdx + 1,
        lectureCount: milestone.lectures.length,
        milestoneLabel: labels.milestone(mIdx + 1),
        lecturesLabel: labels.lectures(milestone.lectures.length),
        colors,
      },
      draggable: true,
    });

    // Arrow from previous milestone to this milestone
    if (prevMilestoneId) {
      edges.push({
        id: `e-${prevMilestoneId}-${milestoneId}`,
        source: prevMilestoneId,
        target: milestoneId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: colors.border, strokeWidth: 3 },
        markerEnd: arrowMarker,
      });
    }

    const splitIndex = Math.ceil(milestone.lectures.length / 2);
    const leftLectures = milestone.lectures.slice(0, splitIndex);
    const rightLectures = milestone.lectures.slice(splitIndex);

    const makeSideNodes = (lectures, side) => {
      if (!lectures.length) return;

      const startY = currentY - ((lectures.length - 1) * lectureGapY) / 2;
      let prevLectureId = null;

      lectures.forEach((lecture, index) => {
        const lectureId = `l-${milestone.id}-${lecture.id}`;
        const x = side === 'left' ? centerX - sideGapX : centerX + sideGapX;
        const y = startY + index * lectureGapY;

        nodes.push({
          id: lectureId,
          type: 'lecture',
          position: { x, y },
          data: {
            label: lecture.title,
            duration: lecture.duration,
            type: lecture.type,
            colors,
            isCurrent: lecture.id === currentLecture,
            isDone: lecture.id < currentLecture,
            doneLabel: labels.done,
            currentLabel: labels.current,
            onClick: () => onLectureClick(lecture, milestone),
          },
          draggable: true,
        });

        if (prevLectureId) {
          edges.push({
            id: `e-${prevLectureId}-${lectureId}`,
            source: prevLectureId,
            target: lectureId,
            type: 'smoothstep',
            style: { stroke: `${colors.border}aa`, strokeWidth: 2.5 },
            markerEnd: { ...arrowMarker, color: `${colors.border}aa` },
          });
        } else {
          edges.push({
            id: `e-${milestoneId}-${lectureId}`,
            source: milestoneId,
            target: lectureId,
            type: 'smoothstep',
            style: { stroke: `${colors.border}cc`, strokeWidth: 2.5 },
            markerEnd: arrowMarker,
          });
        }

        prevLectureId = lectureId;
      });
    };

    makeSideNodes(leftLectures, 'left');
    makeSideNodes(rightLectures, 'right');

    prevMilestoneId = milestoneId;
    prevLectureSpan = currentLectureSpan;
  });

  return { nodes, edges };
}

/* ── Main page component ── */
export default function RoadmapFlow() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);

  const colors = useMemo(() => (theme === 'light' ? lightPalette : palette), [theme]);

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    return stored;
  });

  useEffect(() => {
    setLoadingRoadmap(true);
    fetch(`${BACKEND_URL}/learning/roadmaps/${pathId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success || !data.roadmap) {
          setRoadmap(null);
          return;
        }
        setRoadmap(data.roadmap);
      })
      .catch((error) => {
        console.error('Failed to fetch roadmap graph data:', error);
        setRoadmap(null);
      })
      .finally(() => setLoadingRoadmap(false));
  }, [pathId]);

  useEffect(() => {
    if (!currentUser?.id) return;

    fetch(`${BACKEND_URL}/user/${currentUser.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success || !data.user) return;
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
      })
      .catch((error) => {
        console.error('Failed to refresh user progress on roadmap:', error);
      });
  }, [currentUser?.id]);

  const onLectureClick = useCallback(
    (lecture, milestone) => {
      navigate(`/lesson/${pathId}/${lecture.id}`, {
        state: { lecture, milestone, pathTitle: roadmap.title },
      });
    },
    [navigate, pathId, roadmap],
  );

  // Read current lecture from user data
  const currentLecture = useMemo(() => {
    return currentUser?.currentLecture || 1;
  }, [currentUser?.currentLecture]);

  const graph = useMemo(() => {
    if (!roadmap) return { nodes: [], edges: [] };
    const labels = {
      milestone: (index) => t('roadmapFlow.nodes.milestone', { index }),
      lectures: (count) => t('roadmapFlow.nodes.lectures', { count }),
      done: t('roadmapFlow.nodes.done'),
      current: t('roadmapFlow.nodes.current'),
    };
    return buildGraph(roadmap, colors, onLectureClick, currentLecture, labels);
  }, [roadmap, colors, onLectureClick, currentLecture, t]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setNodes, setEdges]);

  const handleMiniMapNodeClick = useCallback(
    (_, node) => {
      if (!reactFlowInstance || !node?.id) return;

      reactFlowInstance.fitView({
        nodes: [{ id: node.id }],
        duration: 500,
        padding: 1.2,
      });
    },
    [reactFlowInstance],
  );

  if (!roadmap && !loadingRoadmap) {
    return (
      <div className="min-h-screen text-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('roadmapFlow.notFound.title')}</h2>
          <button
            type="button"
            onClick={() => navigate('/paths')}
            className="app-button-primary px-6 py-3 rounded-full font-semibold"
          >
            {t('roadmapFlow.notFound.browsePaths')}
          </button>
        </div>
      </div>
    );
  }

  if (loadingRoadmap) {
    return (
      <div className="min-h-screen text-emerald-50 flex items-center justify-center">
        <p className="text-emerald-100/70">{t('roadmapFlow.loading')}</p>
      </div>
    );
  }

  return (
    <PageShell className="h-screen w-screen text-emerald-50" wrapperClassName="h-full flex flex-col" contentClassName="h-full flex flex-col p-0">
      {/* Header — matches site header style */}
      <header
        className="app-navbar relative shrink-0 border-b border-emerald-500/20"
        style={{ zIndex: 10 }}
      >
        <div className="relative flex max-w-full flex-col gap-3 px-4 py-3 sm:px-6 md:min-h-[72px] md:justify-center md:py-4">
          <div className="order-1 text-center md:absolute md:left-1/2 md:top-1/2 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2">
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              {roadmap.title}
            </h2>
            <p className="hidden text-sm text-emerald-100/55 lg:block">{roadmap.description}</p>
          </div>

          <div className="order-2 flex items-center justify-start gap-3 md:mr-auto md:gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              aria-label={t('lesson.header.goDashboard')}
              className="flex items-center"
            >
              <BrandLogo className="h-10 w-[170px] shrink-0 text-emerald-200" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-emerald-100/75 transition-colors hover:text-emerald-100"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('roadmapFlow.header.dashboard')}
            </button>
          </div>
        </div>
      </header>

      {/* React Flow canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background color={theme === 'light' ? '#22c55e' : '#14532d'} gap={40} size={1} />
          <Controls
            style={{
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(4, 20, 12, 0.92)',
              border: theme === 'light' ? '1px solid rgba(34, 197, 94, 0.45)' : '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: 14,
              backdropFilter: 'blur(12px)',
              boxShadow: theme === 'light' ? '0 8px 24px rgba(22,163,74,0.16)' : '0 8px 24px rgba(0,0,0,0.45)',
              padding: 4,
            }}
            className="roadmap-controls"
          />
          <MiniMap
            pannable
            zoomable
            onNodeClick={handleMiniMapNodeClick}
            nodeColor={(node) => {
              if (node.type === 'milestone') return colors.border;
              return '#15803d';
            }}
            maskColor={theme === 'light' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(0,0,0,0.6)'}
            style={{
              background: theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(4, 20, 12, 0.88)',
              borderColor: theme === 'light' ? '#22c55e' : '#14532d',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          />
        </ReactFlow>
      </div>

      {/* Controls button styling */}
      <style>{`
        .roadmap-controls button {
          width: 36px !important;
          height: 36px !important;
          background: ${theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(4, 20, 12, 0.95)'} !important;
          border: 1px solid ${theme === 'light' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(74, 222, 128, 0.35)'} !important;
          border-radius: 8px !important;
          color: ${theme === 'light' ? '#16a34a' : '#dcfce7'} !important;
          fill: ${theme === 'light' ? '#16a34a' : '#dcfce7'} !important;
          transition: all 0.15s ease !important;
        }
        .roadmap-controls button:hover {
          background: ${theme === 'light' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(22, 163, 74, 0.35)'} !important;
          border-color: ${theme === 'light' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(74, 222, 128, 0.7)'} !important;
          fill: ${theme === 'light' ? '#15803d' : '#fff'} !important;
        }
        .roadmap-controls button svg {
          fill: ${theme === 'light' ? '#16a34a' : '#dcfce7'} !important;
        }
        .roadmap-controls button:hover svg {
          fill: ${theme === 'light' ? '#15803d' : '#fff'} !important;
        }
      `}</style>
    </PageShell>
  );
}
