import Link from "next/link";
import { SeoCtaRow } from "@/components/seo/SeoArticleShell";
import { waLink } from "@/lib/whatsapp";

const checklistWa = waLink(
  "Hi AutoSell Ghana — I'd like your FREE pre-purchase checklist before I view a car.",
);
const valuationWa = waLink(
  "Hi AutoSell Ghana — I'd like a FREE car valuation.\n\nMake/model:\nYear:\nMileage (approx):\nCondition (Excellent / Good / Fair / Needs work):\nLocation in Ghana:",
);
const dealerPartnerWa = waLink(
  "Hi AutoSell Ghana — I run a dealership/garage and would like to partner and list inventory on AutoSell.",
);
const toyotaInspectionWa = waLink(
  "Hi AutoSell Ghana — I'd like an inspection referral before I buy a Toyota.",
);

export function MarketingSeoAccraBody() {
  return (
    <>
      <p>
        Looking for a reliable car in Accra? AutoSell.gh connects you directly with trusted private sellers,
        garages, and dealerships across Accra and Greater Accra.
      </p>
      <p>
        Whether you&apos;re searching for a budget-friendly Toyota Corolla, a family SUV, or a premium saloon, our
        platform lists hundreds of verified cars available right now in Accra.
      </p>
      <h2>Why buyers in Accra choose AutoSell</h2>
      <ul>
        <li>Browse cars from sellers in Accra, Tema, Kasoa, Adenta, and surrounding areas</li>
        <li>Message AutoSell on WhatsApp to enquire — we connect you with the seller</li>
        <li>New cars listed every day</li>
        <li>Free to browse, no account needed</li>
        <li>Verified sellers with real photos</li>
      </ul>
      <h2>Popular car types currently listed in Accra</h2>
      <p>
        Toyota Corolla, Honda Accord, Hyundai Elantra, Toyota RAV4, Kia Sportage, Mercedes-Benz, Ford Escape, Nissan
        Sentra
      </p>
      <SeoCtaRow>
        <Link href="/cars?location=Accra" className="btn-primary font-display rounded-lg px-5 py-3 text-sm font-semibold">
          Browse cars for sale in Accra
        </Link>
        <Link href="/sell" className="btn-outline font-display rounded-lg px-5 py-3 text-sm font-semibold">
          List your car — free
        </Link>
      </SeoCtaRow>
      <p className="text-sm text-[#6B7280]">
        Selling a car in Accra? List yours free on AutoSell.gh and reach thousands of active buyers.
      </p>
    </>
  );
}

export function MarketingSeoKumasiBody() {
  return (
    <>
      <p>
        AutoSell.gh lists quality used cars from trusted sellers across Kumasi and the Ashanti Region. Find your next
        car from private owners, garages, and local dealers — all in one place.
      </p>
      <p>
        Buying a used car in Kumasi doesn&apos;t have to be stressful. Our platform gives you direct access to sellers
        so you can ask questions, negotiate, and inspect before you buy.
      </p>
      <h2>What you&apos;ll find on AutoSell in Kumasi</h2>
      <ul>
        <li>Affordable saloons under ₵30,000</li>
        <li>Family SUVs and 4x4s</li>
        <li>Commercial vehicles and pickups</li>
        <li>Fuel-efficient small cars for city driving</li>
      </ul>
      <h2>How to buy safely in Kumasi</h2>
      <ol>
        <li>Browse listings and shortlist your favourites</li>
        <li>Message AutoSell on WhatsApp about listings — we help you reach the seller</li>
        <li>Arrange a viewing and inspection</li>
        <li>Complete your purchase with confidence</li>
      </ol>
      <p>
        <strong>Tip:</strong> Ask AutoSell for a FREE pre-purchase checklist before you view any car.{" "}
        <a href={checklistWa} className="seo-inline-link" target="_blank" rel="noopener noreferrer">
          Message us on WhatsApp
        </a>
        .
      </p>
      <SeoCtaRow>
        <Link href="/cars?location=Kumasi" className="btn-primary font-display rounded-lg px-5 py-3 text-sm font-semibold">
          Browse used cars in Kumasi
        </Link>
        <Link href="/sell" className="btn-outline font-display rounded-lg px-5 py-3 text-sm font-semibold">
          List your car — free
        </Link>
      </SeoCtaRow>
      <p className="text-sm text-[#6B7280]">
        Are you a seller in Kumasi? List your car free on AutoSell.gh and reach buyers across Ashanti Region.
      </p>
    </>
  );
}

