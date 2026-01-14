import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { ResumeData } from "../types";

type ResumeFormProps = {
  value: ResumeData;
  onChange: (data: ResumeData) => void;
};

type FormValues = {
  name: string;
  contact: string;
  summary: string;
  skills: string;
  rawJson: string;
};

const ResumeForm: React.FC<ResumeFormProps> = ({ value, onChange }) => {
  const defaultValues: FormValues = useMemo(
    () => ({
      name: value.name,
      contact: value.contact,
      summary: value.summary,
      skills: value.skills.join(", "),
      rawJson: JSON.stringify(value, null, 2),
    }),
    [value]
  );

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const subscription = watch((form) => {
      const skillsArray =
        form.skills
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? [];

      let parsed: ResumeData | null = null;
      try {
        parsed = JSON.parse(form.rawJson) as ResumeData;
      } catch {
        // Ignore JSON parse errors; fall back to field-based data.
      }

      const next: ResumeData = parsed
        ? parsed
        : {
            ...value,
            name: form.name,
            contact: form.contact,
            summary: form.summary,
            skills: skillsArray,
          };

      onChange(next);
    });
    return () => subscription.unsubscribe();
  }, [onChange, value, watch]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Full name
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="mt-1 block w-full rounded-lg border-dark-border bg-dark-surface px-3 py-2 text-sm text-white shadow-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50 transition-all"
            style={{ backgroundColor: '#111111', color: '#fafafa' }}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-red-400">
              Name is required.
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Contact
          </label>
          <input
            type="text"
            {...register("contact")}
            className="mt-1 block w-full rounded-lg border-dark-border bg-dark-surface px-3 py-2 text-sm text-white shadow-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50 transition-all"
            style={{ backgroundColor: '#111111', color: '#fafafa' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Summary
          </label>
          <textarea
            rows={3}
            {...register("summary")}
            className="mt-1 block w-full rounded-lg border-dark-border bg-dark-surface px-3 py-2 text-sm text-white shadow-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50 transition-all resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Skills (comma separated)
          </label>
          <input
            type="text"
            {...register("skills")}
            className="mt-1 block w-full rounded-lg border-dark-border bg-dark-surface px-3 py-2 text-sm text-white shadow-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50 transition-all"
            style={{ backgroundColor: '#111111', color: '#fafafa' }}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Resume JSON (advanced)
        </label>
        <textarea
          rows={10}
          {...register("rawJson")}
          className="font-mono text-xs mt-1 block w-full rounded-lg border-dark-border bg-dark-card px-3 py-2 text-white shadow-sm focus:border-accent-purple focus:ring-2 focus:ring-accent-purple focus:ring-opacity-50 transition-all resize-none"
          style={{ backgroundColor: '#1a1a1a', color: '#fafafa' }}
        />
        <p className="mt-1 text-[10px] text-gray-500">
          You can directly edit the parsed JSON here. Valid JSON will override
          the fields above.
        </p>
      </div>
    </div>
  );
};

export default ResumeForm;
