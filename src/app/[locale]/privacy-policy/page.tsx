import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OKnautic",
  description: "How OKnautic collects, uses and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">Privacy Policy</h1>
        <p className="text-sm text-navy-400">OKnautic.com · Last updated: 13 July 2026</p>
      </div>

      <div className="space-y-10 text-navy-700 text-[15px] leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">1. Who we are</h2>
          <p className="mb-3">
            OKnautic.com (the &quot;Platform&quot;) is operated by <strong>Yacht Team DOO</strong>, a company registered
            in Montenegro, registration number 5-1142697, registered office: Bonići 1, 85320 Tivat, Montenegro (the &quot;Company&quot;, &quot;we&quot;).
          </p>
          <p className="mb-3">
            Yacht Team DOO is established in Montenegro and is subject to applicable Montenegrin data protection law.
            The EU General Data Protection Regulation (&quot;GDPR&quot;) may additionally apply to certain processing
            activities where its territorial scope requirements are met, in particular where we offer our services to
            users in the European Union.
          </p>
          <p>
            Privacy contact:{" "}
            <a href="mailto:privacy@oknautic.com" className="text-teal-600 hover:text-teal-700">privacy@oknautic.com</a>
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">2. What data we collect</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              ["Account data (Buyers)", "name, email, phone, password (hashed)."],
              ["Account data (Sellers)", "company and legal name, registration/tax identifiers, bank details, store address(es), logo, representative contact details."],
              ["RFQ data", "requested products, quantity and options, delivery location, requested delivery date/time, comments."],
              ["Communications", "Platform chat messages between Buyers and Sellers; Personal Assistance requests (name, email, topic, message)."],
              ["Newsletter", "email address, if you opt in."],
              ["Technical data", "IP address, browser/device information, usage and security logs."],
              ["Local storage", "an anonymous shopping cart is stored only in your browser (localStorage) and reaches our systems only when you sign in."],
            ].map(([label, desc]) => (
              <li key={label} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span><strong>{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">3. Purposes and legal bases</h2>
          <p className="mb-4 text-sm text-navy-500">
            We do not rely on consent for processing that is necessary to provide the service. The legal bases are:
          </p>
          <div className="overflow-x-auto rounded-xl border border-navy-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 text-left">
                  <th className="px-4 py-3 font-semibold text-navy-700 w-3/5">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-navy-700">Legal basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {[
                  ["Creating and managing your account", "Performance of a contract / steps prior to entering into a contract"],
                  ["Distributing your RFQ to matching Sellers and delivering their Offers to you (the core function of the Platform)", "Performance of a contract"],
                  ["Chat between Buyer and Seller in connection with an RFQ", "Performance of a contract"],
                  ["Transactional notifications (new offers, RFQ status, order confirmations, account security, password reset)", "Performance of a contract — these are service messages, not marketing"],
                  ["Marketing newsletter", "Consent (separate, optional opt-in; withdraw at any time via unsubscribe link)"],
                  ["Seller verification, fraud and abuse prevention, security logging", "Legitimate interest"],
                  ["Accounting, tax and other legal obligations", "Legal obligation"],
                ].map(([purpose, basis]) => (
                  <tr key={purpose} className="align-top">
                    <td className="px-4 py-3 text-navy-700">{purpose}</td>
                    <td className="px-4 py-3 text-navy-500">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">4. Sharing your RFQ with Sellers</h2>
          <p className="mb-3">
            Distributing RFQs is the core function of the Platform, and we apply data minimisation:
          </p>
          <ul className="space-y-2 list-none pl-0 mb-4">
            {[
              "When you submit an RFQ, matching independent Sellers see the requested product, quantity and options, the requested delivery date/time, and the delivery area (city / marina / region). Your full name, email, phone number and exact delivery address are not shown at this stage.",
              "When you start a chat with a Seller, your name becomes visible to that Seller.",
              "When you confirm a Seller's Offer, that Seller receives the details needed to perform the transaction, including your contact details and the exact delivery address.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mb-3">
            You will see a notice to this effect before submitting an RFQ. Please do not include unnecessary personal
            or sensitive information in RFQ comments or chat.
          </p>
          <p>
            Sellers are independent businesses and act as <strong>independent data controllers</strong> for the data
            they receive; their further processing is governed by their own privacy practices and by contractual
            data-use obligations in our Seller Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">5. Other recipients</h2>
          <p className="mb-3">
            <strong>Service providers (processors):</strong> hosting and database infrastructure and email delivery
            providers engaged under data processing agreements.
          </p>
          <p className="mb-3">
            <strong>Authorities</strong>, where disclosure is required by law.
          </p>
          <p>We do not sell personal data and do not use it for third-party advertising.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">6. International transfers</h2>
          <p>
            Where personal data is transferred to a country that does not benefit from an applicable adequacy decision,
            we use appropriate safeguards as required by applicable data protection law, which may include the European
            Commission&apos;s Standard Contractual Clauses and supplementary technical and organisational measures,
            where applicable. Details of hosting locations and subprocessors are available on request via the privacy
            contact above.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">7. How long we keep data</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              "Account data — until account closure, plus a limited period necessary for handling claims, fraud prevention and legal compliance.",
              "RFQs, Offers and chat history — for the duration of the RFQ process and thereafter as necessary for dispute resolution and the establishment or defence of legal claims within applicable limitation periods.",
              "Newsletter subscription — until you unsubscribe.",
              "Security and technical logs — up to 12 months, unless a longer period is necessary to investigate a security incident or comply with a legal obligation.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">8. Your rights</h2>
          <p className="mb-3">
            Subject to applicable law, you may: access your data and obtain a copy; rectify inaccurate data; request
            erasure; restrict or object to processing; request portability; and withdraw consent at any time where
            processing is based on consent (without affecting prior processing). Contact{" "}
            <a href="mailto:privacy@oknautic.com" className="text-teal-600 hover:text-teal-700">privacy@oknautic.com</a>.
          </p>
          <p>
            You may lodge a complaint with the Montenegrin Agency for Personal Data Protection and Free Access to
            Information (AZLP); EU users may also complain to their local supervisory authority.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">9. Cookies</h2>
          <p>
            The Platform currently uses only strictly necessary cookies and browser storage required for sign-in
            sessions and the shopping cart. If analytics or other non-essential cookies are introduced, a cookie
            banner and a separate Cookie Policy will be added.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">10. Security</h2>
          <p>
            We apply appropriate technical and organisational measures: encryption in transit, access controls,
            row-level access restrictions in our database, hashed password storage. Please use a strong, unique password.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">11. Children</h2>
          <p>The Platform is intended for business users and adults. We do not knowingly collect data from persons under 18.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">12. Changes</h2>
          <p>
            We may update this policy; the current version is always available on this page, and material changes will
            be announced on the Platform or by email.
          </p>
        </section>

      </div>
    </div>
  );
}