export function MarketingSeoSellFastBody() {
  return (
    <>
      <p>
        Selling a car in Ghana can take weeks — or even months — if you only post in one or two places. The secret to
        selling fast is <strong>maximum exposure to the right buyers.</strong>
      </p>
      <p>AutoSell.gh helps you do exactly that.</p>
      <h2>When you list your car on AutoSell, you get</h2>
      <ul>
        <li>Your car listed on autosellgh.com — visible to buyers across Ghana</li>
        <li>Promoted on our Facebook page and Instagram</li>
        <li>Sent to our WhatsApp buyer alert list</li>
        <li>Posted to 50+ active Ghana car Facebook groups</li>
        <li>Direct WhatsApp contact between you and buyers</li>
      </ul>
      <h2>How long does it take to sell?</h2>
      <p>
        Most sellers on AutoSell receive their first serious inquiry within 24–48 hours of listing. Cars with good
        photos and a fair price typically sell within 1–2 weeks.
      </p>
      <h2>Tips to sell your car faster</h2>
      <ul>
        <li>
          Price it right — not sure what your car is worth?{" "}
          <a href={valuationWa} className="seo-inline-link" target="_blank" rel="noopener noreferrer">
            Get a FREE valuation on WhatsApp
          </a>
        </li>
        <li>Upload at least 5 clear photos in good lighting</li>
        <li>Be specific: mention mileage, service history, any upgrades</li>
        <li>Respond to buyers quickly — fast replies close deals</li>
      </ul>
      <h2>Listing packages</h2>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Price</th>
              <th>What&apos;s included</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic</td>
              <td>FREE</td>
              <td>Website listing, 7 days</td>
            </tr>
            <tr>
              <td>Promotion</td>
              <td>₵50</td>
              <td>Social media + WhatsApp blast</td>
            </tr>
            <tr>
              <td>Complete</td>
              <td>₵200</td>
              <td>Everything — 60 days, full promotion, priority support</td>
            </tr>
          </tbody>
        </table>
      </div>
      <SeoCtaRow>
        <Link href="/sell" className="btn-primary font-display rounded-lg px-5 py-3 text-sm font-semibold">
          List your car now
        </Link>
        <a
          href={valuationWa}
          className="btn-outline font-display inline-flex rounded-lg px-5 py-3 text-sm font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Free valuation on WhatsApp
        </a>
      </SeoCtaRow>
    </>
  );
}

export function MarketingSeoToyotaBody() {
  return (
    <>
      <p>
        Toyota is the most popular and most trusted car brand in Ghana — and for good reason. Toyotas are reliable,
        fuel-efficient, easy to maintain, and spare parts are readily available at garages across the country.
      </p>
      <p>
        AutoSell.gh lists Toyota vehicles from trusted sellers all over Ghana, including Accra, Kumasi, Takoradi, and
        Tamale.
      </p>
      <h2>Popular Toyota models available on AutoSell</h2>
      <p>
        <strong>Toyota Corolla</strong> — Ghana&apos;s most popular car. Great for city driving, excellent fuel economy,
        and affordable to maintain. Typically priced ₵20,000–₵55,000 depending on year and condition.
      </p>
      <p>
        <strong>Toyota Camry</strong> — A step up in comfort and performance. Popular with professionals. Typically
        ₵35,000–₵80,000.
      </p>
      <p>
        <strong>Toyota RAV4</strong> — The go-to SUV for Ghanaian roads. Handles well on both highways and unmaintained
        roads. Typically ₵45,000–₵120,000.
      </p>
      <p>
        <strong>Toyota Fortuner / Land Cruiser</strong> — Premium 4x4s built for tough terrain. High demand, high value.
      </p>
      <p>
        <strong>Toyota Yaris / Vitz</strong> — Compact, fuel-efficient, and perfect for first-time buyers.
      </p>
      <h2>Before you buy any Toyota in Ghana, check</h2>
      <ul>
        <li>Full service history</li>
        <li>Any accident history</li>
        <li>That the chassis number matches the documents</li>
        <li>Get an independent mechanical inspection</li>
      </ul>
      <p>
        Need help? AutoSell offers <strong>inspection referrals</strong> — we connect you with a trusted mechanic before
        you buy.{" "}
        <a href={toyotaInspectionWa} className="seo-inline-link" target="_blank" rel="noopener noreferrer">
          WhatsApp us
        </a>
      </p>
      <SeoCtaRow>
        <Link href="/cars?make=Toyota" className="btn-primary font-display rounded-lg px-5 py-3 text-sm font-semibold">
          Browse Toyota listings
        </Link>
        <a
          href={toyotaInspectionWa}
          className="btn-outline font-display inline-flex rounded-lg px-5 py-3 text-sm font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Inspection help on WhatsApp
        </a>
      </SeoCtaRow>
    </>
  );
}

