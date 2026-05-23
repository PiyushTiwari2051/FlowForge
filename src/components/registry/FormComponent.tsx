"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Disc, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { ComponentProps } from "./index";

export default function FormComponent({ appId, table, config }: ComponentProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Look up the table structure from config
  const tableDef = config.database.tables.find((t) => t.name === table);

  const mutation = useMutation({
    mutationFn: async (newData: Record<string, any>) => {
      const res = await fetch(`/api/dynamic/${appId}/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to submit record");
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({});
      setErrors({});
      // Invalidate dynamic queries for lists
      queryClient.invalidateQueries({ queryKey: ["table-data", appId, table] });
      queryClient.invalidateQueries({ queryKey: ["card-data", appId, table] });
      queryClient.invalidateQueries({ queryKey: ["chart-data", appId, table] });

      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: any) => {
      setErrors({ form: err.message });
    },
  });

  if (!tableDef) {
    return (
      <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-6 text-center text-zinc-555 text-xs font-mono">
        Form error: Select a valid database table in configuration.
      </div>
    );
  }

  const handleChange = (fieldName: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};

    // Validate fields based on config rules
    tableDef.fields.forEach((field) => {
      const val = formData[field.name];
      if (field.required && (val === undefined || val === null || val === "")) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }
      if (field.type === "email" && val && !val.includes("@")) {
        newErrors[field.name] = "Please enter a valid email";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-5 flex flex-col gap-4.5 font-sans">
      <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
        <span className="text-zinc-150 font-bold text-xs tracking-tight flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-zinc-450" />
          Add {tableDef.displayName || table} Record
        </span>
      </div>

      {errors.form && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-450 p-3 rounded-lg flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-450 p-3 rounded-lg flex items-start gap-2 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Record created successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tableDef.fields.map((field) => {
          const id = `field_${field.name}`;
          const isError = !!errors[field.name];

          return (
            <div key={field.name} className="flex flex-col gap-1.5 font-sans">
              <label htmlFor={id} className="text-zinc-400 text-xs font-semibold flex items-center gap-1">
                <span>{field.label || field.name}</span>
                {field.required && <span className="text-amber-500">*</span>}
              </label>

              {field.type === "boolean" ? (
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    id={id}
                    type="checkbox"
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-zinc-300 focus:ring-0 cursor-pointer animate-none"
                  />
                  <span className="text-zinc-400 text-xs">Yes</span>
                </label>
              ) : field.type === "text" ? (
                <textarea
                  id={id}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.label || field.name}...`}
                  rows={3}
                  className={`w-full bg-zinc-950/65 border ${
                    isError ? "border-red-900/50" : "border-zinc-800"
                  } focus:border-zinc-550 focus:ring-0 outline-none rounded-lg py-2 px-3 text-xs text-zinc-100 placeholder-zinc-650 transition-colors`}
                />
              ) : (
                <input
                  id={id}
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "date"
                      ? "date"
                      : field.type === "email"
                      ? "email"
                      : "text"
                  }
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    handleChange(
                      field.name,
                      field.type === "number" ? parseFloat(e.target.value) || "" : e.target.value
                    )
                  }
                  placeholder={`Enter ${field.label || field.name}...`}
                  className={`w-full bg-zinc-950/65 border ${
                    isError ? "border-red-900/50" : "border-zinc-800"
                  } focus:border-zinc-550 focus:ring-0 outline-none rounded-lg py-2 px-3 text-xs text-zinc-100 placeholder-zinc-650 transition-colors`}
                />
              )}

              {isError && (
                <span className="text-red-400 text-[10px] font-medium font-sans">
                  {errors[field.name]}
                </span>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg py-2 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <Disc className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <span>Submit Record</span>
          )}
        </button>
      </form>
    </div>
  );
}
