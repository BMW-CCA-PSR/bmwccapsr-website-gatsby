import React, { useEffect, useRef } from "react";
import { useClient, useFormValue } from "sanity";
import {
  buildIssueTitle,
  getIssueMonthSortValue,
} from "../lib/zundfolgeIssueTitle";

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const ZundfolgeIssuePublishYearInput = (props) => {
  const { renderDefault } = props;
  const client = useClient({ apiVersion: "2024-06-01" });
  const docIdValue = useFormValue(["_id"]);
  const publishMonthValue = useFormValue(["publishMonth"]);
  const publishYearValue = useFormValue(["publishYear"]);
  const titleValue = useFormValue(["title"]);
  const publishMonthSortValue = useFormValue(["publishMonthSort"]);
  const lastPatchedTitleRef = useRef("");

  useEffect(() => {
    const resolvedDocumentId = normalizeDocumentId(docIdValue);
    if (!resolvedDocumentId) return;

    const computedTitle = buildIssueTitle(publishMonthValue, publishYearValue);
    const nextMonthSortValue = getIssueMonthSortValue(publishMonthValue);
    if (!computedTitle && publishMonthSortValue === nextMonthSortValue) return;

    const currentTitle = String(titleValue || "").trim();
    const hasTitleChanged = computedTitle && currentTitle !== computedTitle;
    const hasSortChanged = publishMonthSortValue !== nextMonthSortValue;
    if (!hasTitleChanged && !hasSortChanged) return;
    if (lastPatchedTitleRef.current === computedTitle && !hasSortChanged) return;

    lastPatchedTitleRef.current = computedTitle;

    client
      .patch(resolvedDocumentId)
      .set({
        ...(computedTitle ? { title: computedTitle } : {}),
        publishMonthSort: nextMonthSortValue,
      })
      .commit()
      .catch(() => {
        lastPatchedTitleRef.current = "";
      });
  }, [
    client,
    docIdValue,
    publishMonthSortValue,
    publishMonthValue,
    publishYearValue,
    titleValue,
  ]);

  return renderDefault(props);
};

export default ZundfolgeIssuePublishYearInput;