import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, Flex, Spinner, Stack, Text, useRootTheme } from "@sanity/ui";
import { useFormValue } from "sanity";
import { RefreshIcon } from "@sanity/icons";

const webhookUrl =
  process.env.SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_URL ||
  process.env.VITE_EMAIL_ALIAS_SYNC_WEBHOOK_URL ||
  "";

const webhookToken =
  process.env.SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN ||
  process.env.VITE_EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN ||
  "";

const DAYS = 7;
const CHART_WIDTH = 520;
const CHART_HEIGHT = 180;
const CHART_PAD_LEFT = 36;
const CHART_PAD_RIGHT = 10;
const CHART_PAD_TOP = 10;
const CHART_PAD_BOTTOM = 18;

const normalizeAlias = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/@.*$/, "");

const formatDayLabel = (day) => {
  const date = new Date(`${day}T00:00:00.000Z`);
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
};

const buildLinePoints = (series, valueKey, maxValue) =>
  series.map((point, index) => {
    const value = Number(point?.[valueKey] || 0);
    const innerWidth = CHART_WIDTH - CHART_PAD_LEFT - CHART_PAD_RIGHT;
    const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
    return {
      day: point.day,
      value,
      x:
        series.length === 1
          ? CHART_PAD_LEFT + innerWidth / 2
          : CHART_PAD_LEFT + (index / (series.length - 1)) * innerWidth,
      y:
        maxValue > 0
          ? CHART_PAD_TOP + innerHeight - (value / maxValue) * innerHeight
          : CHART_PAD_TOP + innerHeight,
    };
  });

