"use client";

import type { Question } from "@/config/form";
import { TextField } from "./fields/TextField";
import { TextareaField } from "./fields/TextareaField";
import { ChoiceField } from "./fields/ChoiceField";
import { CountryPhoneField } from "./fields/CountryPhoneField";
import { DateField } from "./fields/DateField";
import { CheckboxField } from "./fields/CheckboxField";
import { UrlField } from "./fields/UrlField";
import { CascadingChoiceField } from "./fields/CascadingChoiceField";
import { FileCloudinaryField } from "./fields/FileCloudinaryField";
import { GroupMembersField } from "./fields/GroupMembersField";
import { formatGeoLabel } from "@/data/benin";

type Props = {
  question: Question;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
};

export function InputRenderer({ question, value, onChange, onSubmit }: Props) {
  switch (question.type) {
    case "choice":
      return (
        <ChoiceField
          choices={question.choices ?? []}
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      );
    case "textarea":
      return (
        <TextareaField
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
        />
      );
    case "country_phone":
      return (
        <CountryPhoneField
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
        />
      );
    case "email":
      return (
        <TextField
          type="email"
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
          autoComplete="email"
        />
      );
    case "phone":
      return (
        <TextField
          type="tel"
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
          autoComplete="tel"
        />
      );
    case "number":
      return (
        <TextField
          type="number"
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
        />
      );
    case "date":
      return <DateField value={value} onChange={onChange} onSubmit={onSubmit} />;
    case "checkbox":
      return (
        <CheckboxField
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          label={question.checkboxLabel ?? "J'accepte."}
        />
      );
    case "url":
      return (
        <UrlField
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
        />
      );
    case "cascading_choice":
      return (
        <CascadingChoiceField value={value} onChange={onChange} onSubmit={onSubmit} />
      );
    case "file_cloudinary":
      return (
        <FileCloudinaryField value={value} onChange={onChange} onSubmit={onSubmit} />
      );
    case "group_members":
      return (
        <GroupMembersField
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          max={question.groupMax ?? 4}
        />
      );
    default:
      return (
        <TextField
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder={question.placeholder}
        />
      );
  }
}

export function formatAnswerForDisplay(question: Question, value: string): string {
  if (!value) return "";
  switch (question.type) {
    case "choice": {
      const c = question.choices?.find((c) => c.value === value);
      return c?.label ?? value;
    }
    case "cascading_choice":
      return formatGeoLabel(value);
    case "checkbox":
      return value === "true" ? "Accepté" : "";
    case "date": {
      // "YYYY-MM-DD" → "12 mars 2001"
      const d = new Date(value + "T00:00:00");
      if (Number.isNaN(d.getTime())) return value;
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    case "group_members": {
      try {
        const arr = JSON.parse(value) as { first: string; last: string }[];
        if (!Array.isArray(arr) || arr.length === 0) return "";
        return arr
          .map((m) => `${m.first ?? ""} ${m.last ?? ""}`.trim())
          .filter(Boolean)
          .join(", ");
      } catch {
        return value;
      }
    }
    case "file_cloudinary":
      return "📎 Photo ajoutée";
    default:
      return value;
  }
}
