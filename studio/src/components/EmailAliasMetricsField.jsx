import React from "react";
import { useEditState, useFormValue } from "sanity";

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const EmailAliasMetricsField = (props) => {
  const documentId = useFormValue(["_id"]);
  const publishedDocumentId = normalizeDocumentId(documentId);
  const editState = useEditState(publishedDocumentId, "emailAlias");

  if (!publishedDocumentId || !editState?.published) {
    return null;
  }

  return props.renderDefault(props);
};

export default EmailAliasMetricsField;
