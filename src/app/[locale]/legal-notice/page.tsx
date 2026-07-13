import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice — OKnautic",
  description: "Company and regulatory information for OKnautic.com — Yacht Team DOO.",
};

export default function LegalNoticePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">Legal Notice</h1>
        <p className="text-sm text-navy-400">OKnautic.com</p>
      </div>

      <div className="space-y-8 text-navy-700 text-[15px] leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">Platform operator</h2>
          <div className="bg-navy-50 border border-navy-100 rounded-xl px-6 py-5 space-y-1.5 text-[15px]">
            <p className="font-semibold text-navy-900">Yacht Team DOO</p>
            <p>Registered office: Bonići 1, 85320 Tivat, Montenegro</p>
            <p>Company registration number: 5-1142697</p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">Contact</h2>
          <div className="space-y-2">
            <p>
              General enquiries:{" "}
              <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>
            </p>
            <p>
              Privacy matters:{" "}
              <a href="mailto:privacy@oknautic.com" className="text-teal-600 hover:text-teal-700">privacy@oknautic.com</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">Legal documents</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              ["/terms-of-use", "Terms of Use"],
              ["/seller-terms", "Seller Terms"],
              ["/privacy-policy", "Privacy Policy"],
            ].map(([href, label]) => (
              <li key={href} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <Link href={href} className="text-teal-600 hover:text-teal-700 underline">{label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">Reporting</h2>
          <p>
            To report illegal content or misuse of the Platform, contact{" "}
            <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