export function MarketingSeoValuationBody() {
  return (
    <>
      <p>
        One of the biggest mistakes car sellers make in Ghana is guessing their price. Price too high and your car sits
        for months. Price too low and you lose money you didn&apos;t have to.
      </p>
      <p>
        AutoSell.gh offers a <strong>free car valuation service</strong> — we tell you what your car is realistically
        worth in today&apos;s Ghana market, based on real listings and actual sales.
      </p>
      <h2>How it works</h2>
      <ol>
        <li>WhatsApp us your car details (see below)</li>
        <li>We analyse current Ghana market prices for your make, model, year, and condition</li>
        <li>We send you a realistic price range within a few hours — for FREE</li>
        <li>No obligation to list with us (though we&apos;d love it if you did)</li>
      </ol>
      <h2>Send us these details on WhatsApp</h2>
      <ul>
        <li>Car make and model (e.g. Toyota Corolla)</li>
        <li>Year of manufacture</li>
        <li>Approximate mileage</li>
        <li>Overall condition (Excellent / Good / Fair / Needs work)</li>
        <li>Your location in Ghana</li>
      </ul>
      <h2>Why get a valuation before selling?</h2>
      <ul>
        <li>Avoid sitting on an overpriced listing for months</li>
        <li>Avoid underselling and losing thousands of cedis</li>
        <li>Know your negotiation floor before talking to buyers</li>
        <li>List with confidence from day one</li>
      </ul>
      <p>This service is completely free. No strings attached.</p>
      <SeoCtaRow>
        <a
          href={valuationWa}
          className="btn-whatsapp font-display rounded-lg px-5 py-3 text-sm font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp us for a free valuation
        </a>
        <Link href="/sell" className="btn-outline font-display rounded-lg px-5 py-3 text-sm font-semibold">
          List your car after valuing
        </Link>
      </SeoCtaRow>
    </>
  );
}

export function MarketingSeoDealersBody() {
  return (
    <>
      <p>
        Are you a car dealer, garage, or used car lot in Ghana? AutoSell.gh helps you reach thousands of active buyers
        online — without needing your own website or marketing team.
      </p>
      <h2>The problem most dealers face</h2>
      <p>
        Most car dealers in Ghana rely on word of mouth, one Facebook post, or a roadside display. That limits you to
        the people who walk or drive past. AutoSell puts your inventory in front of buyers actively searching online —
        in Accra, Kumasi, Takoradi, and beyond.
      </p>
      <h2>What dealer partnership with AutoSell includes</h2>
      <ul>
        <li>List your full inventory on autosellgh.com</li>
        <li>Each car gets its own listing page with photos and WhatsApp contact</li>
        <li>Your garage/dealership gets a profile page</li>
        <li>We promote your new arrivals on our social media</li>
        <li>Buyers contact you directly — no commission taken on sales</li>
        <li>Analytics to see how many people viewed your listings</li>
      </ul>
      <h2>Pricing for dealers</h2>
      <ul>
        <li>Up to 5 listings: FREE</li>
        <li>Up to 20 listings: ₵100/month</li>
        <li>Unlimited listings + full promotion: ₵250/month</li>
      </ul>
      <p>
        We currently work with dealers in Accra, Kumasi, Takoradi, Sunyani, and Tamale. New cities being added regularly.
      </p>
      <SeoCtaRow>
        <a
          href={dealerPartnerWa}
          className="btn-primary font-display rounded-lg px-5 py-3 text-sm font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Partner with us on WhatsApp
        </a>
        <Link href="/sell" className="btn-outline font-display rounded-lg px-5 py-3 text-sm font-semibold">
          Start listing on AutoSell
        </Link>
      </SeoCtaRow>
      <p className="text-sm text-[#6B7280]">
        Prefer the web flow? Use our{" "}
        <Link href="/sell" className="seo-inline-link">
          sell / partner listing form
        </Link>{" "}
        on autosellgh.com.
      </p>
    </>
  );
}

export function MarketingSeoRentalPartnersBody() {
  return (
    <>
      <p>
        Do you run a car rental business in Ghana? AutoSell.gh now helps rental partners reach renters actively
        searching online — for cars, with or without a driver, by the day.
      </p>
      <h2>Why list your rental fleet with AutoSell</h2>
      <ul>
        <li>Each vehicle gets its own listing page with photos and a direct WhatsApp enquiry button</li>
        <li>Renters contact you directly — no commission taken on bookings</li>
        <li>Free to list while we grow the rentals marketplace</li>
        <li>Manage your fleet status independently — pause or remove vehicles any time</li>
      </ul>
      <h2>How it works</h2>
      <ol>
        <li>Submit your business info and fleet through our guided signup form</li>
        <li>Our team reviews your submission and approves your business</li>
        <li>Your vehicles go live on AutoSell.gh for renters to browse</li>
      </ol>
      <p>This is completely free for now — no subscription required to get started.</p>
      <SeoCtaRow>
        <Link href="/rent-with-us" className="btn-primary font-display rounded-lg px-5 py-3 text-sm font-semibold">
          List your rental fleet
        </Link>
        <Link href="/rentals" className="btn-outline font-display rounded-lg px-5 py-3 text-sm font-semibold">
          See current rentals
        </Link>
      </SeoCtaRow>
    </>
  );
}
