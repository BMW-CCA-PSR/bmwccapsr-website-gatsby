import React from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Spinner,
  Stack,
  Text,
  TextArea,
  useToast,
} from "@sanity/ui";
import { DownloadIcon, RefreshIcon, TrashIcon } from "@sanity/icons";
import { useClient, useCurrentUser } from "sanity";

const API_VERSION = "2025-01-01";

const STATUS_LABELS = {
  submitted: "Submitted",
  assigned: "Assigned",
  denied: "Denied",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

const STATUS_BADGE_STYLE = {
  submitted: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
    borderColor: "#d1d5db",
  },
  assigned: {
    backgroundColor: "#dcfce7",
    color: "#14532d",
    borderColor: "#86efac",
  },
  denied: {
    backgroundColor: "#fee2e2",
    color: "#7f1d1d",
    borderColor: "#fecaca",
  },
  withdrawn: {
    backgroundColor: "#fef3c7",
    color: "#78350f",
    borderColor: "#fde68a",
  },
  expired: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    borderColor: "#d1d5db",
  },
};

const STATUS_TRANSITIONS = {
  submitted: ["assigned", "denied", "withdrawn"],
  assigned: ["withdrawn"],
  denied: [],
  withdrawn: [],
  expired: [],
};

const ACTION_DEFINITIONS = {
  assigned: {
    label: "Approve",
    bulkLabel: "Approve selected",
    tone: "positive",
  },
  denied: {
    label: "Deny",
    bulkLabel: "Deny selected",
    tone: "critical",
  },
  withdrawn: {
    label: "Withdraw",
    bulkLabel: "Withdraw selected",
    mode: "ghost",
  },
};

const APPLICATION_QUERY = `*[_type == "volunteerApplication"] | order(submittedAt desc, _createdAt desc){
  _id,
  _rev,
  _createdAt,
  applicationId,
  applicantName,
  applicantEmail,
  applicantPhone,
  status,
  isActive,
  submittedAt,
  assignedAt,
  deniedAt,
  rejectedReasonPublic,
  rejectedReasonInternal,
  withdrawnAt,
  expiredAt,
  position->{
    _id,
    _rev,
    capacity,
    "assignedVolunteers": assignedVolunteers[]._ref,
    role->{
      name,
      roleScope,
      assignmentCardinality
    },
    date,
    motorsportRegEvent{
      origin,
      name,
      start,
      url,
      sanityEventId
    },
    "sanityEventSlug": *[_type == "event" && _id == ^.motorsportRegEvent.sanityEventId][0].slug.current
  }
}`;

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const normalizeText = (value) => String(value || "").trim();

const formatDateTime = (value) => {
  const parsed = parseDate(value);
  if (!parsed) return "-";
  return parsed.toLocaleString();
};

const normalizeStatus = (value) => (value ? String(value).toLowerCase() : "submitted");

const getPositionName = (application) => {
  const roleName = application?.position?.role?.name;
  if (roleName) return roleName;
  return "Unknown position";
};

const getEventLabel = (application) => {
  const roleScope = normalizeText(application?.position?.role?.roleScope).toLowerCase();
  if (roleScope === "program") return "";
  const eventName = application?.position?.motorsportRegEvent?.name;
  if (eventName) return eventName;
  const start = application?.position?.motorsportRegEvent?.start || application?.position?.date;
  if (!start) return "";
  const parsed = parseDate(start);
  if (!parsed) return "";
  return parsed.toLocaleDateString();
};

const toAbsoluteUrl = (value) => {
  const href = normalizeText(value);
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  return `https://bmw-club-psr.org${href.startsWith("/") ? "" : "/"}${href}`;
};

const getEventHref = (application) => {
  const event = application?.position?.motorsportRegEvent;
  const origin = normalizeText(event?.origin).toLowerCase();
  if (origin === "msr" && normalizeText(event?.url)) {
    return event.url;
  }

  const sanitySlug = normalizeText(application?.position?.sanityEventSlug);
  if (sanitySlug) {
    return toAbsoluteUrl(`/events/${sanitySlug}/`);
  }

  if (normalizeText(event?.url)) {
    return event.url;
  }

  return "";
};

const getAssignmentCardinality = (application) =>
  normalizeText(application?.position?.role?.assignmentCardinality).toLowerCase();

