import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Toast from './components/layout/Toast';

import PaymentModal from './components/modals/PaymentModal';
import MemberDetailModal from './components/modals/MemberDetailModal';
import NewApplicationModal from './components/modals/NewApplicationModal';
import RoomFolioModal from './components/modals/RoomFolioModal';
import EventDetailModal from './components/modals/EventDetailModal';
import UseTemplateModal from './components/modals/UseTemplateModal';

import DashboardView from './views/DashboardView';
import MembersView from './views/MembersView';
import StaffView from './views/StaffView';
import StayView from './views/StayView';
import PosView from './views/PosView';
import FitnessView from './views/FitnessView';
import PaymentsView from './views/PaymentsView';
import ReportsView from './views/ReportsView';
import EventsView from './views/EventsView';

import {
  INITIAL_MEMBERS,
  INITIAL_APPLICATIONS,
  INITIAL_STAFF,
  INITIAL_SHIFTS,
  INITIAL_ROOMS,
  INITIAL_TABLES,
  INITIAL_FACILITIES,
  INITIAL_CLASSES,
  INITIAL_SLOTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EVENTS,
  OUTLETS,
  OUTLET_NAMES,
  PAYMENT_METHODS,
  ROLE_VIEWS,
  ROLE_NAMES,
  formatMoney,
  getMemberDue,
  TIER,
  EVENT_PREPARATION_FLOW,
} from './data/initialData';

