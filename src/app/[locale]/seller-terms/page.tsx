import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller Terms — OKnautic",
  description: "Terms applying to businesses registered as Sellers on OKnautic.com.",
};

export default function SellerTermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-teal-600 uppercase tracking-widest mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-1">Seller Terms</h1>
        <p className="text-sm text-navy-400">OKnautic.com · Last updated: 13 July 2026</p>
      </div>

      <div className="space-y-10 text-navy-700 text-[15px] leading-relaxed">

        <div className="bg-navy-50 border border-navy-100 rounded-xl px-5 py-4 text-sm text-navy-600">
          These Seller Terms supplement the{" "}
          <Link href="/terms-of-use" className="text-teal-600 hover:text-teal-700 underline">Terms of Use</Link>{" "}
          and apply to every business registered on the Platform as a Seller. In case of conflict regarding
          Seller obligations, these Seller Terms prevail.
        </div>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">1. Seller status and registration</h2>
          <p>
            The Seller is an independent third-party business. Registration requires complete and accurate details:
            legal name, registration and tax identifiers, registered address, store address(es), bank details,
            contact details of an authorised representative, and the brands and product categories the Seller deals in.
            The Seller must keep this information up to date. The Company may verify Seller information and may
            suspend accounts pending verification.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">2. Seller of record</h2>
          <p>
            <strong>The Seller is the seller of record for each transaction concluded with a Buyer</strong> and is
            solely responsible for the sale, invoicing, payment arrangements, delivery, product conformity, warranties,
            returns, refunds, taxes and all other obligations arising from that transaction. The Company is not a
            party to the transaction and does not act as the Seller&apos;s agent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">3. Seller warranties and obligations</h2>
          <p className="mb-3">The Seller represents, warrants and undertakes that it:</p>
          <ul className="space-y-2 list-none pl-0">
            {[
              "is legally authorised to conduct its business and holds all licences required to sell the offered products;",
              "has the right to sell every product it offers, and offers no counterfeit, illegal, unsafe or stolen goods;",
              "provides accurate and complete information in every Offer, including the full price, applicable taxes, condition (new/used), warranty period and delivery terms, and honours confirmed Offers;",
              "provides Buyers — in particular Consumers — with all mandatory pre-contractual information required by applicable law, and discloses its legal identity and contact details;",
              "complies with consumer protection law, product safety requirements, recall obligations, and warranty/conformity obligations in the relevant jurisdictions;",
              "issues invoices to Buyers and fulfils its own VAT and other tax obligations;",
              "does not infringe third-party intellectual property rights;",
              "complies with these Seller Terms, the Terms of Use and applicable law.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">4. Use of Buyer data</h2>
          <p className="mb-3">
            Data received through the Platform (RFQ details, delivery information, chat contents, Buyer identity
            where disclosed) is provided to the Seller solely for legitimate RFQ purposes: evaluating the request,
            preparing an Offer, communicating with the Buyer and performing a resulting transaction. The Seller acts
            as an <strong>independent data controller</strong> for such data and must:
          </p>
          <ul className="space-y-2 list-none pl-0">
            {[
              "not use Buyer contact data for unrelated marketing without its own lawful basis;",
              "not disclose the data to third parties without a lawful basis;",
              "apply appropriate security measures and comply with applicable data protection law;",
              "remain solely responsible for its own further processing activities.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-navy-300 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">5. Content licence</h2>
          <p>
            The Seller grants the Company a non-exclusive licence to display content it uploads (logo, company
            details, offer details) for the operation of the Platform, and warrants that such content does not
            infringe third-party rights.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">6. Indemnity</h2>
          <p>
            The Seller shall indemnify and hold harmless Yacht Team DOO against third-party claims, losses and costs{" "}
            <strong>to the extent caused by the Seller&apos;s acts, omissions, products, Offers or breach</strong>{" "}
            of these Seller Terms, the Terms of Use or applicable law — including claims arising from defective or
            unsafe products, intellectual property infringement, misleading offers, failure to deliver, tax or VAT
            violations, and consumer claims.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">7. Suspension and termination</h2>
          <p>
            The Company may suspend or terminate a Seller account for breach of these Seller Terms, provision of
            false information, offering prohibited products, repeated Buyer complaints, or legal requirement. Where
            reasonably practicable, the Company will state the reasons for the measure taken. Sections 2, 4, 5 and 6
            survive termination.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">8. Fees</h2>
          <p>
            Use of the Platform by Sellers is currently free of charge. The Company may introduce subscription plans
            or other fees in the future with at least 30 days&apos; prior notice; continued use after the effective
            date constitutes acceptance of the applicable fees.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-navy-900 mb-3">9. Governing law</h2>
          <p>
            These Seller Terms are governed by the laws of Montenegro; the competent courts of Montenegro have
            exclusive jurisdiction.
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
