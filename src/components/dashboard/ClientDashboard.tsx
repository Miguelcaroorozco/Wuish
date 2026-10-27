import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { solicitudesApi, mensajesApi } from '../../lib/api';
import { PlanesView } from '../PlanesView';
import { CotizadorView } from '../CotizadorView';
import { EstadoSolicitud } from '../../types';
import { ResumenTab } from './ResumenTab';
import { SolicitudesTab } from './SolicitudesTab';
import { AjustesTab } from './AjustesTab';
import { NuevaSolicitudModal } from './NuevaSolicitudModal';

export type DashboardTab = 'resumen' | 'solicitudes' | 'planes' | 'cotizador' | 'ajustes';

interface ClientDashboardProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  initialPlanId?: string | null;
}

const DASHBOARD_REQUESTS_PER_PAGE = 5;
const ESTADOS_APROBADOS = ['aprobada', 'finalizada', 'completada'];

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab: controlledTab,
  onTabChange,
  initialPlanId,
}) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [internalTab, setInternalTab] = useState<DashboardTab>('resumen');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlanId || null);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
    }
  }, [initialPlanId]);

  const setActiveTab = (tab: DashboardTab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const [filterStatus, setFilterStatus] = useState<EstadoSolicitud | 'Todas'>('Todas');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [dashboardRequestsPage, setDashboardRequestsPage] = useState(1);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [showNewReqModal, setShowNewReqModal] = useState(false);

  useEffect(() => {
    loadData();

    const pollInterval = setInterval(async () => {
      try {
        const [msgRes, solRes] = await Promise.allSettled([
          mensajesApi.getMine(),
          solicitudesApi.getMine(),
        ]);

        if (msgRes.status === 'fulfilled' && Array.isArray(msgRes.value)) {
          const msgs = msgRes.value;
          setMessages((prev) => {
            if (
              prev.length === msgs.length &&
              (prev.length === 0 || prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id)
            ) {
              return prev;
            }
            return msgs;
          });
        }

        if (solRes.status === 'fulfilled' && Array.isArray(solRes.value)) {
          const newSols = solRes.value;
          setSolicitudes((prev) => {
            const hasChanged =
              prev.length !== newSols.length ||
              newSols.some((item, idx) => {
                const old = prev[idx];
                return (
                  !old ||
                  old.id !== item.id ||
                  old.estado !== item.estado ||
                  old.updated_at !== item.updated_at
                );
              });
            return hasChanged ? newSols : prev;
          });
        }
      } catch {}
    }, 3000);

    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as DashboardTab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('wuish:openDashboardTab', handler);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('wuish:openDashboardTab', handler);
    };
  }, []);

  const lastMessageCount = useRef(0);
  useEffect(() => {
    if (messages.length === lastMessageCount.current) return;
    lastMessageCount.current = messages.length;
    const box = chatBottomRef.current?.parentElement;
    if (box) {
      setTimeout(() => {
        box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }, [messages, activeTab]);

  const loadData = async () => {
    try {
      const [solData, msgData] = await Promise.allSettled([
        solicitudesApi.getMine(),
        mensajesApi.getMine(),
      ]);
      if (solData.status === 'fulfilled') setSolicitudes(solData.value);
      if (msgData.status === 'fulfilled' && Array.isArray(msgData.value)) {
        setMessages(msgData.value);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((item) => {
      if (filterStatus === 'Todas') return true;
      return item.estado === filterStatus;
    });
  }, [solicitudes, filterStatus]);

  const dashboardRequestsTotalPages = Math.max(
    1,
    Math.ceil(filteredSolicitudes.length / DASHBOARD_REQUESTS_PER_PAGE)
  );

  const paginatedDashboardRequests = useMemo(() => {
    const start = (dashboardRequestsPage - 1) * DASHBOARD_REQUESTS_PER_PAGE;
    return filteredSolicitudes.slice(start, start + DASHBOARD_REQUESTS_PER_PAGE);
  }, [filteredSolicitudes, dashboardRequestsPage]);

  useEffect(() => {
    if (dashboardRequestsPage > dashboardRequestsTotalPages) {
      setDashboardRequestsPage(dashboardRequestsTotalPages);
    }
  }, [dashboardRequestsPage, dashboardRequestsTotalPages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setChatInput('');
    try {
      const newMsg = await mensajesApi.send({
        contenido: trimmed,
        asunto: 'Mensaje desde dashboard',
      });
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      setChatInput(trimmed);
      showToast('Error', err.message || 'No se pudo enviar el mensaje', 'error');
    }
  };

  const activePlanRecord = useMemo(() => {
    const parseServices = (val: any): any[] => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    };

    const aprobadas = solicitudes.filter((s) => {
      if (s.tipo !== 'cotizacion' || !ESTADOS_APROBADOS.includes(s.estado)) return false;
      const srvList = parseServices(s.servicios_seleccionados);
      return srvList.length > 0 || Boolean(s.plan_id || s.plan) || s.estado === 'finalizada' || s.estado === 'aprobada';
    });

    if (aprobadas.length === 0) return null;

    const latest = [...aprobadas].sort(
      (a, b) =>
        new Date(b.created_at || b.fecha_solicitud).getTime() -
        new Date(a.created_at || a.fecha_solicitud).getTime()
    )[0];

    const srvList = parseServices(latest.servicios_seleccionados);
    const hasServices = srvList.length > 0;
    const hasPlan = Boolean(latest.plan_id || latest.plan);

    // Si la última cotización aprobada o finalizada no tiene servicios ni plan_id (ej. solicitud de cancelación o quedar sin plan), el usuario no tiene plan vigente
    if (!hasServices && !hasPlan) {
      return null;
    }

    return {
      ...latest,
      servicios_seleccionados: srvList,
    };
  }, [solicitudes]);

  const contractedServices: any[] = useMemo(() => {
    return Array.isArray(activePlanRecord?.servicios_seleccionados)
      ? activePlanRecord.servicios_seleccionados
      : [];
  }, [activePlanRecord]);

  return (
    <div className="w-full max-w-[1560px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-300">
      {activeTab === 'resumen' && (
        <ResumenTab
          user={user}
          solicitudes={solicitudes}
          filterStatus={filterStatus}
          onFilterChange={(st) => {
            setFilterStatus(st);
            setDashboardRequestsPage(1);
          }}
          filteredSolicitudes={filteredSolicitudes}
          paginatedDashboardRequests={paginatedDashboardRequests}
          dashboardRequestsPage={dashboardRequestsPage}
          dashboardRequestsTotalPages={dashboardRequestsTotalPages}
          onPageChange={setDashboardRequestsPage}
          onNavigateTab={setActiveTab}
          messages={messages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={handleSendMessage}
          chatBottomRef={chatBottomRef}
          requestsPerPage={DASHBOARD_REQUESTS_PER_PAGE}
        />
      )}

      {activeTab === 'solicitudes' && (
        <SolicitudesTab
          solicitudes={solicitudes}
          setSolicitudes={setSolicitudes}
          contractedServices={contractedServices}
          activePlanRecord={activePlanRecord}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'planes' && (
        <div className="animate-in fade-in duration-200">
          <PlanesView
            onSelectPlan={(planId) => {
              setSelectedPlanId(planId);
              setActiveTab('cotizador');
            }}
          />
        </div>
      )}

      {activeTab === 'cotizador' && (
        <div className="animate-in fade-in duration-200">
          <CotizadorView
            initialPlanId={selectedPlanId}
            activePlanRecord={activePlanRecord}
            contractedServices={contractedServices}
            onSuccessSubmit={() => {
              loadData();
              setActiveTab('resumen');
            }}
          />
        </div>
      )}

      {activeTab === 'ajustes' && (
        <AjustesTab
          user={user}
          updateProfile={updateProfile}
          activePlanRecord={activePlanRecord}
          contractedServices={contractedServices}
          solicitudes={solicitudes}
          messages={messages}
          onNavigateTab={setActiveTab}
        />
      )}

      <NuevaSolicitudModal
        isOpen={showNewReqModal}
        onClose={() => setShowNewReqModal(false)}
        onSuccess={(newSol) => {
          setSolicitudes((prev) => [newSol, ...prev]);
        }}
      />
    </div>
  );
};
