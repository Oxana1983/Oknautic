import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OKnautic",
  description: "How OKnautic collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">Privacy Policy</h1>
        <p className="text-sm text-navy-400">OKnautic.com · Last updated: 13 July 2026</p>
      </div>

      <div className="prose prose-navy max-w-none space-y-10 text-navy-700 text-[15px] leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">1. Who we are</h2>
          <p>
            OKnautic.com (the "Platform") is operated by <strong>Yacht Team DOO</strong>, a company registered in Montenegro, registration number 5-1142697, with its registered office at Bonići 1, 85320 Tivat, Montenegro (the "Company", "we", "us").
          </p>
          <p className="mt-3">
            For the purposes of applicable data protection law — including the Law on Personal Data Protection of Montenegro and, where it applies to users in the European Union, the General Data Protection Regulation (EU) 2016/679 ("GDPR") — the Company is the <strong>data controller</strong> of personal data processed through the Platform.
          </p>
          <p className="mt-3">Contact for privacy matters: <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a></p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">2. What data we collect</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              ["Account data (Customers)", "name, email address, phone number, password (stored in hashed form)."],
              ["Account data (Sellers)", "in addition to the above — company name and legal name, tax/registration identifiers, bank account details, store address(es), company logo, and contact details of the company representative."],
              ["Quote request data", "products requested, quantity and product options, delivery location, requested delivery date and time, and any comments you add to your request."],
              ["Communications", "messages exchanged through the Platform chat between Customers and Sellers, and requests submitted through the Personal Assistance form (name, email, topic, message text)."],
              ["Newsletter", "email address, if you subscribe to updates."],
              ["Technical data", "IP address, browser and device information, and usage logs collected automatically when you use the Platform."],
              ["Local storage", "if you use the shopping cart without an account, its contents are stored only in your browser (localStorage) and are transferred to our systems only if you sign in and submit a quote request."],
            ].map(([label, desc]) => (
              <li key={label} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span><strong>{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-4">3. Why we process your data and on what legal basis</h2>
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
                  ["Creating and managing your account; operating the quote request process (transmitting your requests to relevant Sellers, delivering their offers to you)", "Performance of a contract (Art. 6(1)(b) GDPR)"],
                  ["Enabling chat between Customers and Sellers regarding a specific request", "Performance of a contract"],
                  ["Sending transactional notifications (new offers, order confirmations, request updates) by email", "Performance of a contract; you can disable non-essential notifications in your account settings"],
                  ["Sending the newsletter", "Consent (Art. 6(1)(a) GDPR); withdraw at any time via the unsubscribe link"],
                  ["Verifying Seller companies and preventing fraud and abuse", "Legitimate interest (Art. 6(1)(f) GDPR)"],
                  ["Complying with accounting, tax and other legal obligations", "Legal obligation (Art. 6(1)(c) GDPR)"],
                  ["Maintaining security logs and improving the Platform", "Legitimate interest"],
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
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">4. Who receives your data</h2>
          <p>
            <strong>Sellers.</strong> This is essential to how the Platform works: when you submit a quote request, the details of that request — including the requested product, quantity, <strong>delivery location and delivery date/time</strong> — are made available to registered Sellers whose declared brands and categories match your request. Your name becomes visible to a Seller when you start a chat with them or confirm their offer. Sellers are independent businesses and act as separate data controllers for the data they receive; their use of your data is governed by their own privacy practices.
          </p>
          <p className="mt-3">
            <strong>Service providers (processors):</strong> hosting and database infrastructure ([e.g. Supabase Inc., Vercel Inc.]), email delivery ([e.g. Resend]), and other providers engaged under data processing agreements.
          </p>
          <p className="mt-3"><strong>Authorities</strong>, where disclosure is required by applicable law.</p>
          <p className="mt-3">We do not sell personal data and do not use it for third-party advertising.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">5. International transfers</h2>
          <p>
            Our infrastructure providers may store data in the European Union and/or other jurisdictions [SPECIFY REGIONS ONCE HOSTING REGION IS FIXED]. Where personal data of EU users is transferred outside the EEA, we rely on appropriate safeguards such as the European Commission's Standard Contractual Clauses.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">6. How long we keep data</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              "Account data: for as long as your account is active, and up to [12] months after deletion, unless a longer period is required by law.",
              "Quote requests, offers and chat history: [3] years after the request is closed, to handle disputes and comply with commercial record-keeping obligations.",
              "Seller company and financial records: as required by Montenegrin accounting and tax legislation.",
              "Newsletter subscription: until you unsubscribe.",
              "Technical logs: up to [12] months.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">7. Your rights</h2>
          <p>
            Subject to applicable law, you have the right to: access your data; obtain a copy; rectify inaccurate data; erase your data; restrict or object to processing; data portability; and withdraw consent at any time (without affecting prior processing). To exercise these rights, contact <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>. We will respond within the statutory time limit.
          </p>
          <p className="mt-3">
            You also have the right to lodge a complaint with a supervisory authority — in Montenegro, the Agency for Personal Data Protection and Free Access to Information (AZLP); EU users may also complain to their local data protection authority.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">8. Cookies and similar technologies</h2>
          <p>
            The Platform uses strictly necessary cookies and browser storage required for sign-in sessions and the shopping cart. [IF ANALYTICS ARE ADDED LATER: describe them here and obtain consent via a cookie banner.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">9. Security</h2>
          <p>
            We apply appropriate technical and organisational measures, including encryption in transit, access controls, row-level access restrictions in our database, and hashed password storage. No system is completely secure; please use a strong, unique password.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">10. Children</h2>
          <p>The Platform is intended for business users and adults. We do not knowingly collect data from persons under 18.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">11. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The current version is always available on this page; material changes will be announced on the Platform or by email.
          </p>
        </section>

      </div>
    </div>
  );
}