const buildLinePath = (points) => {
  if (!points.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
};

const buildAreaPath = (points) => {
  if (!points.length) return "";

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const baselineY = CHART_HEIGHT - CHART_PAD_BOTTOM;

  return [
    `M ${firstPoint.x} ${baselineY}`,
    ...points.map((point, index) => `${index === 0 ? "L" : "L"} ${point.x} ${point.y}`),
    `L ${lastPoint.x} ${baselineY}`,
    "Z",
  ].join(" ");
};

const formatAverageRatio = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const EmailAliasMetricsInput = () => {
  const aliasName = normalizeAlias(useFormValue(["name"]));
  const documentId = useFormValue(["_id"]);
  const { scheme } = useRootTheme();
  const [refreshToken, setRefreshToken] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [state, setState] = useState({
    loading: false,
    error: "",
    metrics: null,
  });

  useEffect(() => {
    if (!aliasName) {
      setState({ loading: false, error: "", metrics: null });
      return undefined;
    }

    if (!webhookUrl) {
      setState({
        loading: false,
        error: "Configure SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_URL to load alias activity.",
        metrics: null,
      });
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    setState((current) => ({
      loading: true,
      error: "",
      metrics: current.metrics?.aliasName === aliasName ? current.metrics : null,
    }));

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            ...(webhookToken ? { "x-email-alias-sync-token": webhookToken } : {}),
          },
          signal: controller.signal,
          body: JSON.stringify({
            operation: "email_alias_metrics",
            aliasName,
            days: DAYS,
          }),
        });

        const text = await response.text();
        let payload = {};

        try {
          payload = text ? JSON.parse(text) : {};
        } catch (_error) {
          payload = {};
        }

        if (!response.ok) {
          throw new Error(
            payload?.error || `Metrics request failed with ${response.status}.`,
          );
        }

        if (cancelled) return;

        setState({
          loading: false,
          error: "",
          metrics: payload?.metrics || null,
        });
      } catch (error) {
        if (cancelled || error?.name === "AbortError") return;

        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load alias activity.",
          metrics: null,
        });
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [aliasName, documentId, refreshToken]);

  const series = Array.isArray(state.metrics?.series) ? state.metrics.series : [];
  const maxValue = useMemo(
    () =>
      series.reduce(
        (currentMax, point) =>
          Math.max(
            currentMax,
            Number(point?.received || 0),
            Number(point?.delivered || 0),
          ),
        0,
      ),
    [series],
  );
  const receivedPoints = useMemo(
    () => buildLinePoints(series, "received", maxValue),
    [maxValue, series],
  );
  const deliveredPoints = useMemo(
    () => buildLinePoints(series, "delivered", maxValue),
    [maxValue, series],
  );
  const averageForwardedPerMessage = useMemo(() => {
    const received = Number(state.metrics?.totals?.received || 0);
    const delivered = Number(state.metrics?.totals?.delivered || 0);
    if (received <= 0) return "0";
    return formatAverageRatio(delivered / received);
  }, [state.metrics]);
  const averageMessagesPerDay = useMemo(() => {
    if (series.length === 0) return "0";
    const received = Number(state.metrics?.totals?.received || 0);
    return formatAverageRatio(received / series.length);
  }, [series, state.metrics]);
  const averageMessagesPoints = useMemo(
    () =>
      buildLinePoints(
        series.map((point) => ({
          ...point,
          averageMessages: Number(averageMessagesPerDay),
        })),
        "averageMessages",
        maxValue,
      ),
    [averageMessagesPerDay, maxValue, series],
  );
  const receivedPath = useMemo(() => buildLinePath(receivedPoints), [receivedPoints]);
  const deliveredPath = useMemo(() => buildLinePath(deliveredPoints), [deliveredPoints]);
  const averageMessagesPath = useMemo(
    () => buildLinePath(averageMessagesPoints),
    [averageMessagesPoints],
  );
  const deliveredAreaPath = useMemo(
    () => buildAreaPath(deliveredPoints),
    [deliveredPoints],
  );
  const yAxisTicks = useMemo(() => {
    const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
    const tickMax = Math.max(1, maxValue);
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      label: Math.round(tickMax * ratio),
      y: CHART_PAD_TOP + innerHeight - innerHeight * ratio,
    }));
  }, [maxValue]);
  const isDarkMode = String(scheme || "")
    .toLowerCase()
    .includes("dark");
  const axisLabelColor = isDarkMode ? "rgba(255,255,255,0.78)" : "rgba(18,21,26,0.66)";
  const gridColor = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(18,21,26,0.08)";
  const axisLineColor = isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(18,21,26,0.14)";
  const chartBackground = isDarkMode
    ? "linear-gradient(180deg, rgba(30,148,255,0.14), rgba(67,160,71,0.08))"
    : "linear-gradient(180deg, rgba(30,148,255,0.06), rgba(67,160,71,0.02))";
  const tooltipBackground = isDarkMode ? "#111827" : "#ffffff";
  const tooltipBorder = isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(18,21,26,0.12)";
  const tooltipText = isDarkMode ? "#f3f4f6" : "#111827";
  const averageMessagesCardBackground = isDarkMode
    ? "rgba(217,119,6,0.14)"
    : "rgba(217,119,6,0.10)";
  const averageMessagesTextColor = isDarkMode ? "#f59e0b" : "#b45309";

  const showTooltip = (point, label) => {
    setTooltip({
      label,
      value: point.value,
      day: point.day,
      xPercent: (point.x / CHART_WIDTH) * 100,
      yPercent: (point.y / CHART_HEIGHT) * 100,
    });
  };

  if (!aliasName) {
    return (
      <Card border padding={4} radius={2} tone="caution">
        <Text size={1}>Enter an alias name to load the last 7 days of activity.</Text>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      <Card border padding={4} radius={2}>
        <Stack space={4}>
          {state.loading && !state.metrics ? (
            <Flex align="center" gap={3}>
              <Spinner muted />
              <Text size={1}>Loading activity…</Text>
            </Flex>
          ) : null}

          {state.error ? (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>{state.error}</Text>
            </Card>
          ) : null}

          {state.metrics ? (
            <Stack space={4}>
              <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                <Flex align="stretch" gap={3} wrap="wrap">
                  <Card padding={3} radius={2} tone="primary">
                    <Stack space={1}>
                      <Text muted size={1}>
                        Received
                      </Text>
                      <Text size={3} weight="semibold">
                        {Number(state.metrics?.totals?.received || 0)}
                      </Text>
                    </Stack>
                  </Card>
                  <Card padding={3} radius={2} tone="positive">
                    <Stack space={1}>
                      <Text muted size={1}>
                        Forwarded
                      </Text>
                      <Text size={3} weight="semibold">
                        {Number(state.metrics?.totals?.delivered || 0)}
                      </Text>
                    </Stack>
                  </Card>
                  <Card padding={3} radius={2} tone="caution">
                    <Stack space={1}>
                      <Text muted size={1}>
                        Avg Fwds / Msg
                      </Text>
                      <Text size={3} weight="semibold">
                        {averageForwardedPerMessage}
                    </Text>
                  </Stack>
                </Card>
                  <Card
                    padding={3}
                    radius={2}
                    tone="transparent"
                    style={{
                      background: averageMessagesCardBackground,
                    }}
                  >
                    <Stack space={1}>
                      <Text size={1} style={{ color: averageMessagesTextColor }}>
                        Avg Msgs / Day
                      </Text>
                      <Text
                        size={3}
                        weight="semibold"
                        style={{ color: averageMessagesTextColor }}
                      >
                        {averageMessagesPerDay}
                      </Text>
                    </Stack>
                  </Card>
                </Flex>
                <Flex align="center" marginLeft="auto">
                  <Button
                    mode="ghost"
                    icon={RefreshIcon}
                    onClick={() => setRefreshToken((value) => value + 1)}
                    text="Refresh"
                  />
                </Flex>
              </Flex>

              <Stack space={3}>
                <Flex gap={4} wrap="wrap">
                  <Flex align="center" gap={2}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#1e94ff",
                      }}
                    />
                    <Text size={1}>Received</Text>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#43a047",
                      }}
                    />
                    <Text size={1}>Forwarded</Text>
                  </Flex>
                  <Flex align="center" gap={2}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#d97706",
                      }}
                    />
                    <Text size={1}>Avg Msgs / Day</Text>
                  </Flex>
                </Flex>

                {series.length > 0 ? (
                  <Stack space={3}>
                    <Card
                      padding={3}
                      radius={2}
                      tone="transparent"
                      style={{
                        position: "relative",
                        background: chartBackground,
                      }}
                    >
                      {tooltip ? (
                        <Box
                          style={{
                            position: "absolute",
                            left: `${tooltip.xPercent}%`,
                            top: `${tooltip.yPercent}%`,
                            transform: "translate(-50%, calc(-100% - 10px))",
                            pointerEvents: "none",
                            zIndex: 2,
                            background: tooltipBackground,
                            color: tooltipText,
                            border: `1px solid ${tooltipBorder}`,
                            borderRadius: 8,
                            padding: "8px 10px",
                            boxShadow: isDarkMode
                              ? "0 10px 24px rgba(0,0,0,0.45)"
                              : "0 10px 24px rgba(15,23,42,0.16)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Stack space={1}>
                            <Text size={1} style={{ color: tooltipText }}>
                              {formatDayLabel(tooltip.day)}
                            </Text>
                            <Text size={1} weight="semibold" style={{ color: tooltipText }}>
                              {tooltip.label}: {tooltip.value}
                            </Text>
                          </Stack>
                        </Box>
                      ) : null}
                      <svg
                        aria-label="Alias activity line chart"
                        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                        style={{ display: "block", width: "100%", height: 200 }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {yAxisTicks.map((tick) => {
                          return (
                            <g key={tick.y}>
                              <text
                                x={CHART_PAD_LEFT - 8}
                                y={tick.y + 4}
                                fill={axisLabelColor}
                                fontSize="11"
                                textAnchor="end"
                              >
                                {tick.label}
                              </text>
                              <line
                                x1={CHART_PAD_LEFT}
                                x2={CHART_WIDTH - CHART_PAD_RIGHT}
                                y1={tick.y}
                                y2={tick.y}
                                stroke={gridColor}
                                strokeWidth="1"
                              />
                            </g>
                          );
                        })}
                        <line
                          x1={CHART_PAD_LEFT}
                          x2={CHART_PAD_LEFT}
                          y1={CHART_PAD_TOP}
                          y2={CHART_HEIGHT - CHART_PAD_BOTTOM}
                          stroke={axisLineColor}
                          strokeWidth="1"
                        />
                        {deliveredAreaPath ? (
                          <path
                            d={deliveredAreaPath}
                            fill="rgba(67,160,71,0.14)"
                            stroke="none"
                          />
                        ) : null}
                        {deliveredPath ? (
                          <path
                            d={deliveredPath}
                            fill="none"
                            stroke="#43a047"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : null}
                        {receivedPath ? (
                          <path
                            d={receivedPath}
                            fill="none"
                            stroke="#1e94ff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : null}
                        {averageMessagesPath ? (
                          <path
                            d={averageMessagesPath}
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="2"
                            strokeDasharray="6 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : null}
                        {deliveredPoints.map((point) => (
                          <g key={`delivered-${point.day}`}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill="#43a047"
                            />
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="10"
                              fill="transparent"
                              style={{ cursor: "pointer" }}
                              onMouseEnter={() => showTooltip(point, "Forwarded")}
                              onMouseMove={() => showTooltip(point, "Forwarded")}
                            />
                          </g>
                        ))}
                        {averageMessagesPoints.map((point) => (
                          <g key={`avg-messages-${point.day}`}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="3.5"
                              fill="#d97706"
                            />
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="10"
                              fill="transparent"
                              style={{ cursor: "pointer" }}
                              onMouseEnter={() => showTooltip(point, "Avg Msgs / Day")}
                              onMouseMove={() => showTooltip(point, "Avg Msgs / Day")}
                            />
                          </g>
                        ))}
                        {receivedPoints.map((point) => (
                          <g key={`received-${point.day}`}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="4"
                              fill="#1e94ff"
                            />
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="10"
                              fill="transparent"
                              style={{ cursor: "pointer" }}
                              onMouseEnter={() => showTooltip(point, "Received")}
                              onMouseMove={() => showTooltip(point, "Received")}
                            />
                          </g>
                        ))}
                      </svg>
                    </Card>

                    <Flex gap={2}>
                      {series.map((point) => (
                        <Card
                          key={point.day}
                          padding={2}
                          radius={2}
                          tone="transparent"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <Text align="center" muted size={1}>
                            {formatDayLabel(point.day)}
                          </Text>
                        </Card>
                      ))}
                    </Flex>
                  </Stack>
                ) : (
                  <Card padding={3} radius={2} tone="transparent">
                    <Text size={1}>No alias activity was found for the last 7 days.</Text>
                  </Card>
                )}
              </Stack>

              {state.loading ? (
                <Flex align="center" gap={3}>
                  <Spinner muted />
                  <Text muted size={1}>
                    Refreshing…
                  </Text>
                </Flex>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
};

export default EmailAliasMetricsInput;