export default function App() {
  // Global Navigation & Customization
  const [role, setRole] = useState('admin');
  const [view, setView] = useState('dash');
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState(null);

  // Core Data States
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [payrollDone, setPayrollDone] = useState(false);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedRoomNo, setSelectedRoomNo] = useState(null);
  const [outlet, setOutlet] = useState('silk');
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState('T1');
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [events, setEvents] = useState(INITIAL_EVENTS);

  // Live Activity Feed
  const [feed, setFeed] = useState(() => {
    return INITIAL_TRANSACTIONS.slice(0, 6).map((t) => ({
      t: t.t,
      m: `${formatMoney(t.amount)} ${t.outlet} via ${t.method}`,
      fresh: false,
    }));
  });

  // Modal States
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    amount: 0,
    title: '',
    outlet: 'Silk Route',
    initialMem: '',
    cb: null,
  });
  const [memberModal, setMemberModal] = useState({ isOpen: false, member: null });
  const [newAppModal, setNewAppModal] = useState(false);
  const [roomFolioModal, setRoomFolioModal] = useState({ isOpen: false, room: null });
  const [eventDetailModal, setEventDetailModal] = useState({ isOpen: false, event: null });
  const [useTemplateModal, setUseTemplateModal] = useState({ isOpen: false, template: null });

  // Toast Helper
  const showToast = useCallback((message) => {
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dark Mode Sync
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  // Role Permissions Guard
  useEffect(() => {
    const allowed = ROLE_VIEWS[role] || [];
    if (!allowed.includes(view)) {
      setView('dash');
      showToast(`Switched to ${ROLE_NAMES[role]} mode. Unavailable modules dimmed.`);
    }
  }, [role, view, showToast]);

  // Add Transaction Utility
  const addTransaction = useCallback(
    (data) => {
      const newTxn = {
        id: 'TX-' + (48300 + transactions.length + 1),
        t: new Date(),
        outlet: data.outlet,
        method: data.method,
        amount: data.amount,
        st: data.st || 'Success',
      };

      setTransactions((prev) => [newTxn, ...prev]);

      if (newTxn.st === 'Success') {
        setFeed((prev) => [
          {
            t: newTxn.t,
            m: `${formatMoney(newTxn.amount)} ${newTxn.outlet} via ${newTxn.method}`,
            fresh: true,
          },
          ...prev.slice(0, 15),
        ]);
      }

      return newTxn;
    },
    [transactions.length]
  );

  // Background Live Simulation Loop (every 8 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden || view !== 'dash' || paymentModal.isOpen) return;

      const randomOutlet = OUTLET_NAMES[Math.floor(Math.random() * OUTLET_NAMES.length)];
      const ranges = {
        'Silk Route': [1500, 7000],
        'Lantern Bar': [600, 3500],
        'Tea Garden': [250, 1500],
        'Guest house': [6500, 26000],
        'Membership dues': [1500, 5000],
        Fitness: [500, 2500],
        Events: [1500, 8000],
      };
      const r = ranges[randomOutlet] || [1000, 5000];
      const amount = Math.round((r[0] + Math.random() * (r[1] - r[0])) / 10) * 10;
      const method = PAYMENT_METHODS[Math.floor(Math.random() * 5)];

      addTransaction({
        outlet: randomOutlet,
        method,
        amount,
        st: 'Success',
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [view, paymentModal.isOpen, addTransaction]);

  // Handlers for Members
  const handleCollectDues = (member) => {
    const dueAmount = getMemberDue(member);
    setPaymentModal({
      isOpen: true,
      amount: dueAmount,
      title: `Membership Dues for ${member.name}`,
      outlet: 'Membership dues',
      initialMem: member.id,
      cb: () => {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, over: 0 } : m))
        );
        showToast(`Dues collected for ${member.name}. Account returned to Active.`);
      },
    });
  };

  const handleSendReminder = (member) => {
    showToast(`Payment reminder sent to ${member.name} via SMS and email.`);
  };

  const handleSubmitNewApplication = (appData) => {
    const newApp = {
      id: 'A-' + (34 + applications.length),
      ...appData,
    };
    setApplications((prev) => [...prev, newApp]);
    showToast(`Application for ${newApp.name} submitted for committee review.`);
  };

  const handleApproveApplication = (app) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    const newMember = {
      id: 'BCC-' + (600 + members.length),
      name: app.name.replace(/ [\u4e00-\u9fff]+$/, ''),
      alt: (app.name.match(/[\u4e00-\u9fff]+$/) || [''])[0],
      tier: app.tier,
      nat: 'BD',
      over: 0,
      spend: 0,
      year: 2026,
    };
    setMembers((prev) => [...prev, newMember]);
    const admFee = TIER[app.tier]?.adm || 0;
    showToast(`${app.name} approved. Admission invoice of ${formatMoney(admFee)} generated.`);
  };

  const handleDeclineApplication = (app) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    showToast(`Application for ${app.name} declined. Sponsors notified.`);
  };

  // Handlers for Staff
  const handleCycleAttendance = (staffId) => {
    const sequence = ['in', 'late', 'out', 'leave'];
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const nextIndex = (sequence.indexOf(s.att) + 1) % sequence.length;
        return { ...s, att: sequence[nextIndex] };
      })
    );
  };

  const handleCycleShift = (dept, dayIndex) => {
    const sequence = ['M', 'E', 'N', 'off'];
    setShifts((prev) => {
      const currentList = [...(prev[dept] || [])];
      const curVal = currentList[dayIndex] || 'off';
      const nextIndex = (sequence.indexOf(curVal) + 1) % sequence.length;
      currentList[dayIndex] = sequence[nextIndex];
      return { ...prev, [dept]: currentList };
    });
  };

  const handleRunPayroll = () => {
    setPayrollDone(true);
    showToast('October payroll executed. Bank electronic advice and digital payslips transmitted.');
  };

  // Handlers for Stay / Accommodation
  const handleCheckInGuest = (roomNo, guestName, nights) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.no === roomNo
          ? { ...r, st: 'occ', guest: guestName, nights }
          : r
      )
    );
    showToast(`Room ${roomNo} checked in: ${guestName}`);
  };

  const handleArriveToday = (roomNo) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.no === roomNo
          ? { ...r, st: 'occ', guest: r.guest.replace(' (arrives today)', '') }
          : r
      )
    );
    setSelectedRoomNo(roomNo);
    showToast(`Room ${roomNo} guest checked in.`);
  };

  const handleOpenFolioModal = (room) => {
    setRoomFolioModal({ isOpen: true, room });
  };

  const handleTakeFolioPayment = (room, totalAmount) => {
    setPaymentModal({
      isOpen: true,
      amount: totalAmount,
      title: `Folio checkout Room ${room.no}`,
      outlet: 'Guest house',
      initialMem: '',
      cb: () => {
        setRooms((prev) =>
          prev.map((r) =>
            r.no === room.no ? { ...r, st: 'cln', guest: '', nights: 0 } : r
          )
        );
        setSelectedRoomNo(room.no);
        showToast(`Room ${room.no} folio settled. Room queued for housekeeping.`);
      },
    });
  };

  const handleMarkRoomClean = (roomNo) => {
    setRooms((prev) =>
      prev.map((r) => (r.no === roomNo ? { ...r, st: 'vac' } : r))
    );
    showToast(`Room ${roomNo} marked clean and available in inventory.`);
  };

  const handleBlockRoomMaintenance = (roomNo) => {
    setRooms((prev) =>
      prev.map((r) => (r.no === roomNo ? { ...r, st: 'mnt' } : r))
    );
    showToast(`Room ${roomNo} blocked for maintenance.`);
  };

  // Handlers for POS / Outlets
  const handleAddDish = (tableId, dishKey) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (!targetTable) return prev;

      // License check for alcoholic drinks
      const dish = MENU[outlet]?.find((d) => d.k === dishKey);
      if (dish?.alc && !targetTable.permit) {
        showToast('Please verify and check the excise beverage licence first.');
        return prev;
      }

      const existingLine = targetTable.lines.find(
        (l) => l.k === dishKey && l.s === 'new'
      );

      if (existingLine) {
        existingLine.q += 1;
      } else {
        targetTable.lines.push({ k: dishKey, q: 1, s: 'new' });
      }

      if (targetTable.st === 'free') {
        targetTable.st = 'open';
      }

      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleQuantityPlus = (tableId, dishKey) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (!targetTable) return prev;
      const line = targetTable.lines.find((l) => l.k === dishKey && l.s === 'new');
      if (line) line.q += 1;
      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleQuantityMinus = (tableId, dishKey) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (!targetTable) return prev;
      const lineIndex = targetTable.lines.findIndex(
        (l) => l.k === dishKey && l.s === 'new'
      );
      if (lineIndex > -1) {
        targetTable.lines[lineIndex].q -= 1;
        if (targetTable.lines[lineIndex].q <= 0) {
          targetTable.lines.splice(lineIndex, 1);
        }
      }
      if (targetTable.lines.length === 0) {
        targetTable.st = 'free';
      }
      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleSendKitchen = (tableId) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (!targetTable) return prev;
      const newLines = targetTable.lines.filter((l) => l.s === 'new');
      newLines.forEach((l) => {
        l.s = 'cook';
      });

      showToast(`Sent ${newLines.length} items to ${OUTLETS[outlet].n} kitchen.`);

      // Simulate preparation delay
      setTimeout(() => {
        setTables((latest) => {
          const updatedOutlet = [...(latest[outlet] || [])];
          const t = updatedOutlet.find((x) => x.id === tableId);
          if (t) {
            t.lines.forEach((line) => {
              if (line.s === 'cook') line.s = 'ready';
            });
          }
          return { ...latest, [outlet]: updatedOutlet };
        });
      }, 7000);

      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleServeItem = (tableId, dishKey) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (!targetTable) return prev;
      targetTable.lines.forEach((l) => {
        if (l.k === dishKey && l.s === 'ready') l.s = 'served';
      });
      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleRequestBill = (tableId) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (targetTable) targetTable.st = 'bill';
      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleAssignMemberToTable = (tableId, memberId) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (targetTable) targetTable.member = memberId;
      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleTogglePermitOnTable = (tableId, checked) => {
    setTables((prev) => {
      const currentOutletTables = [...(prev[outlet] || [])];
      const targetTable = currentOutletTables.find((t) => t.id === tableId);
      if (targetTable) targetTable.permit = checked;
      return { ...prev, [outlet]: currentOutletTables };
    });
  };

  const handleOpenPosPaymentModal = (table, totalAmount) => {
    const outletName = OUTLETS[outlet].n;
    setPaymentModal({
      isOpen: true,
      amount: totalAmount,
      title: `${outletName}, Table ${table.id}`,
      outlet: outletName,
      initialMem: table.member,
      cb: () => {
        setTables((prev) => {
          const currentOutletTables = [...(prev[outlet] || [])];
          const targetTable = currentOutletTables.find((t) => t.id === table.id);
          if (targetTable) {
            targetTable.lines = [];
            targetTable.st = 'free';
            targetTable.member = '';
            targetTable.permit = false;
          }
          return { ...prev, [outlet]: currentOutletTables };
        });
        showToast(`Table ${table.id} bill settled. Table released.`);
      },
    });
  };

  // Handlers for Fitness & Sports
  const handleBookClass = (classIndex) => {
    setClasses((prev) => {
      const updated = [...prev];
      const target = [...updated[classIndex]];
      if (target[4] < target[3]) {
        target[4] += 1;
        showToast(`Member enrolled in ${target[1]}.`);
      }
      updated[classIndex] = target;
      return updated;
    });
  };

  const handleToggleSlot = (slotKey) => {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: !prev[slotKey],
    }));
  };

  const handleGateScan = (facilityIndex) => {
    setFacilities((prev) => {
      const updated = [...prev];
      const target = [...updated[facilityIndex]];
      target[3] = Math.min(target[2], target[3] + 1);
      updated[facilityIndex] = target;
      return updated;
    });
  };

  // Handlers for Payments view
  const handleOpenTakePaymentModal = () => {
    setPaymentModal({
      isOpen: true,
      amount: 5000,
      title: 'Manual Terminal Payment',
      outlet: 'Silk Route',
      initialMem: '',
      cb: () => {
        showToast('Payment processed via merchant terminal.');
      },
    });
  };

  const handleRefundTransaction = (txnId) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, st: 'Refunded' } : t))
    );
    showToast(`Transaction ${txnId} refunded.`);
  };

  const handleSettleTransaction = (txnId) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, st: 'Success' } : t))
    );
    showToast(`Transaction ${txnId} marked settled.`);
  };

  // Handlers for Events
  const handleToggleChecklist = (eventId, taskIndex) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const newChk = e.chk.map((item, idx) =>
          idx === taskIndex ? { ...item, d: !item.d } : item
        );
        return { ...e, chk: newChk };
      })
    );
    if (eventDetailModal.isOpen && eventDetailModal.event?.id === eventId) {
      setEventDetailModal((prev) => ({
        ...prev,
        event: {
          ...prev.event,
          chk: prev.event.chk.map((item, idx) =>
            idx === taskIndex ? { ...item, d: !item.d } : item
          ),
        },
      }));
    }
  };

  const handleRegisterMemberEvent = (eventId) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        if (e.reg < e.cap) {
          showToast(`Attendee ticket confirmed for ${e.n}.`);
          return { ...e, reg: e.reg + 1 };
        }
        showToast('Event capacity is full.');
        return e;
      })
    );
    if (eventDetailModal.isOpen && eventDetailModal.event?.id === eventId) {
      setEventDetailModal((prev) => ({
        ...prev,
        event: {
          ...prev.event,
          reg: Math.min(prev.event.cap, prev.event.reg + 1),
        },
      }));
    }
  };

  const handleCreateEventFromTemplate = (data) => {
    const newEvent = {
      id: events.length + 1,
      n: data.n,
      cat: data.cat,
      d: data.d,
      t: data.t,
      venue: data.venue,
      cap: data.cap,
      reg: 0,
      price: data.price,
      done: 0,
      x: data.x,
      chk: EVENT_PREPARATION_FLOW.concat(data.x).map((s) => ({
        s,
        d: false,
      })),
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => (a.d < b.d ? -1 : 1)));
    showToast(`Event "${data.n}" scheduled. Registration is open.`);
  };

  const handleCreateEventFromInvitation = (inv) => {
    const newEvent = {
      id: events.length + 1,
      n: inv.en,
      cat: 'Cultural',
      d: '2026-10-31',
      t: inv.time,
      venue: inv.venue,
      cap: 60,
      reg: 0,
      price: 0,
      done: 0,
      x: [],
      chk: EVENT_PREPARATION_FLOW.map((s) => ({ s, d: false })),
    };
    setEvents((prev) => [...prev, newEvent]);
    showToast(`Event "${inv.en}" added from invitation studio.`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#eef2ed] text-[#10231c] dark:bg-[#0a1713] dark:text-[#eaf0e8] transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={view}
        setView={setView}
        role={role}
        lang={lang}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={view}
          role={role}
          setRole={setRole}
          lang={lang}
          setLang={setLang}
          isDark={isDark}
          setIsDark={setIsDark}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {view === 'dash' && (
            <DashboardView
              role={role}
              members={members}
              rooms={rooms}
              tables={tables}
              transactions={transactions}
              feed={feed}
              events={events}
              applications={applications}
              setView={setView}
            />
          )}

          {view === 'members' && (
            <MembersView
              members={members}
              applications={applications}
              onOpenMemberModal={(m) => setMemberModal({ isOpen: true, member: m })}
              onOpenNewAppModal={() => setNewAppModal(true)}
              onCollectDues={handleCollectDues}
              onApproveApp={handleApproveApplication}
              onDeclineApp={handleDeclineApplication}
            />
          )}

          {view === 'staff' && (
            <StaffView
              staff={staff}
              shifts={shifts}
              payrollDone={payrollDone}
              onCycleAttendance={handleCycleAttendance}
              onCycleShift={handleCycleShift}
              onRunPayroll={handleRunPayroll}
            />
          )}

          {view === 'stay' && (
            <StayView
              rooms={rooms}
              selectedRoomNo={selectedRoomNo}
              onSelectRoom={setSelectedRoomNo}
              onCheckIn={handleCheckInGuest}
              onArriveToday={handleArriveToday}
              onOpenFolioModal={handleOpenFolioModal}
              onMarkClean={handleMarkRoomClean}
              onBlockMaintenance={handleBlockRoomMaintenance}
            />
          )}

          {view === 'pos' && (
            <PosView
              outlet={outlet}
              setOutlet={setOutlet}
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTable={setSelectedTableId}
              members={members}
              onAddDish={handleAddDish}
              onQuantityPlus={handleQuantityPlus}
              onQuantityMinus={handleQuantityMinus}
              onSendKitchen={handleSendKitchen}
              onServeItem={handleServeItem}
              onRequestBill={handleRequestBill}
              onOpenPaymentModal={handleOpenPosPaymentModal}
              onAssignMember={handleAssignMemberToTable}
              onTogglePermit={handleTogglePermitOnTable}
            />
          )}

          {view === 'fit' && (
            <FitnessView
              facilities={facilities}
              classes={classes}
              slots={slots}
              members={members}
              onBookClass={handleBookClass}
              onToggleSlot={handleToggleSlot}
              onGateScan={handleGateScan}
            />
          )}

          {view === 'pay' && (
            <PaymentsView
              transactions={transactions}
              onOpenTakePaymentModal={handleOpenTakePaymentModal}
              onRefundTransaction={handleRefundTransaction}
              onSettleTransaction={handleSettleTransaction}
            />
          )}

          {view === 'rep' && (
            <ReportsView
              role={role}
              transactions={transactions}
              members={members}
              staff={staff}
              events={events}
              showToast={showToast}
            />
          )}

          {view === 'events' && (
            <EventsView
              events={events}
              onOpenEventDetail={(ev) => setEventDetailModal({ isOpen: true, event: ev })}
              onOpenUseTemplate={(tpl) => setUseTemplateModal({ isOpen: true, template: tpl })}
              onCreateEventFromInvitation={handleCreateEventFromInvitation}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal((prev) => ({ ...prev, isOpen: false }))}
        amount={paymentModal.amount}
        title={paymentModal.title}
        outlet={paymentModal.outlet}
        initialMem={paymentModal.initialMem}
        members={members}
        onPaymentSuccess={paymentModal.cb}
        addTransaction={addTransaction}
      />

      <MemberDetailModal
        isOpen={memberModal.isOpen}
        onClose={() => setMemberModal({ isOpen: false, member: null })}
        member={memberModal.member}
        onCollectDues={handleCollectDues}
        onSendReminder={handleSendReminder}
      />

      <NewApplicationModal
        isOpen={newAppModal}
        onClose={() => setNewAppModal(false)}
        members={members}
        onSubmit={handleSubmitNewApplication}
      />

      <RoomFolioModal
        isOpen={roomFolioModal.isOpen}
        onClose={() => setRoomFolioModal({ isOpen: false, room: null })}
        room={roomFolioModal.room}
        onTakePayment={handleTakeFolioPayment}
      />

      <EventDetailModal
        isOpen={eventDetailModal.isOpen}
        onClose={() => setEventDetailModal({ isOpen: false, event: null })}
        event={eventDetailModal.event}
        onToggleChecklist={handleToggleChecklist}
        onRegisterMember={handleRegisterMemberEvent}
      />

      <UseTemplateModal
        isOpen={useTemplateModal.isOpen}
        onClose={() => setUseTemplateModal({ isOpen: false, template: null })}
        template={useTemplateModal.template}
        onCreateEvent={handleCreateEventFromTemplate}
      />

      {/* Floating Status Toast */}
      <Toast toast={toast} />
    </div>
  );
}
