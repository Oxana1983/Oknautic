import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — OKnautic",
  description: "Terms governing your use of the OKnautic platform.",
};

export default function TermsOfUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">Terms of Use</h1>
        <p className="text-sm text-navy-400">OKnautic.com · Last updated: 13 July 2026</p>
      </div>

      <div className="space-y-10 text-navy-700 text-[15px] leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">1. Who we are</h2>
          <p>
            OKnautic.com (the &quot;Platform&quot;) is operated by <strong>Yacht Team DOO</strong>, registered in Montenegro,
            reg. no. 5-1142697, registered office: Bonići 1, 85320 Tivat, Montenegro (the &quot;Company&quot;, &quot;we&quot;).
            Full company details are available in the <Link href="/legal-notice" className="text-teal-600 hover:text-teal-700 underline">Legal Notice</Link>.
            These Terms govern your use of the Platform. Sellers are additionally bound by the{" "}
            <Link href="/seller-terms" className="text-teal-600 hover:text-teal-700 underline">Seller Terms</Link>.
            By creating an account or submitting a request for quotation, you agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">2. Definitions</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              ["Buyer", "a user who searches for products and submits requests for quotation. A Buyer may be a Consumer (a natural person acting outside their trade or profession) or a Business Buyer."],
              ["Seller", "an independent third-party business registered on the Platform that responds to requests for quotation."],
              ["RFQ (Request for Quotation)", "a Buyer's request for offers on a specific product, including quantity, product options, delivery location and desired delivery date/time."],
              ["Offer", "a Seller's response to an RFQ, stating price, available quantity, delivery terms and other conditions."],
            ].map(([term, def]) => (
              <li key={term} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span><strong>{term}</strong> — {def}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">3. Role of the Platform</h2>
          <div className="bg-navy-50 border border-navy-100 rounded-xl px-5 py-4 mb-4 font-medium text-navy-800">
            OKnautic provides an online request-for-quotation and communication platform that enables Buyers to submit
            requests and independent Sellers to make commercial offers. Unless expressly stated otherwise,{" "}
            <strong>Yacht Team DOO does not sell, manufacture, supply, store, inspect, deliver or take title to any
            products and is not a party to any contract concluded between a Buyer and a Seller.</strong>
          </div>
          <p className="mb-3">In particular:</p>
          <ul className="space-y-2 list-none pl-0 mb-4">
            {[
              "Each Seller is an independent third-party business. Every Offer is made by the Seller, not by the Company. A transaction is concluded exclusively between the Buyer and the relevant Seller, in accordance with the terms agreed between them.",
              "The Seller independently determines its prices, availability, delivery terms, payment terms, warranty, return conditions and applicable taxes. The Seller is the seller of record for each transaction and is solely responsible for the sale, invoicing, payment arrangements, delivery, product conformity, warranties, returns, refunds and all other obligations arising from that transaction (see Seller Terms).",
              "The Company does not receive payment for products, does not own products, does not inspect individual products, does not guarantee availability, and does not act as agent of any Buyer or Seller unless expressly agreed in a separate written agreement.",
              "Product images, descriptions and average prices displayed on the Platform are indicative only. Nothing on the Platform shall be construed as an offer by Yacht Team DOO to sell any product.",
              "The identity and contact details of the Seller making an Offer are made available to the Buyer before the Buyer confirms that Offer.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-navy-300 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            This section allocates responsibility for products and transactions to Sellers. It does not exclude the
            Company&apos;s responsibility for its own obligations: the proper provision of the Platform service,
            compliance with applicable data protection law, and other obligations that cannot be excluded by law (see Section 12).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">4. Accounts</h2>
          <p>
            You must provide accurate information and keep it up to date. You are responsible for activity under your
            account and for keeping your credentials confidential. We may suspend or terminate accounts that violate
            these Terms or applicable law. Buyers may browse the catalogue and use the cart without an account; an
            account is required to submit an RFQ.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">5. The RFQ process</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              "Before you submit an RFQ, you will be notified that your request — including the requested products, quantities, delivery location and requested delivery date — will be shared with matching independent Sellers so that they can prepare quotations. Do not include unnecessary personal or sensitive information in your RFQ.",
              "Offers received are shown in your account. Confirming an Offer (\"Order\") expresses your intent to purchase on the Offer's terms; you and the Seller then finalise payment and delivery directly, including via the Platform chat.",
              "Chat may be initiated only by the Buyer and only in connection with an RFQ. Chat must not be used for unlawful content, spam or harassment. We may review chat content to investigate abuse, fraud or violations of these Terms, as described in the Privacy Policy.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">6. Buyer obligations</h2>
          <p>
            Buyers must submit RFQs in good faith with genuine intent to purchase, provide accurate delivery information,
            and must not use the Platform to harvest Seller data or to solicit Sellers for purposes unrelated to an RFQ.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">7. Prohibited use</h2>
          <p>
            You must not: use the Platform for unlawful purposes; request or offer illegal, counterfeit, unsafe or
            stolen goods; misrepresent your identity; scrape or mass-extract Platform content or data; interfere with
            the Platform&apos;s operation or security; or, after making contact through the Platform, circumvent it to
            avoid its rules.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">8. Reporting problems</h2>
          <p>
            To report illegal content, a suspected fraudulent Seller or Buyer, or any other problem, contact{" "}
            <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>.
            We will review reports and may remove content, suspend accounts or take other appropriate action.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">9. Intellectual property</h2>
          <p>
            The Platform, its design, software, databases and trademarks belong to the Company or its licensors.
            Product, brand names and logos belong to their respective owners and are displayed for identification only;
            their display does not imply endorsement or affiliation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">10. Insurance and agency information</h2>
          <p>
            Sections of the Platform describing insurance or agency services are informational. Such services are
            provided by third parties under their own terms; the Company is not an insurer, broker or agent unless
            expressly stated otherwise.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">11. Availability</h2>
          <p>
            The Platform is provided &quot;as is&quot; and &quot;as available&quot;. We may modify, suspend or discontinue
            features. We do not warrant uninterrupted or error-free operation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">12. Liability</h2>
          <p className="mb-3">
            The Company is responsible for providing the Platform service with reasonable skill and care. The Company
            is not liable for the products, offers, statements, acts or omissions of Sellers or Buyers, or for the
            performance of any transaction between them, responsibility for which rests with the Seller as seller of record.
          </p>
          <p className="mb-3">
            <strong>For Business Buyers and Sellers:</strong> the Company&apos;s total aggregate liability arising from or
            in connection with the Platform is limited to the greater of (a) EUR 100 and (b) the total fees paid by
            that user to the Company during the 12 months preceding the event giving rise to the claim.
          </p>
          <p className="mb-3">
            <strong>For Consumers:</strong> the above limitation applies only to the extent permitted by mandatory
            consumer protection law applicable to you.
          </p>
          <p>
            Nothing in these Terms excludes or limits liability for fraud or wilful misconduct, for gross negligence
            where such limitation is not permitted, for death or personal injury caused by the Company&apos;s negligence,
            or any other liability that cannot lawfully be excluded or limited under applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">13. Indemnity</h2>
          <p>
            Sellers&apos; indemnification obligations are set out in the Seller Terms. A Business Buyer shall indemnify
            the Company against third-party claims to the extent caused by that Buyer&apos;s unlawful use of the Platform
            or breach of these Terms. No indemnification obligation is imposed on Consumers beyond their liability
            under applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">14. Termination</h2>
          <p>
            You may close your account at any time. We may suspend or terminate access for breach of these Terms, fraud
            or legal requirement. Sections 3, 9, 12 and 13 survive termination.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">15. Governing law and disputes</h2>
          <p className="mb-3">
            <strong>For Sellers and Business Buyers:</strong> these Terms and any dispute arising out of or in
            connection with them are governed by the laws of Montenegro, and the competent courts of Montenegro have
            exclusive jurisdiction, unless otherwise required by mandatory applicable law.
          </p>
          <p>
            <strong>For Consumers:</strong> these Terms are governed by the laws of Montenegro; however, if you are a
            consumer habitually resident in the European Union or another jurisdiction whose mandatory consumer
            protection laws apply to you, this choice of law does not deprive you of the protection afforded to you by
            mandatory provisions of the law that would otherwise apply. Nothing in these Terms limits any right of a
            consumer to bring proceedings before a court having jurisdiction under mandatory applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">16. Changes</h2>
          <p>
            We may amend these Terms; material changes will be announced on the Platform or by email at least 14 days
            before taking effect. Continued use after the effective date constitutes acceptance.
          </p>
        </section>

        <div className="pt-4 border-t border-navy-100 text-sm text-navy-400">
          Contact:{" "}
          <a href="mailto:info@oknautic.com" className="text-teal-600 hover:text-teal-700">info@oknautic.com</a>
        </div>

      </div>
    </div>
  );
}
