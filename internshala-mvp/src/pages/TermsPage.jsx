import React from 'react';

const TermsPage = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Terms & Conditions
      </h1>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
        Last Updated: July 14, 2026
      </p>

      {/* Terms Content Wrapper */}
      <div className="flex flex-col gap-12 text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-normal">
        
        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            1. Terms & Conditions
          </h2>
          <p>
            Welcome to IncuXAI Careers ("Platform"). This Platform is owned, operated, and maintained by <strong>IncuXAI Private Limited</strong> ("Company", "we", "us", or "our").
          </p>
          <p>
            By accessing, browsing, registering for, or using the Platform in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions ("Terms"), along with our Privacy Policy. If you do not agree to these Terms, you must immediately cease all access and use of our Platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            2. Registration Data & Account Security
          </h2>
          <p>
            To use certain features of the Platform—including the Resume Builder, applicant Dashboard, Job Alerts, and AI-powered job recommendations—you are required to create a user account.
          </p>
          <p>
            You agree to provide true, accurate, current, and complete registration details and keep them updated. You are solely responsible for maintaining the confidentiality of your account password and username, and you accept liability for all activities that occur under your account.
          </p>
          <p>
            You must immediately notify us at <span className="text-brand-600 dark:text-brand-400 font-semibold">security@incuxai.com</span> if you detect or suspect any unauthorized use of your account or any other breach of security. We will not be liable for losses caused by any unauthorized use of your account.
          </p>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            3. Applicant Data Usage
          </h2>
          <p>
            When you set up your profile, add academic histories, list skills, or generate documents, you grant IncuXAI Careers a license to use this data to perform its services. This includes analyzing skill density to calculate percentage match scores, generating clean downloadable resume templates, and arranging customized dashboard recommendations.
          </p>
          <p>
            Your profile information is handled in accordance with our Privacy Policy. We do not sell your personal data to third parties, and any matching calculations are processed locally to help optimize your career search.
          </p>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            4. Fair Usage Policy
          </h2>
          <p>
            We maintain a strict Fair Usage Policy to keep the Platform secure, fast, and accessible for everyone.
          </p>
          <p>
            You agree not to spam or abuse the Resume Builder, Dashboard, or search endpoints. The use of automated scripts, crawlers, scraper bots, or spiders to harvest listing data, bypass security checks, or overload our hosting servers is strictly prohibited. The Resume Builder and match score metrics must be used responsibly for legitimate, non-commercial personal job application preparation.
          </p>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            5. General Terms & Conditions
          </h2>
          <p>
            While we make reasonable efforts to maintain 24/7 Platform availability, we do not guarantee uninterrupted, secure, or error-free operations. We reserve the right to modify, suspend, or terminate the Platform or any section thereof at any time without notice.
          </p>
          <p>
            You agree to comply with all applicable local, national, and international laws when using the Platform. Respect for other users, administrators, and the integrity of the database is a core requirement for account maintenance.
          </p>
        </section>

        {/* Section 6 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            6. Terms for Applicants
          </h2>
          <p>
            As an applicant on IncuXAI Careers, you agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li>Provide strictly truthful, accurate, and up-to-date credentials, experience histories, and education details in your profile and resume.</li>
            <li>Use the Platform and apply for jobs or internships solely for legitimate, personal career advancement purposes.</li>
            <li>Not impersonate any other person, or register fake email addresses or dummy accounts.</li>
            <li>Not misuse, copy, or redistribute job listings displayed on our Platform to other boards or commercial aggregators.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-rose-500 dark:text-rose-450">
            7. Safety Tips for Applicants
          </h2>
          <p>
            To keep your job search safe and prevent falling victim to malicious hiring scams, we strongly recommend following these guidelines:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-white">Never Pay Money</strong>: IncuXAI Careers and legitimate employers will never ask you to pay any fees for applications, processing, security deposits, interviews, or mandatory training courses. If anyone asks for money, it is a scam.</li>
            <li><strong className="text-slate-800 dark:text-white">Protect Sensitive Credentials</strong>: Never share OTPs, account passwords, bank details, credit card numbers, or sensitive government identity cards with self-proclaimed recruiters.</li>
            <li><strong className="text-slate-800 dark:text-white">Verify Recruitment Domains</strong>: Always make sure that emails from recruiters come from official company domains (e.g. <code>recruitment@company.com</code>) rather than free email services like Gmail, Hotmail, or Yahoo.</li>
            <li><strong className="text-slate-805 dark:text-white">Report Scams</strong>: If you find any suspicious job listing on our Platform, report it immediately to our security team.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            8. Third-Party Job Listings
          </h2>
          <p>
            IncuXAI Careers is an AI-powered aggregation platform. A significant number of the job and internship listings visible on the Platform are automatically aggregated from publicly available sources on the internet.
          </p>
          <p>
            When you click <strong>"View Details"</strong> or <strong>"Apply"</strong>, you are redirected to the employer's official website, recruitment portal, or external applicant tracking system (ATS) to submit your application.
          </p>
          <p>
            IncuXAI Careers does not act as an employer, recruiter, or staffing agent. We do not participate in, screen, or influence hiring decisions, interviews, or the final selection of candidates. We are not party to any contract, negotiation, or agreement between you and the employer. Listing details, requirements, and links may be changed or removed by the respective employers at any time without notice.
          </p>
        </section>

        {/* Section 9 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            9. Disclaimer
          </h2>
          <p>
            THE PLATFORM AND ALL CONTENTS, Aggregated LISTINGS, OR SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
          <p>
            INCUXAI PRIVATE LIMITED DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO: ANY WARRANTY OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE PLATFORM WILL RUN UNINTERRUPTED, WITHOUT DELAYS, OR ERROR-FREE.
          </p>
          <p>
            WE DO NOT GUARANTEE THAT USING THE PLATFORM WILL RESULT IN INTERVIEWS, JOB OFFERS, OR SUCCESSFUL EMPLOYMENT. WE ARE NOT RESPONSIBLE FOR THE CONDUCT, SCHEDULING, PAYMENTS, ACTIONS, OR OMISSIONS OF ANY THIRD-PARTY EMPLOYER OR RECRUITER. YOU AGREE THAT ENTIRE RESPONSIBILITY FOR VERIFYING THIRD-PARTY DETAILS LIES SOLELY WITH YOU.
          </p>
        </section>

        {/* Section 10 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            10. Rights to the Website and its Contents
          </h2>
          <p>
            All intellectual property rights associated with the design, original layout, interface branding, search algorithms, AI matching logic, Resume Builder configurations, and graphics of IncuXAI Careers belong exclusively to <strong>IncuXAI Private Limited</strong>.
          </p>
          <p>
            Third-party trademarks, company names, trade names, branding marks, and job description texts displayed on the Platform remain the sole intellectual property of their respective owners. Their inclusion is purely for informational search reference purposes and does not represent an endorsement, partnership, or affiliation with IncuXAI Careers.
          </p>
        </section>

        {/* Section 11 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            11. Code of Conduct & Prohibited Activities
          </h2>
          <p>
            You agree that you will not:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li>Register false accounts, register multiple active accounts under dummy credentials, or provide deceitful personal summaries.</li>
            <li>Transmit, upload, or email false, misleading, harassing, defamatory, or unlawful materials.</li>
            <li>Attempt to compromise the security, reverse-engineer the source files, or hack any database systems of the Platform.</li>
            <li>Upload malicious software, Trojan horses, spyware, viruses, or file-corrupting codes.</li>
            <li>Abuse, spam, or overload our communication widgets, email newsletters, or matching services.</li>
            <li>Infringe upon the intellectual property or trademarks of the Company or third-party entities.</li>
          </ul>
        </section>

        {/* Section 12 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            12. Trademarks
          </h2>
          <p>
            "IncuXAI Careers", "IncuXAI", and all associated graphics, icons, and logos are official proprietary trademarks of <strong>IncuXAI Private Limited</strong>. You may not copy, display, or use them in commercial listings or other portals without our express written consent.
          </p>
          <p>
            Any other company logos, brand names, or trademarks that appear on the Platform belong to their respective proprietary trademark owners.
          </p>
        </section>

        {/* Section 13 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            13. Indemnity
          </h2>
          <p>
            You agree to indemnify, defend, and hold harmless IncuXAI Private Limited, its parent companies, subsidiaries, directors, officers, employees, and agents from and against any claims, liabilities, losses, damages, costs, and expenses (including legal fees) arising out of:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-medium text-xs text-slate-550 dark:text-slate-400">
            <li>Your misuse of the Platform.</li>
            <li>Your violation of any provision of these Terms & Conditions.</li>
            <li>Your violation of third-party intellectual property, privacy, or employment rights.</li>
          </ul>
        </section>

        {/* Section 14 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            14. Termination
          </h2>
          <p>
            We reserve the right, without liability or prior notice, to restrict, suspend, or terminate your account access to the Resume Builder, Dashboard, and Platform features at our sole discretion if we believe you are in breach of these Terms, have engaged in unlawful or fraudulent actions, or pose security risks to other users.
          </p>
        </section>

        {/* Section 15 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            15. Changes to Site Terms
          </h2>
          <p>
            IncuXAI Private Limited reserves the right to modify or replace these Terms & Conditions at any time. The revision timestamp at the top of the document will reflect updates. Your continued use of the Platform after changes have been published constitutes your binding acceptance of the updated Terms.
          </p>
        </section>

        {/* Section 16 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
            16. Severability & Waiver
          </h2>
          <p>
            If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions will continue in full force and effect.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not operate as a waiver of such right or provision.
          </p>
        </section>

      </div>
    </div>
  );
};

export default TermsPage;
