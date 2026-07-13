"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitInsuranceLead, type InsuranceFormData } from "@/lib/insurance-actions";

const inputCls =
  "w-full h-10 px-3 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition";
const selectCls = inputCls + " cursor-pointer";
const labelCls = "block text-xs font-medium text-navy-600 mb-1.5";

type Errors = Partial<Record<string, string>>;

const TOTAL_STEPS = 5;

function Field({
  label, id, type = "text", value, error, placeholder, onChange,
}: {
  label: string; id: string; type?: string; value: string;
  error?: string; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + (error ? " border-red-300 bg-red-50" : "")}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({
  label, id, value, error, placeholder, options, onChange,
}: {
  label: string; id: string; value: string; error?: string;
  placeholder: string; options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <select
        id={id} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls + (error ? " border-red-300 bg-red-50" : "")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${
            i < current
              ? "w-2 h-2 bg-teal-500"
              : i === current
              ? "w-6 h-2 bg-teal-600"
              : "w-2 h-2 bg-navy-100"
          }`}
        />
      ))}
    </div>
  );
}

export function InsuranceForm() {
  const t = useTranslations("insurance");
  const locale = useLocale();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<Omit<InsuranceFormData, "consent"> & { consent: boolean }>({
    vessel_type: "",
    brand: "",
    model: "",
    year_built: "",
    length_m: "",
    hull_material: "",
    vessel_value_eur: "",
    flag_country: "",
    navigation_area: "",
    home_port: "",
    usage_type: "",
    season: "",
    skipper_experience_years: "",
    has_license: false,
    claims_last_5_years: false,
    claims_details: "",
    coverage_types: [],
    deductible_preference: "",
    current_insurer: "",
    policy_renewal_date: "",
    full_name: "",
    email: "",
    phone: "",
    comment: "",
    consent: false,
    _hp: "",
  });

  function set(field: keyof typeof form, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function toggleCoverage(val: string) {
    setForm((f) => ({
      ...f,
      coverage_types: f.coverage_types.includes(val)
        ? f.coverage_types.filter((c) => c !== val)
        : [...f.coverage_types, val],
    }));
  }

  function validateStep(s: number): Errors {
    const e: Errors = {};
    if (s === 0) {
      if (!form.vessel_type) e.vessel_type = t("errorRequired");
      if (!form.vessel_value_eur || Number(form.vessel_value_eur) <= 0) e.vessel_value_eur = t("errorValue");
    }
    if (s === 1) {
      if (!form.navigation_area) e.navigation_area = t("errorRequired");
      if (!form.usage_type) e.usage_type = t("errorRequired");
      if (!form.season) e.season = t("errorRequired");
    }
    if (s === 4) {
      if (!form.full_name.trim()) e.full_name = t("errorRequired");
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("errorEmail");
      if (!form.consent) e.consent = t("errorConsent");
    }
    return e;
  }

  function handleNext() {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setStep((s) => s + 1);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateStep(4);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");
    const result = await submitInsuranceLead({ ...(form as InsuranceFormData), locale });
    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }
    setSuccessId(result.id!.slice(0, 8).toUpperCase());
  }

  if (successId) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-teal-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">{t("successTitle")}</h2>
        <p className="text-navy-500 text-sm mb-6 max-w-md mx-auto">{t("successDesc")}</p>
        <div className="inline-block bg-navy-50 rounded-xl px-6 py-4 mb-6">
          <p className="text-xs text-navy-400 mb-1">{t("successRef")}</p>
          <p className="text-2xl font-mono font-bold text-teal-700">{successId}</p>
        </div>
        <div>
          <button
            onClick={() => {
              setSuccessId(null);
              setStep(0);
              setForm({
                vessel_type: "", brand: "", model: "", year_built: "", length_m: "",
                hull_material: "", vessel_value_eur: "", flag_country: "",
                navigation_area: "", home_port: "", usage_type: "", season: "",
                skipper_experience_years: "", has_license: false, claims_last_5_years: false,
                claims_details: "", coverage_types: [], deductible_preference: "",
                current_insurer: "", policy_renewal_date: "", full_name: "", email: "",
                phone: "", comment: "", consent: false, _hp: "",
              });
            }}
            className="text-sm text-teal-600 hover:text-teal-700 underline"
          >
            {t("successNew")}
          </button>
        </div>
      </div>
    );
  }

  const stepLabels = [t("step1"), t("step2"), t("step3"), t("step4"), t("step5")];

  return (
    <div>
      {/* Step header */}
      <div className="mb-6">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-1">
          {stepLabels[step]} · {step + 1}/{TOTAL_STEPS}
        </p>
        <StepDots current={step} total={TOTAL_STEPS} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          name="_hp"
          value={form._hp}
          onChange={(e) => set("_hp", e.target.value)}
          tabIndex={-1}
          aria-hidden
          style={{ display: "none" }}
        />

        {/* Step 0: Vessel */}
        {step === 0 && (
          <div className="space-y-4">
            <SelectField
              label={t("vesselType")}
              id="vessel_type"
              value={form.vessel_type}
              error={errors.vessel_type}
              placeholder={t("vesselTypePlaceholder")}
              options={[
                { value: "motor", label: t("vesselTypeMotor") },
                { value: "sailing", label: t("vesselTypeSailing") },
                { value: "catamaran", label: t("vesselTypeCatamaran") },
                { value: "rib", label: t("vesselTypeRib") },
                { value: "other", label: t("vesselTypeOther") },
              ]}
              onChange={(v) => set("vessel_type", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("brand")} id="brand" value={form.brand ?? ""} placeholder={t("brandPlaceholder")} onChange={(v) => set("brand", v)} />
              <Field label={t("model")} id="model" value={form.model ?? ""} placeholder={t("modelPlaceholder")} onChange={(v) => set("model", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("yearBuilt")} id="year_built" type="number" value={form.year_built ?? ""} placeholder={t("yearBuiltPlaceholder")} onChange={(v) => set("year_built", v)} />
              <Field label={t("lengthM")} id="length_m" type="number" value={form.length_m ?? ""} placeholder={t("lengthPlaceholder")} onChange={(v) => set("length_m", v)} />
            </div>
            <SelectField
              label={t("hullMaterial")}
              id="hull_material"
              value={form.hull_material ?? ""}
              placeholder={t("hullMaterialPlaceholder")}
              options={[
                { value: "grp", label: t("hullGrp") },
                { value: "aluminium", label: t("hullAluminium") },
                { value: "steel", label: t("hullSteel") },
                { value: "wood", label: t("hullWood") },
                { value: "other", label: t("hullOther") },
              ]}
              onChange={(v) => set("hull_material", v)}
            />
            <Field
              label={t("vesselValueEur")}
              id="vessel_value_eur"
              type="number"
              value={form.vessel_value_eur}
              error={errors.vessel_value_eur}
              placeholder={t("vesselValuePlaceholder")}
              onChange={(v) => set("vessel_value_eur", v)}
            />
            <Field label={t("flagCountry")} id="flag_country" value={form.flag_country ?? ""} placeholder={t("flagPlaceholder")} onChange={(v) => set("flag_country", v)} />
          </div>
        )}

        {/* Step 1: Usage */}
        {step === 1 && (
          <div className="space-y-4">
            <SelectField
              label={t("navigationArea")}
              id="navigation_area"
              value={form.navigation_area}
              error={errors.navigation_area}
              placeholder={t("navigationAreaPlaceholder")}
              options={[
                { value: "adriatic", label: t("areaAdriatic") },
                { value: "mediterranean", label: t("areaMediterranean") },
                { value: "worldwide", label: t("areaWorldwide") },
              ]}
              onChange={(v) => set("navigation_area", v)}
            />
            <Field label={t("homePort")} id="home_port" value={form.home_port ?? ""} placeholder={t("homePortPlaceholder")} onChange={(v) => set("home_port", v)} />
            <SelectField
              label={t("usageType")}
              id="usage_type"
              value={form.usage_type}
              error={errors.usage_type}
              placeholder={t("usageTypePlaceholder")}
              options={[
                { value: "private", label: t("usagePrivate") },
                { value: "charter", label: t("usageCharter") },
                { value: "commercial", label: t("usageCommercial") },
              ]}
              onChange={(v) => set("usage_type", v)}
            />
            <SelectField
              label={t("season")}
              id="season"
              value={form.season}
              error={errors.season}
              placeholder={t("seasonPlaceholder")}
              options={[
                { value: "year_round", label: t("seasonYearRound") },
                { value: "seasonal", label: t("seasonSeasonal") },
              ]}
              onChange={(v) => set("season", v)}
            />
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-4">
            <Field
              label={t("skipperExperience")}
              id="skipper_experience_years"
              type="number"
              value={form.skipper_experience_years ?? ""}
              placeholder={t("skipperExperiencePlaceholder")}
              onChange={(v) => set("skipper_experience_years", v)}
            />
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.has_license}
                  onChange={(e) => set("has_license", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-400"
                />
                <span className="text-sm text-navy-700">{t("hasLicense")}</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.claims_last_5_years}
                  onChange={(e) => set("claims_last_5_years", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-400"
                />
                <span className="text-sm text-navy-700">{t("claimsLast5")}</span>
              </label>
            </div>
            {form.claims_last_5_years && (
              <div>
                <label htmlFor="claims_details" className={labelCls}>{t("claimsDetails")}</label>
                <textarea
                  id="claims_details"
                  rows={3}
                  value={form.claims_details}
                  onChange={(e) => set("claims_details", e.target.value)}
                  placeholder={t("claimsDetailsPlaceholder")}
                  className={inputCls + " resize-none h-auto"}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Coverage */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className={labelCls}>{t("coverageTypes")}</p>
              <div className="space-y-2.5 pt-1">
                {[
                  { value: "hull", label: t("coverageHull") },
                  { value: "liability", label: t("coverageLiability") },
                  { value: "crew", label: t("coverageCrew") },
                  { value: "personal_effects", label: t("coveragePersonalEffects") },
                  { value: "tender", label: t("coverageTender") },
                ].map((c) => (
                  <label key={c.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.coverage_types.includes(c.value)}
                      onChange={() => toggleCoverage(c.value)}
                      className="w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-400"
                    />
                    <span className="text-sm text-navy-700">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Field label={t("deductiblePreference")} id="deductible_preference" value={form.deductible_preference ?? ""} placeholder={t("deductiblePlaceholder")} onChange={(v) => set("deductible_preference", v)} />
            <Field label={t("currentInsurer")} id="current_insurer" value={form.current_insurer ?? ""} placeholder={t("currentInsurerPlaceholder")} onChange={(v) => set("current_insurer", v)} />
            <div>
              <label htmlFor="policy_renewal_date" className={labelCls}>{t("policyRenewalDate")}</label>
              <input
                id="policy_renewal_date"
                type="date"
                value={form.policy_renewal_date ?? ""}
                onChange={(e) => set("policy_renewal_date", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Step 4: Contact */}
        {step === 4 && (
          <div className="space-y-4">
            <Field label={t("fullName")} id="full_name" value={form.full_name} error={errors.full_name} placeholder={t("fullNamePlaceholder")} onChange={(v) => set("full_name", v)} />
            <Field label={t("email")} id="email" type="email" value={form.email} error={errors.email} placeholder={t("emailPlaceholder")} onChange={(v) => set("email", v)} />
            <Field label={t("phone")} id="phone" type="tel" value={form.phone ?? ""} placeholder={t("phonePlaceholder")} onChange={(v) => set("phone", v)} />
            <div>
              <label htmlFor="comment" className={labelCls}>{t("comment")}</label>
              <textarea
                id="comment"
                rows={3}
                value={form.comment}
                onChange={(e) => set("comment", e.target.value)}
                placeholder={t("commentPlaceholder")}
                className={inputCls + " resize-none h-auto"}
              />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-400 shrink-0"
              />
              <span className="text-xs text-navy-600 leading-relaxed">{t("consent")}</span>
            </label>
            {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}
            {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 transition-colors"
            >
              <ChevronLeft size={16} />
              {t("back")}
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Button type="button" variant="primary" size="md" onClick={handleNext} className="gap-1.5">
              {t("next")}
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="submit" variant="primary" size="md" loading={submitting} className="gap-1.5">
              <Shield size={15} />
              {submitting ? t("submitting") : t("submit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