const shouldAutoDeactivatePositionOnAssign = (application) => {
  const assignmentCardinality = getAssignmentCardinality(application);
  if (assignmentCardinality === "singleton") return true;
  const roleName = normalizeText(application?.position?.role?.name).toLowerCase();
  if (!roleName) return false;
  // Legacy fallback while older roles are migrated to assignmentCardinality.
  return roleName.includes("chairperson") || roleName.includes("coordinator");
};

const getEffectiveCapacityLimit = (application) => {
  const explicitCapacity = toCapacityNumber(application?.position?.capacity);
  if (explicitCapacity) return explicitCapacity;
  if (shouldAutoDeactivatePositionOnAssign(application)) return 1;
  return null;
};

const canTransition = (currentStatus, nextStatus) => {
  const status = normalizeStatus(currentStatus);
  return (STATUS_TRANSITIONS[status] || []).includes(nextStatus);
};

const toCapacityNumber = (capacity) => {
  const parsed = Number(capacity);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const getStatusBadgeStyle = (status) => {
  const key = normalizeStatus(status);
  return STATUS_BADGE_STYLE[key] || STATUS_BADGE_STYLE.submitted;
};

const toInputDateStart = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toInputDateEnd = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T23:59:59.999`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const compactButtonStyle = {
  border: "1px solid var(--card-hairline-soft-color)",
  borderRadius: "6px",
  background: "var(--card-bg-color)",
  color: "var(--card-fg-color)",
  fontSize: "12px",
  padding: "4px 8px",
  cursor: "pointer",
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
};

export default function VolunteerApplicationsPane(props) {
  const options = props?.options || {};
  const configuredStatuses = Array.isArray(options?.statuses)
    ? options.statuses.map((value) => normalizeStatus(value)).filter(Boolean)
    : [];
  const hasConfiguredActionTargets = Array.isArray(options?.actionTargets);
  const configuredActionTargets = hasConfiguredActionTargets
    ? options.actionTargets
        .map((value) => normalizeStatus(value))
        .filter((value) => Boolean(ACTION_DEFINITIONS[value]))
    : [];
  const actionTargets = hasConfiguredActionTargets
    ? configuredActionTargets
    : ["assigned", "denied", "withdrawn"];
  const lockStatusFilter = Boolean(options?.lockStatusFilter);
  const isDeniedOnlyPane =
    configuredStatuses.length === 1 && configuredStatuses[0] === "denied";

  const client = useClient({ apiVersion: API_VERSION });
  const currentUser = useCurrentUser();
  const toast = useToast();

  const [applications, setApplications] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isApplyingAction, setIsApplyingAction] = React.useState(false);
  const [error, setError] = React.useState("");
  const [denyDialogState, setDenyDialogState] = React.useState({
    open: false,
    applicationIds: [],
  });
  const [denyReasonPublic, setDenyReasonPublic] = React.useState("");
  const [denyReasonInternal, setDenyReasonInternal] = React.useState("");
  const [denyDialogError, setDenyDialogError] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState(
    configuredStatuses.length === 1 ? configuredStatuses[0] : "all"
  );
  const [positionFilter, setPositionFilter] = React.useState("all");
  const [eventFilter, setEventFilter] = React.useState("all");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState([]);
  const paneConfigKey = `${lockStatusFilter ? "locked" : "unlocked"}:${configuredStatuses.join(",")}`;
  const previousPaneConfigKeyRef = React.useRef(paneConfigKey);

  const fetchApplications = React.useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await client.fetch(APPLICATION_QUERY);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load volunteer applications.");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  React.useEffect(() => {
    if (!lockStatusFilter) return;
    if (configuredStatuses.length === 1) {
      setStatusFilter(configuredStatuses[0]);
      return;
    }
    if (configuredStatuses.length > 1 && !configuredStatuses.includes(statusFilter)) {
      setStatusFilter("all");
    }
  }, [configuredStatuses, lockStatusFilter, statusFilter]);

  React.useEffect(() => {
    if (previousPaneConfigKeyRef.current === paneConfigKey) return;
    previousPaneConfigKeyRef.current = paneConfigKey;
    if (!lockStatusFilter) {
      setStatusFilter("all");
    }
  }, [lockStatusFilter, paneConfigKey]);

  React.useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => applications.some((application) => application._id === id))
    );
  }, [applications]);

  const applicationById = React.useMemo(() => {
    const map = new Map();
    applications.forEach((application) => {
      map.set(application._id, application);
    });
    return map;
  }, [applications]);

  const assignedCountByPosition = React.useMemo(() => {
    const map = new Map();
    applications.forEach((application) => {
      const positionId = application?.position?._id;
      if (!positionId) return;
      if (normalizeStatus(application.status) !== "assigned") return;
      if (application.isActive === false) return;
      map.set(positionId, (map.get(positionId) || 0) + 1);
    });
    return map;
  }, [applications]);

  const positionOptions = React.useMemo(() => {
    const map = new Map();
    applications.forEach((application) => {
      const positionId = application?.position?._id;
      if (!positionId) return;
      if (!map.has(positionId)) {
        map.set(positionId, getPositionName(application));
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [applications]);

  const eventOptions = React.useMemo(() => {
    const set = new Set();
    applications.forEach((application) => {
      set.add(getEventLabel(application));
    });
    return Array.from(set)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = React.useMemo(() => {
    const from = toInputDateStart(fromDate);
    const to = toInputDateEnd(toDate);

    return applications.filter((application) => {
      const status = normalizeStatus(application.status);

      if (configuredStatuses.length > 0 && !configuredStatuses.includes(status)) {
        return false;
      }
      if (!lockStatusFilter && statusFilter !== "all" && status !== statusFilter) {
        return false;
      }
      if (positionFilter !== "all" && application?.position?._id !== positionFilter) {
        return false;
      }

      const eventLabel = getEventLabel(application);
      if (eventFilter !== "all" && eventLabel !== eventFilter) {
        return false;
      }

      const submittedAt = parseDate(application?.submittedAt || application?._createdAt);
      if (from && submittedAt && submittedAt < from) {
        return false;
      }
      if (to && submittedAt && submittedAt > to) {
        return false;
      }

      return true;
    });
  }, [
    applications,
    configuredStatuses,
    eventFilter,
    fromDate,
    lockStatusFilter,
    positionFilter,
    statusFilter,
    toDate,
  ]);

  const groupedApplications = React.useMemo(() => {
    const groups = new Map();

    filteredApplications.forEach((application) => {
      const positionId = application?.position?._id || `missing-${application._id}`;
      const positionName = getPositionName(application);
      const eventLabel = getEventLabel(application);
      const capacity = application?.position?.capacity;

      if (!groups.has(positionId)) {
        groups.set(positionId, {
          key: positionId,
          positionId: application?.position?._id || null,
          positionName,
          eventLabel,
          capacity,
          rows: [],
        });
      }

      groups.get(positionId).rows.push(application);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        rows: [...group.rows].sort((a, b) => {
          const aDate = parseDate(a?.submittedAt || a?._createdAt)?.getTime() || 0;
          const bDate = parseDate(b?.submittedAt || b?._createdAt)?.getTime() || 0;
          return aDate - bDate;
        }),
      }))
      .sort((a, b) => {
        const nameDiff = a.positionName.localeCompare(b.positionName);
        if (nameDiff !== 0) return nameDiff;
        return String(a.eventLabel || "").localeCompare(String(b.eventLabel || ""));
      });
  }, [filteredApplications]);

  const filteredIds = React.useMemo(
    () => filteredApplications.map((application) => application._id),
    [filteredApplications]
  );

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

  const selectedApplications = React.useMemo(
    () => selectedIds.map((id) => applicationById.get(id)).filter(Boolean),
    [applicationById, selectedIds]
  );

  const selectedActionAvailability = React.useMemo(() => {
    const totals = actionTargets.reduce((acc, target) => {
      acc[target] = 0;
      return acc;
    }, {});

    selectedApplications.forEach((application) => {
      const status = normalizeStatus(application.status);
      actionTargets.forEach((targetStatus) => {
        if (canTransition(status, targetStatus)) {
          totals[targetStatus] += 1;
        }
      });
    });

    return totals;
  }, [actionTargets, selectedApplications]);

  const toggleSelectAllFiltered = React.useCallback(() => {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }
      const merged = new Set([...prev, ...filteredIds]);
      return Array.from(merged);
    });
  }, [allFilteredSelected, filteredIds]);

  const toggleRowSelection = React.useCallback((applicationId) => {
    setSelectedIds((prev) => {
      if (prev.includes(applicationId)) {
        return prev.filter((id) => id !== applicationId);
      }
      return [...prev, applicationId];
    });
  }, []);

  const runTransition = React.useCallback(
    async (applicationIds, nextStatus, transitionOptions = {}) => {
      if (!Array.isArray(applicationIds) || applicationIds.length === 0) return;
      if (!actionTargets.includes(nextStatus)) return;
      if (
        nextStatus === "denied" &&
        !normalizeText(transitionOptions?.rejectedReasonPublic)
      ) {
        toast.push({
          title: "Rejected reason required",
          status: "warning",
          description: "Add a public rejection reason before denying.",
        });
        return;
      }

      const actorRaw =
        currentUser?.name || currentUser?.email || currentUser?.id || "editor";
      const actorName = `studio:${normalizeText(actorRaw) || "editor"}`;

      const apps = applicationIds
        .map((applicationId) => applicationById.get(applicationId))
        .filter(Boolean);

      if (apps.length === 0) return;

      setIsApplyingAction(true);
      try {
        const updated = [];
        const skipped = [];
        const failed = [];
        const assignedCountSnapshot = new Map(assignedCountByPosition);
        const rejectedReasonPublic = normalizeText(
          transitionOptions?.rejectedReasonPublic,
        );
        const rejectedReasonInternal = normalizeText(
          transitionOptions?.rejectedReasonInternal,
        );

        for (const application of apps) {
          try {
            const sanityId = normalizeText(application?._id);
            if (!sanityId) {
              skipped.push({
                sanityId: "",
                reason: "Missing Sanity document ID.",
              });
              continue;
            }

            const currentStatus = normalizeStatus(application?.status);
            if (!canTransition(currentStatus, nextStatus)) {
              skipped.push({
                sanityId,
                reason: `Cannot move ${currentStatus || "unknown"} to ${nextStatus}.`,
              });
              continue;
            }

            const positionId = normalizeText(application?.position?._id || "");
            const capacityLimit = getEffectiveCapacityLimit(application);
            if (nextStatus === "assigned" && positionId && capacityLimit) {
              const currentAssigned = assignedCountSnapshot.get(positionId) || 0;
              if (currentAssigned >= capacityLimit) {
                skipped.push({
                  sanityId,
                  reason: `Capacity full for ${getPositionName(application)}.`,
                });
                continue;
              }
            }

            const nowIso = new Date().toISOString();
            const setPatch = {
              status: nextStatus,
              isActive: nextStatus === "submitted" || nextStatus === "assigned",
              lastActionAt: nowIso,
              lastActionBy: actorName,
            };
            if (nextStatus === "assigned") {
              setPatch.assignedAt = nowIso;
            }
            if (nextStatus === "denied") {
              setPatch.deniedAt = nowIso;
              setPatch.rejectedReasonPublic =
                rejectedReasonPublic || "No reason provided.";
              setPatch.rejectedReasonInternal = rejectedReasonInternal || null;
            }
            if (nextStatus === "withdrawn") {
              setPatch.withdrawnAt = nowIso;
            }

            const unsetPatch = [];
            if (nextStatus === "assigned") {
              unsetPatch.push(
                "deniedAt",
                "withdrawnAt",
                "expiredAt",
                "rejectedReasonPublic",
                "rejectedReasonInternal",
              );
            } else if (nextStatus === "denied") {
              unsetPatch.push("assignedAt", "withdrawnAt", "expiredAt");
            } else if (nextStatus === "withdrawn") {
              unsetPatch.push("assignedAt", "deniedAt", "expiredAt");
            }

            const transaction = client.transaction();
            transaction.patch(sanityId, {
              set: setPatch,
              ...(unsetPatch.length > 0 ? { unset: unsetPatch } : {}),
            });

            if (positionId && nextStatus === "assigned") {
              const assignedVolunteerIds = Array.isArray(
                application?.position?.assignedVolunteers,
              )
                ? application.position.assignedVolunteers
                : [];
              if (!assignedVolunteerIds.includes(sanityId)) {
                transaction.patch(positionId, {
                  setIfMissing: { assignedVolunteers: [] },
                  insert: {
                    after: "assignedVolunteers[-1]",
                    items: [{ _type: "reference", _ref: sanityId }],
                  },
                });
              }
              if (shouldAutoDeactivatePositionOnAssign(application)) {
                transaction.patch(positionId, {
                  set: { active: false },
                });
              }
            }

            if (
              positionId &&
              (nextStatus === "withdrawn" ||
                nextStatus === "denied" ||
                nextStatus === "expired")
            ) {
              transaction.patch(positionId, {
                unset: [`assignedVolunteers[_ref=="${sanityId}"]`],
              });
            }

            await transaction.commit({ autoGenerateArrayKeys: true });

            if (nextStatus === "assigned" && positionId && capacityLimit) {
              const currentAssigned = assignedCountSnapshot.get(positionId) || 0;
              assignedCountSnapshot.set(positionId, currentAssigned + 1);
            }

            updated.push({
              sanityId,
              status: nextStatus,
            });
          } catch (error) {
            failed.push({
              sanityId: normalizeText(application?._id),
              reason: error?.message || "Transition failed.",
            });
          }
        }

        await fetchApplications();
        const updatedSanityIds = updated
          .map((item) => normalizeText(item?.sanityId))
          .filter(Boolean);
        if (updatedSanityIds.length > 0) {
          setSelectedIds((prev) =>
            prev.filter((id) => !updatedSanityIds.includes(id)),
          );
        }

        const updatedCount = updated.length;
        const skippedCount = skipped.length;
        const failedCount = failed.length;

        const actionLabel = STATUS_LABELS[nextStatus] || nextStatus;
        const statusLine = `${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`;
        toast.push({
          title: `${actionLabel} action complete`,
          status: failedCount > 0 ? "warning" : "success",
          description: statusLine,
        });
      } catch (error) {
        toast.push({
          title: "Action failed",
          status: "error",
          description: error?.message || "Unable to update applications.",
        });
      } finally {
        setIsApplyingAction(false);
      }
    },
    [
      actionTargets,
      applicationById,
      assignedCountByPosition,
      client,
      currentUser,
      fetchApplications,
      toast,
    ]
  );

  const closeDenyDialog = React.useCallback(() => {
    if (isApplyingAction) return;
    setDenyDialogState({ open: false, applicationIds: [] });
    setDenyReasonPublic("");
    setDenyReasonInternal("");
    setDenyDialogError("");
  }, [isApplyingAction]);

  const requestTransition = React.useCallback(
    (applicationIds, targetStatus) => {
      if (!Array.isArray(applicationIds) || applicationIds.length === 0) return;
      if (targetStatus === "denied") {
        setDenyDialogState({ open: true, applicationIds });
        setDenyReasonPublic("");
        setDenyReasonInternal("");
        setDenyDialogError("");
        return;
      }
      runTransition(applicationIds, targetStatus);
    },
    [runTransition]
  );

  const confirmDenyTransition = React.useCallback(async () => {
    const reasonPublic = normalizeText(denyReasonPublic);
    if (!reasonPublic) {
      setDenyDialogError("Public rejection reason is required.");
      return;
    }
    const ids = Array.isArray(denyDialogState.applicationIds)
      ? denyDialogState.applicationIds
      : [];
    if (ids.length === 0) {
      closeDenyDialog();
      return;
    }
    setDenyDialogError("");
    await runTransition(ids, "denied", {
      rejectedReasonPublic: reasonPublic,
      rejectedReasonInternal: normalizeText(denyReasonInternal),
    });
    closeDenyDialog();
  }, [
    closeDenyDialog,
    denyDialogState.applicationIds,
    denyReasonInternal,
    denyReasonPublic,
    runTransition,
  ]);

  const handleBulkAction = React.useCallback(
    (targetStatus) => requestTransition(selectedIds, targetStatus),
    [requestTransition, selectedIds]
  );

  const handleExportCsv = React.useCallback(() => {
    const sourceRows =
      selectedIds.length > 0 ? selectedApplications : filteredApplications;
    if (!Array.isArray(sourceRows) || sourceRows.length === 0) {
      toast.push({
        title: "No applications to export",
        status: "warning",
      });
      return;
    }

    const headers = [
      "Application ID",
      "Applicant Name",
      "Applicant Email",
      "Applicant Phone",
      "Status",
      "Submitted At",
      "Position",
      "Event",
      "Has Performed Role Before",
      "Referral",
      "Notes",
      "Rejected Reason (Public)",
      "Rejected Reason (Internal)",
    ];

    const lines = [
      headers.join(","),
      ...sourceRows.map((application) => {
        const performedRoleBefore =
          typeof application?.hasPerformedRoleBefore === "boolean"
            ? application.hasPerformedRoleBefore
              ? "Yes"
              : "No"
            : "";
        const row = [
          application?.applicationId || "",
          application?.applicantName || "",
          application?.applicantEmail || "",
          application?.applicantPhone || "",
          STATUS_LABELS[normalizeStatus(application?.status)] || application?.status || "",
          application?.submittedAt || application?._createdAt || "",
          getPositionName(application),
          getEventLabel(application),
          performedRoleBefore,
          application?.referral || "",
          application?.notes || "",
          application?.rejectedReasonPublic || "",
          application?.rejectedReasonInternal || "",
        ];
        return row.map(csvEscape).join(",");
      }),
    ];

    const csvText = lines.join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const now = new Date();
    const dateStamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    const filename = `volunteer-applications-${dateStamp}.csv`;

    if (typeof document === "undefined") {
      toast.push({
        title: "Export failed",
        status: "error",
        description: "Document context is unavailable.",
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    toast.push({
      title: "Export complete",
      status: "success",
      description: `${sourceRows.length} application${
        sourceRows.length === 1 ? "" : "s"
      } exported.`,
    });
  }, [filteredApplications, selectedApplications, selectedIds.length, toast]);

  const title = props?.title || "Volunteer Applications";

  return (
    <Box padding={4} style={{ height: "100%", overflow: "auto" }}>
      <Stack space={4}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Stack space={2}>
            <Text size={3} weight="semibold">
              {title}
            </Text>
            <Text size={1} muted>
              {filteredApplications.length} shown of {applications.length} total applications
            </Text>
          </Stack>
          <Flex align="center" gap={2} wrap="wrap">
            <Button
              mode="ghost"
              disabled={
                isApplyingAction ||
                isLoading ||
                (selectedIds.length > 0
                  ? selectedApplications.length === 0
                  : filteredApplications.length === 0)
              }
              onClick={handleExportCsv}
            >
              <Flex as="span" align="center" gap={2}>
                <DownloadIcon />
                <Text size={1}>Export CSV</Text>
              </Flex>
            </Button>
            <Button
              mode="default"
              tone="primary"
              disabled={isLoading || isApplyingAction}
              onClick={fetchApplications}
            >
              <Flex as="span" align="center" gap={2}>
                <RefreshIcon />
                <Text size={1}>{isLoading ? "Refreshing..." : "Refresh"}</Text>
              </Flex>
            </Button>
          </Flex>
        </Flex>

        <Card padding={3} border radius={2}>
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Filters
            </Text>
            <Flex wrap="wrap" gap={3}>
              {!lockStatusFilter && (
                <label style={{ minWidth: "160px" }}>
                  <Text size={1} muted>
                    Status
                  </Text>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.currentTarget.value)}
                    style={{ width: "100%", padding: "6px 8px", marginTop: "4px" }}
                  >
                    <option value="all">All statuses</option>
                    {Object.keys(STATUS_LABELS).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label style={{ minWidth: "220px" }}>
                <Text size={1} muted>
                  Position
                </Text>
                <select
                  value={positionFilter}
                  onChange={(event) => setPositionFilter(event.currentTarget.value)}
                  style={{ width: "100%", padding: "6px 8px", marginTop: "4px" }}
                >
                  <option value="all">All positions</option>
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ minWidth: "180px" }}>
                <Text size={1} muted>
                  Event
                </Text>
                <select
                  value={eventFilter}
                  onChange={(event) => setEventFilter(event.currentTarget.value)}
                  style={{ width: "100%", padding: "6px 8px", marginTop: "4px" }}
                >
                  <option value="all">All events</option>
                  {eventOptions.map((eventLabel) => (
                    <option key={eventLabel} value={eventLabel}>
                      {eventLabel}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ minWidth: "180px" }}>
                <Text size={1} muted>
                  Submitted from
                </Text>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.currentTarget.value)}
                  style={{ width: "100%", padding: "6px 8px", marginTop: "4px" }}
                />
              </label>

              <label style={{ minWidth: "180px" }}>
                <Text size={1} muted>
                  Submitted to
                </Text>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.currentTarget.value)}
                  style={{ width: "100%", padding: "6px 8px", marginTop: "4px" }}
                />
              </label>
            </Flex>
          </Stack>
        </Card>

        <Card padding={3} border radius={2} tone="transparent">
          <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
            <Text size={1}>
              {selectedIds.length} selected
            </Text>
            <Flex align="center" gap={2} wrap="wrap">
              {actionTargets.map((targetStatus) => {
                const definition = ACTION_DEFINITIONS[targetStatus];
                if (!definition) return null;
                const actionCount = selectedActionAvailability[targetStatus] || 0;
                const buttonProps = {};
                if (definition.tone) buttonProps.tone = definition.tone;
                if (definition.mode) buttonProps.mode = definition.mode;
                const prefix =
                  targetStatus === "assigned" ? "✓" : targetStatus === "denied" ? "✕" : null;

                return (
                  <Button
                    key={`bulk-action-${targetStatus}`}
                    disabled={isApplyingAction || actionCount === 0}
                    onClick={() => handleBulkAction(targetStatus)}
                    {...buttonProps}
                  >
                    <Flex as="span" align="center" gap={2}>
                      <Text size={1}>{prefix || ""}</Text>
                      <Text size={1}>{`${definition.bulkLabel} (${actionCount})`}</Text>
                    </Flex>
                  </Button>
                );
              })}
              <Button
                text="Clear"
                mode="bleed"
                disabled={selectedIds.length === 0 || isApplyingAction}
                onClick={() => setSelectedIds([])}
              />
            </Flex>
          </Flex>
        </Card>

        {error && (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {isLoading && (
          <Flex align="center" gap={2}>
            <Spinner muted />
            <Text size={1} muted>
              Loading applications...
            </Text>
          </Flex>
        )}

        {!isLoading && filteredApplications.length === 0 && (
          <Card padding={3} border radius={2}>
            <Text size={1} muted>
              No applications match the current filters.
            </Text>
          </Card>
        )}

        {!isLoading && groupedApplications.length > 0 && (
          <Card padding={0} border radius={2} overflow="hidden">
            <Box style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "940px" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--card-hairline-soft-color)",
                      background: "var(--card-code-bg-color)",
                    }}
                  >
                    <th style={{ textAlign: "left", padding: "10px" }}>
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Select all filtered applications"
                      />
                    </th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Applicant</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>Submitted</th>
                    <th style={{ textAlign: "left", padding: "10px" }}>
                      {isDeniedOnlyPane ? "Reason" : "Event"}
                    </th>
                    <th style={{ textAlign: "right", padding: "10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedApplications.map((group) => {
                    const positionId = group.positionId;
                    const assignedCount = positionId
                      ? assignedCountByPosition.get(positionId) || 0
                      : 0;
                    const groupRepresentative = group.rows?.[0] || null;
                    const capacityNumber = getEffectiveCapacityLimit(groupRepresentative);
                    const capacityLabel = capacityNumber
                      ? `${assignedCount} assigned / ${capacityNumber}`
                      : `${assignedCount} assigned / unlimited`;
                    const isFull = capacityNumber ? assignedCount >= capacityNumber : false;
                    const showCapacityLabel = group.rows.some((row) => {
                      const rowStatus = normalizeStatus(row?.status);
                      return rowStatus === "submitted" || rowStatus === "assigned";
                    });

                    return (
                      <React.Fragment key={group.key}>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--card-hairline-soft-color)",
                            background: "var(--card-code-bg-color)",
                          }}
                        >
                          <td colSpan={7} style={{ padding: "10px" }}>
                            <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                              <Stack space={1}>
                                <Text size={1} weight="semibold">
                                  {group.positionName}
                                </Text>
                                {group.eventLabel ? (
                                  <Text size={0} muted>
                                    {group.eventLabel}
                                  </Text>
                                ) : null}
                              </Stack>
                              {showCapacityLabel ? (
                                <Text
                                  size={1}
                                  style={{
                                    color: isFull
                                      ? "var(--card-critical-fg-color, #7f1d1d)"
                                      : "var(--card-fg-color)",
                                    fontWeight: isFull ? 700 : 500,
                                  }}
                                >
                                  {capacityLabel}
                                </Text>
                              ) : null}
                            </Flex>
                          </td>
                        </tr>
                        {group.rows.map((application) => {
                          const applicationStatus = normalizeStatus(application.status);
                          const isSelected = selectedIds.includes(application._id);
                          const statusStyle = getStatusBadgeStyle(applicationStatus);

                          return (
                            <tr
                              key={application._id}
                              style={{
                                borderBottom: "1px solid var(--card-hairline-soft-color)",
                              }}
                            >
                              <td style={{ padding: "10px" }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRowSelection(application._id)}
                                  aria-label={`Select ${application.applicantName || "application"}`}
                                />
                              </td>
                              <td style={{ padding: "10px" }}>{application.applicantName || "-"}</td>
                              <td style={{ padding: "10px" }}>{application.applicantEmail || "-"}</td>
                              <td style={{ padding: "10px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    borderRadius: "999px",
                                    border: `1px solid ${statusStyle.borderColor}`,
                                    background: statusStyle.backgroundColor,
                                    color: statusStyle.color,
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    padding: "3px 8px",
                                  }}
                                >
                                  {STATUS_LABELS[applicationStatus] || applicationStatus}
                                </span>
                              </td>
                              <td style={{ padding: "10px" }}>
                                {formatDateTime(application.submittedAt || application._createdAt)}
                              </td>
                              <td style={{ padding: "10px" }}>
                                {isDeniedOnlyPane
                                  ? normalizeText(application?.rejectedReasonPublic) || "-"
                                  : (() => {
                                      const eventLabel = getEventLabel(application);
                                      const eventHref = getEventHref(application);
                                      if (!eventLabel) return "-";
                                      if (!eventHref) return eventLabel;
                                      return (
                                        <a
                                          href={eventHref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            fontSize: "12px",
                                            textDecoration: "none",
                                          }}
                                        >
                                          {eventLabel}
                                        </a>
                                      );
                                    })()}
                              </td>
                              <td style={{ padding: "10px", textAlign: "right" }}>
                                <Flex align="center" justify="flex-end" gap={2} wrap="wrap">
                                  {actionTargets.map((targetStatus) => {
                                    const definition = ACTION_DEFINITIONS[targetStatus];
                                    if (!definition) return null;
                                    if (!canTransition(applicationStatus, targetStatus)) {
                                      return null;
                                    }

                                    const isAssignAction = targetStatus === "assigned";
                                    const isAssignBlockedByCapacity = isAssignAction && isFull;
                                    const actionLabel =
                                      targetStatus === "withdrawn" &&
                                      applicationStatus === "assigned"
                                        ? "Remove"
                                        : definition.label;
                                    const actionPrefix =
                                      targetStatus === "assigned"
                                        ? "✓"
                                        : targetStatus === "denied"
                                        ? "✕"
                                        : "";
                                    const actionTitle = isAssignBlockedByCapacity
                                      ? "Capacity is full for this position."
                                      : actionLabel;

                                    return (
                                      <button
                                        key={`${application._id}-${targetStatus}`}
                                        type="button"
                                        disabled={
                                          isApplyingAction ||
                                          isAssignBlockedByCapacity
                                        }
                                        onClick={() =>
                                          requestTransition(
                                            [application._id],
                                            targetStatus,
                                          )
                                        }
                                        title={actionTitle}
                                        style={compactButtonStyle}
                                      >
                                        {targetStatus === "withdrawn" ? (
                                          <span
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px",
                                            }}
                                          >
                                            {applicationStatus === "assigned" ? (
                                              <TrashIcon />
                                            ) : null}
                                            {actionLabel}
                                          </span>
                                        ) : (
                                          `${actionPrefix} ${actionLabel}`
                                        )}
                                      </button>
                                    );
                                  })}
                                </Flex>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Card>
        )}

        {denyDialogState.open && (
          <Dialog
            id="volunteer-deny-reason-dialog"
            header="Deny application"
            width={1}
            onClose={closeDenyDialog}
          >
            <Box padding={4}>
              <Stack space={4}>
                <Text size={1} muted>
                  Provide a public reason shown to the applicant. You can also
                  add an optional internal note.
                </Text>
                <Stack space={2}>
                  <Text size={1} weight="semibold">
                    Public reason (required)
                  </Text>
                  <TextArea
                    rows={4}
                    value={denyReasonPublic}
                    onChange={(event) => {
                      setDenyReasonPublic(event.currentTarget.value || "");
                      if (denyDialogError) setDenyDialogError("");
                    }}
                    placeholder="Explain why this application was denied."
                  />
                </Stack>
                <Stack space={2}>
                  <Text size={1} weight="semibold">
                    Internal note (optional)
                  </Text>
                  <TextArea
                    rows={3}
                    value={denyReasonInternal}
                    onChange={(event) =>
                      setDenyReasonInternal(event.currentTarget.value || "")
                    }
                    placeholder="Internal context for staff."
                  />
                </Stack>
                {denyDialogError ? (
                  <Text
                    size={1}
                    style={{ color: "var(--card-critical-fg-color, #7f1d1d)" }}
                  >
                    {denyDialogError}
                  </Text>
                ) : null}
                <Flex justify="flex-end" gap={2}>
                  <Button
                    mode="ghost"
                    text="Cancel"
                    disabled={isApplyingAction}
                    onClick={closeDenyDialog}
                  />
                  <Button
                    tone="critical"
                    text={
                      denyDialogState.applicationIds.length > 1
                        ? `Deny ${denyDialogState.applicationIds.length} applications`
                        : "Deny application"
                    }
                    disabled={isApplyingAction}
                    onClick={confirmDenyTransition}
                  />
                </Flex>
              </Stack>
            </Box>
          </Dialog>
        )}
      </Stack>
    </Box>
  );
}
