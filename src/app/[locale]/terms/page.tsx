import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — OKnautic",
  description: "Terms governing your use of the OKnautic platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">Terms of Use</h1>
        <p className="text-sm text-navy-400">OKnautic.com · Last updated: 13 July 2026</p>
      </div>

      <div className="space-y-10 text-navy-700 text-[15px] leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">1. Who we are and what these Terms cover</h2>
          <p>
            OKnautic.com (the "Platform") is operated by <strong>Yacht Team DOO</strong>, registered in Montenegro, reg. no. 5-1142697, address Bonići 1, 85320 Tivat, Montenegro (the "Company", "we"). These Terms govern your use of the Platform. By creating an account or submitting a quote request, you agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">2. Definitions</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              ["Customer", "a user who searches for products and submits quote requests."],
              ["Seller", "a business registered on the Platform that responds to quote requests with offers."],
              ["Quote Request", "a Customer's request for offers on a specific product, including quantity, product options, delivery location and desired delivery date/time."],
              ["Offer", "a Seller's response to a Quote Request, stating price, available quantity, delivery terms and other conditions."],
            ].map(([term, def]) => (
              <li key={term} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span><strong>{term}</strong> — {def}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">3. Nature of the Platform — we are a venue, not a party</h2>
          <div className="bg-navy-50 border border-navy-100 rounded-xl px-5 py-4 mb-4 font-medium text-navy-800">
            The Platform is an intermediary service that connects Customers and Sellers. The Company is not a party to any transaction between a Customer and a Seller.
          </div>
          <p className="mb-3">In particular, the Company:</p>
          <ul className="space-y-2 list-none pl-0 mb-4">
            {[
              "does not sell, own, stock, inspect or deliver any products listed on the Platform;",
              "does not guarantee the accuracy of product information, the availability of products, or the accuracy of any Offer;",
              "does not process payments between Customers and Sellers; all payment, delivery and warranty arrangements are agreed directly between the Customer and the Seller;",
              "is not responsible for the quality, safety, legality, originality or fitness for purpose of any product, nor for a Seller's failure to deliver or a Customer's failure to pay.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-navy-300 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            Any contract of sale arising from a confirmed Offer is concluded <strong>directly between the Customer and the Seller</strong>. Product images and average prices shown on the Platform are indicative only and do not constitute an offer by the Company.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">4. Accounts</h2>
          <p>
            You must provide accurate information and keep it up to date. You are responsible for all activity under your account and for keeping your credentials confidential. One person or entity may not maintain multiple accounts of the same type without our consent. We may suspend or terminate accounts that violate these Terms.
          </p>
          <p className="mt-3">
            Customers may browse the catalogue and use the cart without an account; an account is required to submit a Quote Request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">5. Seller obligations</h2>
          <p className="mb-3">Sellers must:</p>
          <ul className="space-y-2 list-none pl-0 mb-4">
            {[
              "be duly registered businesses and provide complete and accurate company details, including legal name, registration/tax identifiers and store address(es);",
              "accurately declare the brands and product categories they deal in;",
              "ensure that every Offer is accurate — including price, availability, condition (new/used), warranty period, VAT treatment and delivery terms — and honour confirmed Offers;",
              "comply with all laws applicable to their sales, including consumer protection, product safety, warranty and tax obligations in the relevant jurisdictions;",
              "hold all licences and authorisations required to sell the offered products.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            <strong>The Seller is solely responsible for the products it sells and for fulfilling its obligations to the Customer</strong>, including statutory warranty and conformity obligations under applicable consumer law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">6. Customer obligations</h2>
          <p>
            Customers must submit Quote Requests in good faith, with genuine intent to purchase, and provide accurate delivery information. Customers must not use the Platform to harvest Seller data or solicit Sellers for purposes unrelated to a Quote Request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">7. Quote process and communications</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              "A submitted Quote Request is distributed to Sellers whose declared brands and categories match the requested product; the request details, including delivery location and date, become visible to those Sellers.",
              "Offers received are visible in the Customer's account. Confirming an Offer ("Order") signals the Customer's intent to purchase on the Offer's terms; the parties then finalise payment and delivery directly, including via the Platform chat.",
              "Chat may be initiated only by the Customer and only in connection with a Quote Request. Chat must not be used for unlawful content, spam, harassment, or sharing content unrelated to the request. We may review chat content to investigate abuse, fraud or violations of these Terms, as described in the Privacy Policy.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">8. Prohibited use</h2>
          <p>
            You must not: use the Platform for any unlawful purpose; list or request illegal, counterfeit or stolen goods; misrepresent your identity or company; scrape, copy or mass-extract Platform content or data; interfere with the Platform's operation or security; circumvent the Platform to avoid its rules after initiating contact through it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">9. Content and intellectual property</h2>
          <p>
            The Platform, its design, software, databases and trademarks belong to the Company or its licensors. Product names, brand names and logos displayed on the Platform belong to their respective owners and are used for identification purposes only; their display does not imply endorsement or affiliation. Sellers grant the Company a non-exclusive licence to display the content they upload (e.g. logos, offer details) for the operation of the Platform and warrant that such content does not infringe third-party rights.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">10. Insurance and agency information</h2>
          <p>
            Sections of the Platform describing insurance or agency services are informational. Any insurance or agency services are provided by third parties under their own terms; the Company is not an insurer, broker or agent unless expressly stated otherwise. [ADJUST ONCE REFERRAL PARTNERSHIPS ARE FORMALISED.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">11. Availability and changes</h2>
          <p>
            The Platform is provided "as is" and "as available". We may modify, suspend or discontinue features at any time. We do not warrant uninterrupted or error-free operation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">12. Liability</h2>
          <p>
            To the maximum extent permitted by applicable law: the Company is not liable for any loss arising from transactions between Customers and Sellers, from reliance on product information or Offers, or from the conduct of any user; the Company's total liability to any user for claims arising from the use of the Platform is limited to [EUR 100 / the amount paid by that user to the Company in the preceding 12 months, whichever is greater]. Nothing in these Terms excludes liability that cannot be excluded by law, including mandatory consumer rights of users in the EU.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">13. Indemnity</h2>
          <p>
            Sellers agree to indemnify the Company against claims by Customers or third parties arising from the Seller's products, offers, or breach of these Terms or applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">14. Termination</h2>
          <p>
            You may close your account at any time. We may suspend or terminate access for breach of these Terms, fraud, or legal requirement. Sections 3, 9, 12 and 13 survive termination.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">15. Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of Montenegro. Disputes shall be resolved by the competent courts of Podgorica, Montenegro, without prejudice to mandatory consumer protections and jurisdiction rules that apply to consumers in their country of residence (including EU consumers). [LAWYER TO CONFIRM DISPUTE-RESOLUTION AND CONSUMER-JURISDICTION WORDING.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">16. Changes to these Terms</h2>
          <p>
            We may amend these Terms; material changes will be announced on the Platform or by email at least [14] days before taking effect. Continued use after the effective date constitutes acceptance.
          </p>
        </section>

        <div className="pt-4 border-t border-navy-100 text-sm text-navy-400">
          Contact: <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>
        </div>

      </div>
    </div>
  );
}
